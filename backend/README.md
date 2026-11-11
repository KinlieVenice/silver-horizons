# Silver Horizons backend

FastAPI: Google sign-in for `@fireflyelectric.com` accounts only, and the site's private content
(`app/content.json`: itinerary, gala program, tips, FAQ, contact), served only to signed-in visitors.

OAuth design (per the OAuth 2.0 Security BCP, RFC 9700, and the browser-based apps guidance, RFC 10017):
this server is the OAuth client ("backend for frontend"). It runs the Authorization Code flow with PKCE,
state and an OpenID Connect nonce; Google's tokens never reach the browser, which only gets a signed,
HttpOnly session cookie (7 days).

## One-time Google setup (needs a FELCO Google Workspace admin or project owner)

1. Google Cloud Console → create/choose a project.
2. APIs & Services → OAuth consent screen → User type **Internal** (only FELCO Workspace accounts can
   even reach the consent screen; the backend checks the domain again regardless).
3. Credentials → Create credentials → OAuth client ID → **Web application**.
   Authorized redirect URI: `http://localhost:5199/auth/callback` (add the production URL later).
4. Copy the client ID and secret into `backend/.env` (see `.env.example`).

## Run locally

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET
.venv/bin/uvicorn app.main:app --port 8000 --env-file .env

# other terminal: the site, which proxies /api and /auth to the backend
cd frontend && npm run dev -- --port 5199
```

Open http://localhost:5199 and sign in.

## Tests

```bash
.venv/bin/python -m pytest -q
```

## Production (to decide)

GitHub Pages can't run this backend. Serve the site and the backend from one domain (e.g. the backend
also serves `frontend/dist`, or both behind one reverse proxy) so the session cookie stays first-party;
set `COOKIE_SECURE=true` and add the production callback URL in Google Cloud.
