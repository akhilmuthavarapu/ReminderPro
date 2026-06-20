from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import TemplateCreate, TemplateUpdate
from app.db import get_records_by_field, add_record, update_record, delete_record, get_record_by_id, get_data
from app.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("/")
def get_templates(user: dict = Depends(get_current_user)):
    if user["role"] == "admin":
        return get_data("templates")
    return get_records_by_field("templates", "business_id", user["id"])

@router.post("/")
def create_template(template: TemplateCreate, user: dict = Depends(get_current_user)):
    new_template = {
        "id": str(uuid.uuid4()),
        "message_template": template.message_template,
        "business_id": user["id"]
    }
    add_record("templates", new_template)
    return new_template

@router.put("/{id}")
def update_template_item(id: str, template: TemplateUpdate, user: dict = Depends(get_current_user)):
    existing = get_record_by_id("templates", id)
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check permission
    if user["role"] != "admin" and str(existing["business_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_record("templates", id, template.dict())
    return {"message": "Template updated"}

@router.delete("/{id}")
def delete_template_item(id: str, user: dict = Depends(get_current_user)):
    existing = get_record_by_id("templates", id)
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check permission
    if user["role"] != "admin" and str(existing["business_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    delete_record("templates", id)
    return {"message": "Template deleted"}
