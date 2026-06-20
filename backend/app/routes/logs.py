from fastapi import APIRouter, Depends
from app.db import get_records_by_field, get_data
from app.auth import get_current_user
from typing import List

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
def get_logs(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        return get_data("logs")
    return get_records_by_field("logs", "business_id", user["id"])
