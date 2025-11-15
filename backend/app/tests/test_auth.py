"""Authorization tests"""
import pytest

REGISTER_URL = "/api/auth/register"
LOGIN_URL = "/api/auth/login"
ME_URL = "/api/auth/me"
CHANGE_PW_URL = "/api/auth/change-password"


@pytest.fixture(scope="function")
def auth_client(client):
    r = client.post(
        REGISTER_URL,
        json={
            "email": "user@example.com",
            "first_name": "Jan",
            "last_name": "Kowalski",
            "password": "Test1234",
        },
    )
    assert r.status_code in (201, 400)
    r = client.post(LOGIN_URL, json={"email": "user@example.com", "password": "Test1234"})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token}"}
    return client


def test_register_user(client):
    r = client.post(
        REGISTER_URL,
        json={
            "email": "user2@example.com",
            "first_name": "Ala",
            "last_name": "Nowak",
            "password": "Secret123",
        },
    )
    assert r.status_code in (201, 400)


def test_login_user(client):
    r = client.post(LOGIN_URL, json={"email": "user2@example.com", "password": "Secret123"})
    assert r.status_code == 200


def test_get_me(auth_client):
    r = auth_client.get(ME_URL)
    assert r.status_code == 200
    assert r.json()["email"] == "user@example.com"


def test_change_password(auth_client):
    r = auth_client.post(CHANGE_PW_URL, json={"old_password": "Test1234", "new_password": "NoweHaslo123"})
    assert r.status_code == 204


def test_login_with_new_password(client):
    email = "change@example.com"
    old_pw = "Old1234!"
    new_pw = "New1234!"

    r = client.post(
        REGISTER_URL,
        json={"email": email, "first_name": "X", "last_name": "Y", "password": old_pw},
    )
    assert r.status_code in (201, 400)

    r = client.post(LOGIN_URL, json={"email": email, "password": old_pw})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]

    client.headers = {"Authorization": f"Bearer {token}"}
    r = client.post(CHANGE_PW_URL, json={"old_password": old_pw, "new_password": new_pw})
    assert r.status_code == 204, r.text

    client.headers = {}
    r = client.post(LOGIN_URL, json={"email": email, "password": new_pw})
    assert r.status_code == 200, r.text