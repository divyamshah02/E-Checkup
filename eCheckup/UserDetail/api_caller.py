import requests

DOMAIN = "http://127.0.0.1:8000"
BASE_URL = f"{DOMAIN}/user-api"

global csrf_token
# Session object to preserve login cookies
session = requests.Session()

def get_csrf_token():
    print("Cookies:", session.cookies.get_dict())  # Should show 'csrftoken'
    return session.cookies.get("csrftoken")

### 🔐 LOGIN ###
def login(email, password):
    response = session.post(f"{BASE_URL}/login-api/", json={
        "email": email,
        "password": password
    })
    print("Login Response:", response.status_code, response.text)    
    return response.json()


### 🔓 LOGOUT ###
def logout():
    response = session.post(f"{BASE_URL}/logout-api/")
    return response.json()


### ✅ CREATE USER ###
def create_user(payload: dict):
    response = session.post(f"{BASE_URL}/user-api/", json=payload, headers=headers)
    return response.json()


### 🧾 LIST USERS ###
def get_users(role=None, user_id=None):
    params = {}
    if role:
        params['role'] = role
    if user_id:
        params['user_id'] = user_id

    response = session.get(f"{BASE_URL}/user-api/", params=params)
    return response.json()


### ✏️ UPDATE USER ###
def update_user(user_pk, payload: dict):
    response = session.put(f"{BASE_URL}/user-api/{user_pk}/", json=payload, headers=headers)
    return response.json()


### ❌ DELETE USER ###
def delete_user(user_pk):
    response = session.delete(f"{BASE_URL}/user-api/{user_pk}/")
    return response.json()


### 🔑 CHANGE PASSWORD ###
def change_password(user_id, new_password):
    response = session.post(f"{BASE_URL}/change-password-api/", json={
        "user_id": user_id,
        "new_password": new_password
    }, headers=headers)
    return response.json()


# ✅ Sample Testing
if __name__ == "__main__":
    print("\n🔐 Logging in as Admin...")
    print(login("divyam@admin.com", "12345"))

    csrf_token = get_csrf_token()
    headers = {
        "X-CSRFToken": csrf_token,
    }

    print("\n✅ Creating normal user...")
    user_payload = {
        "name": "Test VMER Med Co",
        "password": "12345",
        "contact_number": "9992299449",
        "email": "testvmer_med_co@example.com",
        "role": "vmer_med_co"
    }
    print(create_user(user_payload))

    # print("\n📄 Listing all users...")
    # print(get_users())

    # print("\n📄 Listing users by role...")
    # print(get_users(role="coordinator"))

    # print("\n📄 Get user by ID...")
    # print(get_users(user_id="CO1234567890"))  # Replace with real user_id

    # print("\n✏️ Updating user...")
    # print(update_user(user_pk=2, payload={
    #     "name": "Updated Name",
    #     "contact_number": "8888888888",
    #     "email": "updated@example.com"
    # }))

    # print("\n🔑 Changing password of user...")
    # print(change_password("CO1234567890", "newpass2024"))  # Replace with real user_id

    # # print("\n🗑️ Deleting user...")
    # # print(delete_user(user_pk=2))  # Replace with actual user PK

    # print("\n🔓 Logging out...")
    # print(logout())
