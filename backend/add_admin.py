import pandas as pd
import openpyxl

file = 'data.xlsx'
try:
    with pd.ExcelWriter(file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        # Read existing users
        try:
            users = pd.read_excel(file, sheet_name='users')
        except:
            users = pd.DataFrame(columns=['id', 'name', 'email', 'password', 'role'])
            
        # Add new admin
        new_user = {
            'id': 'admin-001', 
            'name': 'Super Admin', 
            'email': 'admin@autoremind.com', 
            'password': '$2b$12$4XAC.9qwkZ/l7iLL7mxtT.9vcr9yIHUNFUgtl6KjJb7R4zvrxdXCy', 
            'role': 'admin'
        }
        
        # Check if already exists
        if not any(users['email'] == new_user['email']):
            users = pd.concat([users, pd.DataFrame([new_user])], ignore_index=True)
            users.to_excel(writer, sheet_name='users', index=False)
            print("Admin user added successfully")
        else:
            print("Admin user already exists")
except Exception as e:
    print(f"Error: {e}")
