import requests
from datetime import datetime, timedelta

DOMAIN = "http://127.0.0.1:8000"
BASE_URL = DOMAIN

session = requests.Session()

# Login
print("\n🔐 Logging in as HOD...")
hod = session.post(f"{BASE_URL}/user-api/login-api/", json={
    "email": "hod@example.com",
    "password": "12345"
})
print(hod.json())

csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

# Create case
print("\n📁 Creating new VMER case...")
create_payload = {
    "case_type": "vmer",
    "policy_type": "new",
    "policy_number": "LIC12345678",
    "sum_assured": "500000",
    "priority": "urgent",
    "due_date": "2025-08-30",
    "payment_method": "lic",
    "holder_name": "Ramesh Mehta",
    "holder_phone": "9876543210",
    "holder_email": "ramesh@test.com",
    "lic_office_code": "BR1234",
    "assigned_coordinator_id": "CO1234567890"
}
res = session.post(f"{BASE_URL}/case-api/", json=create_payload, headers=headers)
case_data = res.json().get("data")
print(case_data)
case_id = case_data['case_id']

# Login as Coordinator
print("\n🔐 Logging in as Coordinator...")
co = session.post(f"{BASE_URL}/user-api/login-api/", json={
    "email": "coord@test.com",
    "password": "12345"
})
csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

# Assign telecaller
print("\n📞 Assigning telecaller...")
assign_tc_payload = {
    "case_id": case_id,
    "assign_to": "TC1234567890",
    "role": "telecaller"
}
print(session.post(f"{BASE_URL}/assign-api/", json=assign_tc_payload, headers=headers).json())

# Login as Telecaller
print("\n🔐 Logging in as Telecaller...")
tele = session.post(f"{BASE_URL}/user-api/login-api/", json={
    "email": "tele@test.com",
    "password": "12345"
})
csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

# Schedule video call
print("\n📅 Scheduling video call for VMER...")
schedule_payload = {
    "case_id": case_id,
    "schedule_time": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S"),
    "reason": "Initial scheduling"
}
print(session.post(f"{BASE_URL}/schedule-api/", json=schedule_payload, headers=headers).json())

# Assign VMER Med Co
print("\n👨‍⚕️ Assigning VMER Medical Coordinator...")
assign_medco_payload = {
    "case_id": case_id,
    "assign_to": "VM1234567890",
    "role": "vmer_med_co"
}
print(session.post(f"{BASE_URL}/assign-api/", json=assign_medco_payload, headers=headers).json())

# Login as VMER Med Co and upload video
print("\n🔐 Logging in as VMER Med Co...")
vm = session.post(f"{BASE_URL}/user-api/login-api/", json={
    "email": "vmer@test.com",
    "password": "12345"
})
csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

print("\n📹 Uploading video url...")
print(session.put(f"{BASE_URL}/case-api/", json={
    "case_id": case_id,
    "video_url": "https://s3.amazonaws.com/test-bucket/video1.mp4"
}, headers=headers).json())

# Login as Coordinator again to submit
print("\n🔐 Logging back as Coordinator...")
co = session.post(f"{BASE_URL}/user-api/login-api/", json={
    "email": "coord@test.com",
    "password": "12345"
})
csrf_token = session.cookies.get("csrftoken")
headers = {"X-CSRFToken": csrf_token}

print("\n📤 Submitting case to LIC...")
print(session.put(f"{BASE_URL}/case-api/", json={
    "case_id": case_id,
    "status": "submitted_to_lic"
}, headers=headers).json())
