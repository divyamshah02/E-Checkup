import requests

DOMAIN = "http://127.0.0.1:8000"
BASE_URL = f"{DOMAIN}/case-api"

session = requests.Session()

def get_csrf_token():
    return session.cookies.get("csrftoken")

def login(email, password):
    response = session.post("http://127.0.0.1:8000/user-api/login-api/", json={
        "email": email,
        "password": password
    })
    print("Login Response:", response.status_code, response.text)
    return response.json()

def create_diagnostic_center(payload: dict):
    csrf_token = get_csrf_token()
    headers = {"X-CSRFToken": csrf_token}
    response = session.post(f"{BASE_URL}/diagnostic-center-api/", json=payload, headers=headers)
    print("Create DC Response:", response.status_code, response.text)
    return response.json()


# ✅ Sample Execution
if __name__ == "__main__":
    print("🔐 Logging in as Admin...")
    login("divyam@admin.com", "12345")

    print("📤 Creating Diagnostic Center...")
    payload = {
        "name": "ABC Diagnostic Hub",
        "email": "abc@dc.com",
        "password": "12345",
        "contact_person": "Dr. Shah",
        "contact_number": "9876543210",
        "address": "123 Station Road",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380007"
    }

    create_diagnostic_center(payload)
