from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ScheduleCreate
from app.db import get_records_by_field, add_record, update_record, delete_record, get_record_by_id, get_data
from app.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.get("/")
def get_schedules(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        return get_data("schedules")
    return get_records_by_field("schedules", "business_id", user["id"])

@router.post("/")
def create_schedule(schedule: ScheduleCreate, user: dict = Depends(get_current_user)):
    new_schedule = {
        "id": str(uuid.uuid4()),
        "customer_id": schedule.customer_id,
        "template_id": schedule.template_id,
        "send_date": schedule.send_date,
        "status": "pending",
        "business_id": user["id"]
    }
    
    # Validation: template and customer exist
    from app.db import get_record_by_id
    if not get_record_by_id("customers", schedule.customer_id):
        raise HTTPException(status_code=400, detail="Customer not found")
    if not get_record_by_id("templates", schedule.template_id):
        raise HTTPException(status_code=400, detail="Template not found")
        
    add_record("schedules", new_schedule)
    return new_schedule

@router.delete("/{id}")
def delete_schedule_item(id: str, user: dict = Depends(get_current_user)):
    existing = get_record_by_id("schedules", id)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Check permission
    if user["role"] != "admin" and str(existing["business_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    delete_record("schedules", id)
    return {"message": "Schedule deleted"}
