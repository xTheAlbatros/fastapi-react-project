"""Task tests"""
from datetime import date

TASKS_URL = "/api/tasks"


def _register_and_login(client, email="taskuser@example.com", password="Secret123"):
    client.post(
        "/api/auth/register",
        json={"email": email, "first_name": "Ala", "last_name": "Nowak", "password": password},
    )
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token}"}


def test_create_task(client):
    _register_and_login(client)
    r = client.post(
        TASKS_URL,
        json={
            "title": "Zrobić zakupy",
            "description": "Kup mleko i chleb",
            "day": str(date.today()),
            "at_time": "10:00:00",
            "color": "red",
            "completed": False,
        },
    )
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "Zrobić zakupy"
    assert data["completed"] is False


def test_get_all_tasks(client):
    _register_and_login(client, email="taskreader@example.com")
    client.post(
        TASKS_URL,
        json={"title": "A", "day": str(date.today()), "completed": False},
    )
    r = client.get(TASKS_URL)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


def test_update_task(client):
    _register_and_login(client, email="taskupdate@example.com")
    r = client.post(TASKS_URL, json={"title": "Do update", "day": str(date.today()), "completed": False})
    assert r.status_code == 201
    task_id = r.json()["id"]

    r = client.put(f"{TASKS_URL}/{task_id}", json={"completed": True, "color": "green"})
    assert r.status_code == 200
    data = r.json()
    assert data["completed"] is True
    assert data["color"] == "green"


def test_filter_by_completed(client):
    _register_and_login(client, email="taskfilterc@example.com")
    client.post(TASKS_URL, json={"title": "done", "day": str(date.today()), "completed": True})
    client.post(TASKS_URL, json={"title": "undone", "day": str(date.today()), "completed": False})

    r = client.get(f"{TASKS_URL}?completed=true")
    assert r.status_code == 200
    assert all(t["completed"] for t in r.json())


def test_filter_by_day(client):
    _register_and_login(client, email="taskfilterd@example.com")
    today = str(date.today())
    client.post(TASKS_URL, json={"title": "today", "day": today})
    r = client.get(f"{TASKS_URL}?day={today}")
    assert r.status_code == 200
    assert all(t["day"] == today for t in r.json())


def test_filter_by_month(client):
    _register_and_login(client, email="taskfilterm@example.com")
    month = date.today().strftime("%Y-%m")
    client.post(TASKS_URL, json={"title": "m", "day": str(date.today())})
    r = client.get(f"{TASKS_URL}?month={month}")
    assert r.status_code == 200
    assert all(t["day"].startswith(month) for t in r.json())


def test_delete_task(client):
    _register_and_login(client, email="taskdelete@example.com")
    r = client.post(TASKS_URL, json={"title": "to delete", "day": str(date.today())})
    assert r.status_code == 201
    task_id = r.json()["id"]

    r = client.delete(f"{TASKS_URL}/{task_id}")
    assert r.status_code == 204