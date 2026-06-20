import pandas as pd
import os
import threading
from typing import List, Dict, Any, Optional
import uuid

# File path
EXCEL_DB = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.xlsx")

# Thread lock for thread-safe access to Excel
db_lock = threading.Lock()

# Initial headers for sheets
SHEETS = {
    "users": ["id", "name", "email", "password", "role"],
    "customers": ["id", "business_id", "name", "phone", "service", "expiry_date"],
    "templates": ["id", "business_id", "message_template"],
    "schedules": ["id", "customer_id", "template_id", "send_date", "status", "business_id"],
    "logs": ["id", "message", "status", "timestamp", "business_id"]
}

def init_db():
    """Initializes the Excel database with dummy data if it doesn't exist."""
    with db_lock:
        if not os.path.exists(EXCEL_DB):
            with pd.ExcelWriter(EXCEL_DB, engine="openpyxl") as writer:
                for sheet_name, columns in SHEETS.items():
                    df = pd.DataFrame(columns=columns)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"Created new Excel DB at {EXCEL_DB}")
        else:
            # Check for missing sheets and add them
            existing_sheets = pd.ExcelFile(EXCEL_DB).sheet_names
            missing_sheets = [s for s in SHEETS if s not in existing_sheets]
            if missing_sheets:
                with pd.ExcelWriter(EXCEL_DB, engine="openpyxl", mode="a", if_sheet_exists="overlay") as writer:
                    for sheet_name in missing_sheets:
                        df = pd.DataFrame(columns=SHEETS[sheet_name])
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"Added missing sheets: {missing_sheets}")

def get_data(sheet_name: str) -> List[Dict[str, Any]]:
    """Reads data from a specified Excel sheet."""
    with db_lock:
        try:
            df = pd.read_excel(EXCEL_DB, sheet_name=sheet_name)
            # Convert all dates to string for JSON serialization
            for col in df.columns:
                if "date" in col.lower() or "timestamp" in col.lower():
                    df[col] = df[col].astype(str)
            return df.to_dict(orient="records")
        except Exception as e:
            print(f"Error reading {sheet_name}: {e}")
            return []

def save_data(sheet_name: str, data: List[Dict[str, Any]]):
    """Overwrites data in a specified Excel sheet."""
    with db_lock:
        try:
            # Read all sheets first to preserve them
            all_sheets = {}
            if os.path.exists(EXCEL_DB):
                xl = pd.ExcelFile(EXCEL_DB)
                for s in xl.sheet_names:
                    all_sheets[s] = pd.read_excel(EXCEL_DB, sheet_name=s)
            
            # Update the specific sheet
            all_sheets[sheet_name] = pd.DataFrame(data)

            # Write everything back
            with pd.ExcelWriter(EXCEL_DB, engine="openpyxl") as writer:
                for s, df in all_sheets.items():
                    df.to_excel(writer, sheet_name=s, index=False)
            return True
        except PermissionError:
            print(f"CRITICAL ERROR: Permission denied for {EXCEL_DB}. Please make sure the file is closed in Excel or other programs.")
            return False
        except Exception as e:
            print(f"Error saving {sheet_name}: {e}")
            return False

def add_record(sheet_name: str, record: Dict[str, Any]):
    """Adds a single record with a unique ID."""
    if "id" not in record or not record["id"]:
        record["id"] = str(uuid.uuid4())
    
    data = get_data(sheet_name)
    data.append(record)
    if save_data(sheet_name, data):
        return record
    return None

def update_record(sheet_name: str, record_id: str, updates: Dict[str, Any]):
    """Updates a record matched by id."""
    data = get_data(sheet_name)
    found = False
    for i, item in enumerate(data):
        if str(item["id"]) == str(record_id):
            data[i].update(updates)
            found = True
            break
    if found:
        save_data(sheet_name, data)
    return found

def delete_record(sheet_name: str, record_id: str):
    """Deletes a record matched by id."""
    data = get_data(sheet_name)
    new_data = [item for item in data if str(item["id"]) != str(record_id)]
    if len(new_data) < len(data):
        save_data(sheet_name, new_data)
        return True
    return False

def get_record_by_id(sheet_name: str, record_id: str):
    """Fetches a record by id."""
    data = get_data(sheet_name)
    for row in data:
        if str(row["id"]) == str(record_id):
            return row
    return None

def get_records_by_field(sheet_name: str, field: str, value: Any):
    """Fetches records by a specific field value."""
    data = get_data(sheet_name)
    return [row for row in data if str(row.get(field)) == str(value)]
