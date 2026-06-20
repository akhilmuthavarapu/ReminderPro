from fastapi import APIRouter, Depends, HTTPException
from app.db import get_data, delete_record
from app.auth import get_current_user, check_admin
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users(user: dict = Depends(check_admin)):
    users = get_data("users")
    # Don't return passwords
    for u in users:
        if "password" in u:
            del u["password"]
    return users

@router.delete("/{id}")
def delete_user(id: str, admin: dict = Depends(check_admin)):
    if str(admin["id"]) == str(id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    delete_record("users", id)
    return {"message": "User deleted"}
