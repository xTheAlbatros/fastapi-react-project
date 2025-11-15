"""Websocket and health check tests"""
import json
from fastapi.testclient import TestClient

def test_health_endpoint(client: TestClient):
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"


def test_websocket_status(client: TestClient):
    with client.websocket_connect("/ws/status") as ws:
        data = ws.receive_text()
        parsed = json.loads(data)
        assert parsed["status"] == "ok"
        assert "datetime_utc" in parsed