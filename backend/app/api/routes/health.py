from __future__ import annotations
import asyncio
from datetime import datetime, timezone
import platform
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

START_TIME = time.time()

router = APIRouter(tags=["status"])

@router.get("/api/health")
def health() -> dict[str, str]:
    """Service health check"""
    return {"status": "ok"}


@router.websocket("/ws/status")
async def status_ws(ws: WebSocket) -> None:
    """Service status websocket"""
    await ws.accept()
    try:
        while True:
            now = datetime.now(tz=timezone.utc).isoformat()
            uptime = round(time.time() - START_TIME, 2)
            payload = {
                "status": "ok",
                "datetime_utc": now,
                "uptime_seconds": uptime,
                "python": platform.python_version(),
                "platform": platform.platform(),
            }
            await ws.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        return
