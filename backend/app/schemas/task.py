"""Models for task input/output."""
from __future__ import annotations
from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    day: date
    at_time: Optional[time] = None
    color: Optional[str] = Field(default=None, max_length=20)
    completed: bool = False


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    day: Optional[date] = None
    at_time: Optional[time] = None
    color: Optional[str] = Field(default=None, max_length=20)
    completed: Optional[bool] = None


class TaskOut(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
