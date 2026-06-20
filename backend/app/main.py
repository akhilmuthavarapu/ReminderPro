from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, customers, templates, schedules, logs, users
from app.db import init_db, get_data, get_records_by_field
from app.scheduler import start_scheduler
from app.auth import get_current_user
from app.models.schemas import Analytics
import uvicorn
import os

app = FastAPI(title="Auto Reminder System API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
@app.on_event("startup")
async def startup_event():
    init_db()
    # Start background scheduler
    start_scheduler()

# Register routes
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(templates.router)
app.include_router(schedules.router)
app.include_router(logs.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Auto Reminder System API is running"}

@app.get("/analytics", response_model=Analytics)
def get_analytics(user: dict = Depends(get_current_user)):
    """Get analytics summary for the logged in user."""
    # Define filters based on role
    def filter_data(data, business_id=None):
        if user["role"] == "admin":
            return data
        return [r for r in data if str(r.get("business_id")) == str(business_id)]

    all_customers = get_data("customers")
    all_templates = get_data("templates")
    all_schedules = get_data("schedules")
    all_users = get_data("users")

    # Logged user context
    my_customers = filter_data(all_customers, user["id"])
    my_templates = filter_data(all_templates, user["id"])
    my_schedules = filter_data(all_schedules, user["id"])

    # Calculate Admin metrics
    business_customers_count = 0
    total_revenue = 0.0
    if user["role"] == "admin":
        business_owners = [u for u in all_users if u.get("role") == "owner"]
        business_customers_count = len(business_owners)
        # Revenue: assuming $1000/year/owner
        total_revenue = float(business_customers_count * 1000)

    return Analytics(
        total_customers=len(my_customers),
        total_templates=len(my_templates),
        pending_schedules=len([s for s in my_schedules if s.get("status") == "pending"]),
        sent_schedules=len([s for s in my_schedules if s.get("status") == "sent"]),
        failed_schedules=len([s for s in my_schedules if s.get("status") == "failed"]),
        total_business_customers=business_customers_count,
        total_revenue=total_revenue
    )

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
# reload force

