from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import *
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    """Register new user"""
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(credentials: UserLogin, db: Session = Depends(get_db)) -> TokenOut:
    """Login that return an access token"""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token(subject=user.email, extra={"uid": user.id})
    return TokenOut(access_token=token)


@router.post("/change-password", status_code=204)
def change_password(
    payload: PasswordChangeIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Change current user password"""
    if not verify_password(payload.old_password, current.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    current.password_hash = hash_password(payload.new_password)
    db.add(current)
    db.commit()


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)) -> UserOut:
    """Return current user profile."""
    return current


@router.put("/me", response_model=UserOut)
def update_me(
    update: UserUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    """Update current user profile properties"""
    if update.first_name is not None:
        current.first_name = update.first_name
    if update.last_name is not None:
        current.last_name = update.last_name
    db.add(current)
    db.commit()
    db.refresh(current)
    return current