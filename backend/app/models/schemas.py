from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "staff"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class CustomerBase(BaseModel):
    name: str
    phone: str
    service: str
    expiry_date: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class TemplateBase(BaseModel):
    message_template: str

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class ScheduleBase(BaseModel):
    customer_id: str
    template_id: str
    send_date: str
    status: str = "pending"

class ScheduleCreate(ScheduleBase):
    pass

class LogBase(BaseModel):
    message: str
    status: str
    timestamp: str

class Analytics(BaseModel):
    total_customers: int
    total_templates: int
    pending_schedules: int
    sent_schedules: int
    failed_schedules: int
    total_business_customers: Optional[int] = 0
    total_revenue: Optional[float] = 0.0
