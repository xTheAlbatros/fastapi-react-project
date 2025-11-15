from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.init_db import init_db
from app.api.routes import auth, tasks, health

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

"""CORS"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""Create DB schema/tables at startup"""
@app.on_event("startup")
def on_startup() -> None:
    init_db()

"""Routers"""
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(health.router)
