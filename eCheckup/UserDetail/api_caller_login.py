import requests
import datetime

DOMAIN = "http://127.0.0.1:8000"
BASE_URL = f"{DOMAIN}/case-api"

session = requests.Session()


def get_csrf_token():
    return session.cookies.get("csrftoken")

def login(email, password):
    response = session.post(f"{DOMAIN}/user-api/login-api/", json={
        "email": email,
        "password": password
    })
    print(f"🔐 {email} Login:", response.status_code)
    
    # Example success response - {'success': True, 'user_does_not_exist': False, 'wrong_password': False, 'error': None, 'data': {'user_id': 'divyam'}}
    # Example wrong password response - {'success': False, 'user_does_not_exist': False, 'wrong_password': True, 'error': None}
    # Example user doesnot exists response - {'success': False, 'user_does_not_exist': True, 'wrong_password': False, 'error': None}
    
    return response.json()


def set_headers():
    csrf_token = get_csrf_token()
    return {
        "X-CSRFToken": csrf_token
    }


def logout(headers):
    response = session.post(f"{DOMAIN}/user-api/logout-api/", headers=headers)
    print("🔓 Logout:", response.status_code)
    # print("Response:", response.text)




if __name__ == "__main__":
    login("divyam@admin.com", "12345")
    headers = set_headers()
    logout(headers)

    # login("testcoordinator@example.com", "12345")
    # headers = set_headers()
    # logout(headers)

    # login("testtelecaller@example.com", "12345")
    # headers = set_headers()
    # logout(headers)

    # login("testvmer_med_co@example.com", "12345")
    # headers = set_headers()
    # logout(headers)

    # login("abc@dc.com", "12345")
    # headers = set_headers()
    # logout(headers)
