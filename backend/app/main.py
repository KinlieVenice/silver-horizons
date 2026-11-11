"""Silver Horizons backend: Google sign-in (company accounts only) and the site's private content.

OAuth follows the OAuth 2.0 Security BCP (RFC 9700) and the browser-based apps guidance (RFC 10017,
"backend for frontend"): this server is a confidential client that runs the Authorization Code flow with
PKCE, state and an OpenID Connect nonce (all handled by Authlib). Tokens never reach the browser; it
only gets a signed, HttpOnly session cookie holding who signed in.

Only verified Google accounts on ALLOWED_DOMAIN (the Workspace `hd` claim AND the email address) get in.
"""

import json
import os
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, Response
from starlette.concurrency import run_in_threadpool
from starlette.middleware.sessions import SessionMiddleware

from app import evt


def env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if value is None:
        raise RuntimeError(f"Missing required setting {name} (see backend/.env.example)")
    return value


ALLOWED_DOMAIN = env("ALLOWED_DOMAIN", "fireflyelectric.com").lower()
# where the browser lands after signing in or out (the frontend); "" = same origin as this server
FRONTEND_URL = env("FRONTEND_URL", "").rstrip("/")
# explicit callback URL when behind a proxy/other host; default: derived from the incoming request
REDIRECT_URI = os.environ.get("OAUTH_REDIRECT_URI")

# what isn't in the database yet (tips, FAQ, contact, Home's film strip, credits, day titles)
CONTENT = json.loads((Path(__file__).parent / "content.json").read_text(encoding="utf-8"))
EVENT_ID = int(env("EVENT_ID", "1"))  # the event the site shows
CACHE_SECONDS = int(env("CONTENT_CACHE_SECONDS", "60"))

app = FastAPI(title="Silver Horizons API", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(
    SessionMiddleware,
    secret_key=env("SESSION_SECRET"),
    session_cookie="sh_session",
    max_age=7 * 24 * 3600,
    same_site="lax",  # sent on the top-level redirect back from Google, not on cross-site requests
    https_only=env("COOKIE_SECURE", "true").lower() == "true",
)

oauth = OAuth()
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_id=env("GOOGLE_CLIENT_ID"),
    client_secret=env("GOOGLE_CLIENT_SECRET"),
    client_kwargs={"scope": "openid email profile", "code_challenge_method": "S256"},
)


def allowed(claims: dict) -> bool:
    """A verified Google account on the company Workspace domain."""
    email = str(claims.get("email", "")).lower()
    return (
        claims.get("email_verified") is True
        and str(claims.get("hd", "")).lower() == ALLOWED_DOMAIN
        and email.endswith("@" + ALLOWED_DOMAIN)
    )


def safe_next(path: str | None) -> str:
    """Only same-site relative paths, so ?next= can't bounce people to another site."""
    return path if path and path.startswith("/") and not path.startswith("//") and "\\" not in path else "/"


def to_frontend(path: str) -> RedirectResponse:
    return RedirectResponse(FRONTEND_URL + path, status_code=303)


@app.get("/auth/login")
async def login(request: Request, next: str | None = None):
    request.session["next"] = safe_next(next)
    redirect_uri = REDIRECT_URI or str(request.url_for("callback"))
    # hd= only pre-selects the company account in Google's chooser; the real check is in callback()
    return await oauth.google.authorize_redirect(request, redirect_uri, hd=ALLOWED_DOMAIN, prompt="select_account")


@app.get("/auth/callback", name="callback")
async def callback(request: Request):
    next_path = request.session.pop("next", "/")
    try:
        token = await oauth.google.authorize_access_token(request)  # checks state, PKCE, ID token + nonce
    except OAuthError:
        return to_frontend("/?auth_error=cancelled")
    claims = token.get("userinfo") or {}
    if not allowed(claims):
        request.session.clear()
        return to_frontend("/?auth_error=domain")
    request.session.clear()  # fresh session on sign-in
    request.session["user"] = {
        "email": claims["email"].lower(),
        "name": claims.get("name") or claims["email"],
        "picture": claims.get("picture"),
    }
    return to_frontend(next_path)


@app.post("/auth/logout", status_code=204)
async def logout(request: Request):
    request.session.clear()
    return Response(status_code=204)


def current_user(request: Request) -> dict:
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Sign in required")
    return user


@app.get("/api/me")
async def me(user: dict = Depends(current_user)):
    return user


# ponytail: one in-process cache for everyone (no guests/assignments yet, so everyone sees the same itinerary);
# per-person results once assignments apply. An edit in the database shows within CACHE_SECONDS.
_cache = {"at": 0.0, "data": None}


def event_content() -> dict:
    if _cache["data"] is None or time.monotonic() - _cache["at"] > CACHE_SECONDS:
        rows = evt.load(EVENT_ID)
        _cache["data"] = {
            "itinerary": evt.build_itinerary(rows, CONTENT.get("day_titles", {})),
            # reveal_at is Manila time; checked when the cache refreshes, so a reveal shows within CACHE_SECONDS
            "people": evt.build_people(rows, datetime.now(ZoneInfo("Asia/Manila")).replace(tzinfo=None)),
        }
        _cache["at"] = time.monotonic()
    return _cache["data"]


@app.get("/api/content")
async def content(user: dict = Depends(current_user)):
    try:
        from_db = await run_in_threadpool(event_content)
    except Exception as exc:  # database unreachable: a clear 503 rather than a half-empty site
        raise HTTPException(status_code=503, detail="Event data is unavailable right now") from exc
    static = {k: v for k, v in CONTENT.items() if k != "day_titles"}
    return {**static, **from_db}
