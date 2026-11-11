import os

os.environ.update(
    GOOGLE_CLIENT_ID="test-client",
    GOOGLE_CLIENT_SECRET="test-secret",
    SESSION_SECRET="test-session-secret",
    COOKIE_SECURE="false",
)

from fastapi.testclient import TestClient  # noqa: E402

from app.main import allowed, app, safe_next  # noqa: E402

client = TestClient(app)


def test_private_endpoints_need_sign_in():
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/content").status_code == 401


def test_only_verified_company_accounts():
    ok = {"email": "Juan@FireflyElectric.com", "email_verified": True, "hd": "fireflyelectric.com"}
    assert allowed(ok)
    assert not allowed({**ok, "email_verified": False})
    assert not allowed({**ok, "hd": None})  # personal Gmail has no hd claim
    assert not allowed({**ok, "email": "juan@gmail.com"})
    assert not allowed({**ok, "hd": "other.com", "email": "juan@other.com"})
    assert not allowed({**ok, "email": "juan@fireflyelectric.com.evil.com"})


def test_next_stays_on_site():
    assert safe_next("/itinerary") == "/itinerary"
    for bad in [None, "", "https://evil.com", "//evil.com", "/\\evil.com"]:
        assert safe_next(bad) == "/"


def test_login_redirects_to_google_with_pkce():
    r = client.get("/auth/login", params={"next": "/info"}, follow_redirects=False)
    assert r.status_code == 302
    loc = r.headers["location"]
    assert loc.startswith("https://accounts.google.com/")
    for part in ["code_challenge=", "code_challenge_method=S256", "state=", "nonce=", "hd=fireflyelectric.com"]:
        assert part in loc


def test_callback_signs_in_company_accounts_only(monkeypatch):
    """Google's answer is faked; everything after it (domain check, session, redirects) is real."""
    import app.main as m

    def fake_google(claims):
        async def authorize_access_token(request):
            return {"userinfo": claims}
        monkeypatch.setattr(m.oauth.google, "authorize_access_token", authorize_access_token)

    c = TestClient(app)
    fake_google({"email": "juan@gmail.com", "email_verified": True})
    r = c.get("/auth/callback", follow_redirects=False)
    assert r.headers["location"] == "/?auth_error=domain"
    assert c.get("/api/content").status_code == 401

    c.get("/auth/login", params={"next": "/itinerary"}, follow_redirects=False)  # remembers next
    fake_google({"email": "Juan@fireflyelectric.com", "email_verified": True, "hd": "fireflyelectric.com", "name": "Juan"})
    r = c.get("/auth/callback", follow_redirects=False)
    assert r.headers["location"] == "/itinerary"
    assert c.get("/api/me").json()["email"] == "juan@fireflyelectric.com"
    assert "itinerary" in c.get("/api/content").json()

    assert c.post("/auth/logout").status_code == 204
    assert c.get("/api/me").status_code == 401
