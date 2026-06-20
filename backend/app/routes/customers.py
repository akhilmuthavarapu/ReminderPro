from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import CustomerCreate, CustomerUpdate
from app.db import get_records_by_field, add_record, update_record, delete_record, get_record_by_id
from app.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[dict])
def get_customers(user: dict = Depends(get_current_user)):
    from app.db import get_data
    if user["role"] == "admin":
        # Admin sees Business Accounts (the companies using the platform)
        all_users = get_data("users")
        return [u for u in all_users if u.get("role") == "owner"]
    else:
        # Business Owner sees their personal client list
        all_customers = get_data("customers")
        # Ensure we filter by the owner's ID
        business_id = str(user["business_id"] if user.get("business_id") else user["id"])
        return [c for c in all_customers if str(c.get("business_id")) == business_id]

@router.post("/")
def create_customer(customer: CustomerCreate, user: dict = Depends(get_current_user)):
    new_customer = {
        "id": str(uuid.uuid4()),
        "name": customer.name,
        "phone": customer.phone,
        "service": customer.service,
        "expiry_date": customer.expiry_date,
        "business_id": user["id"] # business_id is defined at customer creation context
    }
    if not add_record("customers", new_customer):
        raise HTTPException(status_code=500, detail="Database error (File lock). Make sure data.xlsx is not open in another program.")
    return new_customer

@router.put("/{id}")
def update_customer_item(id: str, customer: CustomerUpdate, user: dict = Depends(get_current_user)):
    existing = get_record_by_id("customers", id)
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check permission
    if user["role"] != "admin" and str(existing["business_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_record("customers", id, customer.dict())
    return {"message": "Customer updated"}

@router.delete("/{id}")
def delete_customer_item(id: str, user: dict = Depends(get_current_user)):
    existing = get_record_by_id("customers", id)
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check permission
    if user["role"] != "admin" and str(existing["business_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    delete_record("customers", id)
    return {"message": "Customer deleted"}
