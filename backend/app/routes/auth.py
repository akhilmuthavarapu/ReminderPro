from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import UserCreate, UserLogin, Token
from app.db import get_data, add_record, get_records_by_field
from app.auth import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from typing import List
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=dict)
def signup(user: UserCreate):
    existing_users = get_records_by_field("users", "email", user.email)
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # First user is admin, others default to staff (or owner if chosen)
    users_count = len(get_data("users"))
    role = user.role
    if users_count == 0:
        role = "admin"
    
    new_user = {
        "id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "password": get_password_hash(user.password),
        "role": role
    }
    
    add_record("users", new_user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin):
    users = get_records_by_field("users", "email", user_credentials.email)
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    user = users[0]
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }
