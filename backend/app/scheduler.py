import time
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.db import get_data, update_record, add_record, get_record_by_id
import uuid

def send_sms_simulated(phone, message):
    """Sends a real SMS using Twilio gateway with user's credentials."""
    print(f"--- DISPATCHING REAL SMS VIA TWILIO ---")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print(f"----------------------------------------")
    
    # Twilio Credentials
    account_sid = "AC901983374cceb3346cefe3afe6e98872"
    auth_token = "db645b9effc267478def338be34fddd1"
    twilio_number = "+17174209486"
    
    # Ensure E.164 format
    phone_clean = str(phone).strip()
    if not phone_clean.startswith("+"):
        if phone_clean.startswith("1") and len(phone_clean) == 11:
            phone_clean = f"+{phone_clean}"
        elif len(phone_clean) == 10:
            phone_clean = f"+91{phone_clean}"
        else:
            # General fallback to add "+" prefix
            phone_clean = f"+{phone_clean}"
        
    from twilio.rest import Client
    try:
        client = Client(account_sid, auth_token)
        twilio_msg = client.messages.create(
            body=message,
            from_=twilio_number,
            to=phone_clean
        )
        print(f"Successfully sent SMS via Twilio, SID: {twilio_msg.sid}")
        return True
    except Exception as e:
        print(f"Failed to send SMS via Twilio: {e}")
        return False


def process_reminders():
    print(f"[{datetime.now()}] Checking for pending reminders...")
    schedules = get_data("schedules")
    now = datetime.now()
    
    for schedule in schedules:
        if schedule["status"] == "pending":
            try:
                # send_date is expected to be ISO format string
                send_date = datetime.fromisoformat(schedule["send_date"])
                if send_date <= now:
                    # Fetch dependencies
                    customer = get_record_by_id("customers", schedule["customer_id"])
                    template = get_record_by_id("templates", schedule["template_id"])
                    
                    if not customer or not template:
                        print(f"Error: Customer or Template missing for schedule {schedule['id']}")
                        update_record("schedules", schedule["id"], {"status": "failed"})
                        continue
                        
                    # Prepare message
                    business_id = schedule.get("business_id")
                    business_user = get_record_by_id("users", business_id)
                    merchant_name = business_user.get("name", "our store") if business_user else "our store"
                    
                    message = template["message_template"]
                    message = message.replace("{{name}}", customer["name"])
                    message = message.replace("{{service}}", str(customer.get("service", "")))
                    message = message.replace("{{expiry_date}}", str(customer.get("expiry_date", "")))
                    message = message.replace("{{merchant}}", merchant_name)
                    message = message.replace("{{merchant_name}}", merchant_name)
                    message = message.replace("{{business_name}}", merchant_name)
                    
                    # Send message
                    success = send_sms_simulated(customer["phone"], message)
                    
                    if success:
                        update_record("schedules", schedule["id"], {"status": "sent"})
                        # Log it
                        add_record("logs", {
                            "id": str(uuid.uuid4()),
                            "message": f"Sent reminder to {customer['name']} ({customer['phone']})",
                            "status": "success",
                            "timestamp": datetime.now().isoformat(),
                            "business_id": schedule["business_id"]
                        })
                    else:
                        update_record("schedules", schedule["id"], {"status": "failed"})
                        add_record("logs", {
                            "id": str(uuid.uuid4()),
                            "message": f"Failed to send reminder to {customer['name']}",
                            "status": "failed",
                            "timestamp": datetime.now().isoformat(),
                            "business_id": schedule["business_id"]
                        })
            except Exception as e:
                print(f"Error processing schedule {schedule['id']}: {e}")
                update_record("schedules", schedule["id"], {"status": "failed"})

def check_three_day_expiries():
    print(f"[{datetime.now()}] Running 3-day client expiry check scheduler...")
    try:
        from datetime import date
        today = date.today()
        customers = get_data("customers")
        logs = get_data("logs")
        today_str = today.isoformat()
        
        for customer in customers:
            expiry_str = customer.get("expiry_date")
            if not expiry_str:
                continue
            
            try:
                # Clean date string if it contains time components
                if " " in str(expiry_str):
                    expiry_str = str(expiry_str).split(" ")[0]
                expiry_date = date.fromisoformat(str(expiry_str))
            except ValueError:
                continue
                
            days_left = (expiry_date - today).days
            
            # Send daily once if expiry is in 1, 2, or 3 days
            if 0 < days_left <= 3:
                # Check duplicate sends today
                already_sent = False
                for log in logs:
                    timestamp = log.get("timestamp", "")
                    if str(timestamp).startswith(today_str):
                        expected_msg = f"Auto Expiry Reminder sent to {customer['name']}"
                        if expected_msg in str(log.get("message", "")):
                            already_sent = True
                            break
                            
                if already_sent:
                    print(f"  [Reminder Bypass] Already notified {customer['name']} today.")
                    continue
                    
                business_id = customer.get("business_id")
                from app.db import get_records_by_field
                templates = get_records_by_field("templates", "business_id", business_id)
                
                if not templates:
                    print(f"  [Warning] No templates found for business owner {business_id}. Skipping customer {customer['name']}.")
                    continue
                    
                service = customer.get("service", "")
                selected_template = None
                
                # Match template by service name (case-insensitive keyword matching)
                for t in templates:
                    msg = t.get("message_template", "")
                    if str(service).lower() in str(msg).lower():
                        selected_template = t
                        break
                        
                if not selected_template:
                    selected_template = templates[0]
                    
                # Fetch merchant name
                from app.db import get_record_by_id
                business_user = get_record_by_id("users", business_id)
                merchant_name = business_user.get("name", "our store") if business_user else "our store"
                
                # Compile template
                message = selected_template["message_template"]
                message = message.replace("{{name}}", customer["name"])
                message = message.replace("{{service}}", str(service))
                message = message.replace("{{expiry_date}}", str(expiry_str))
                message = message.replace("{{merchant}}", merchant_name)
                message = message.replace("{{merchant_name}}", merchant_name)
                message = message.replace("{{business_name}}", merchant_name)
                
                # Send simulated SMS
                success = send_sms_simulated(customer["phone"], message)
                
                if success:
                    # Write schedule record
                    add_record("schedules", {
                        "id": str(uuid.uuid4()),
                        "customer_id": customer["id"],
                        "template_id": selected_template["id"],
                        "send_date": datetime.now().isoformat(),
                        "status": "sent",
                        "business_id": business_id
                    })
                    
                    # Log audit log
                    add_record("logs", {
                        "id": str(uuid.uuid4()),
                        "message": f"Auto Expiry Reminder sent to {customer['name']} ({customer['phone']}) for {service}",
                        "status": "success",
                        "timestamp": datetime.now().isoformat(),
                        "business_id": business_id
                    })
                    print(f"  [Success] Sent auto reminder for {customer['name']} (expiry in {days_left} days)")
                    
    except Exception as e:
        print(f"Error executing 3-day client expiry check: {e}")

import threading

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Run process_reminders immediately then every 60s
    scheduler.add_job(process_reminders, 'interval', seconds=60)
    # Run check_three_day_expiries daily at 9:00 AM
    scheduler.add_job(check_three_day_expiries, 'cron', hour=9, minute=0)
    scheduler.start()
    
    # Run startup test execution in background thread
    threading.Thread(target=check_three_day_expiries, daemon=True).start()
    
    return scheduler

