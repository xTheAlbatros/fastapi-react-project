from __future__ import annotations

from datetime import date
import calendar
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Task, User
from app.db.session import get_db
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db), current: User = Depends(get_current_user)) -> TaskOut:
    """Create task for the current user"""
    task = Task(user_id=current.id, **task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=List[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
    day: Optional[date] = Query(None, description="Filter by specific day (YYYY-MM-DD)"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    month: Optional[str] = Query(None,description="Filter by month (YYYY-MM), e.g. 2025-11",),
) -> list[TaskOut]:
    """
    List tasks for the current user

    Filters:
      - day: exact day (YYYY-MM-DD)
      - completed: true/false
      - month: month window (YYYY-MM)
    """
    q = (
        db.query(Task)
        .filter(Task.user_id == current.id)
        .order_by(Task.day.asc(), Task.at_time.asc().nulls_last())
    )

    if completed is not None:
        q = q.filter(Task.completed == completed)

    if day is not None:
        q = q.filter(Task.day == day)
    elif month is not None:
        try:
            year_str, month_str = month.split("-", 1)
            year_i = int(year_str)
            month_i = int(month_str)
            if not (1 <= month_i <= 12):
                raise ValueError
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.") from exc

        last_day = calendar.monthrange(year_i, month_i)[1]
        month_start = date(year_i, month_i, 1)
        month_end = date(year_i, month_i, last_day)
        q = q.filter(Task.day.between(month_start, month_end))

    return q.all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)) -> TaskOut:
    """Get task by id"""
    task = db.query(Task).filter(Task.user_id == current.id, Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, update: TaskUpdate, db: Session = Depends(get_db), current: User = Depends(get_current_user)) -> TaskOut:
    """Update task by id"""
    task = db.query(Task).filter(Task.user_id == current.id, Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in update.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)) -> None:
    """Delete task by id"""
    task = db.query(Task).filter(Task.user_id == current.id, Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
