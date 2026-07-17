from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
from pydantic import BaseModel
import uuid

from app.db.database import get_db
from app.db.models import Staff, StaffRole
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.dependencies import get_current_user, get_db_session

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class StaffCreate(BaseModel):
    username: str
    password: str
    role: StaffRole = StaffRole.CASHIER

class StaffResponse(BaseModel):
    id: uuid.UUID
    username: str
    role: StaffRole
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=StaffResponse)
async def register_staff(user_in: StaffCreate, db: AsyncSession = Depends(get_db_session)) -> Any:
    """
    Temporarily open endpoint to create staff accounts. 
    In production, this should be locked behind require_role([StaffRole.ADMIN]).
    """
    result = await db.execute(select(Staff).where(Staff.username == user_in.username))
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The staff with this username already exists in the system.",
        )
    user = Staff(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db_session), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    result = await db.execute(select(Staff).where(Staff.username == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=StaffResponse)
async def read_current_user(current_user: Staff = Depends(get_current_user)) -> Any:
    return current_user
