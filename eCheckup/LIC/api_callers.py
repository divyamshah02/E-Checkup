import requests

DOMAIN = "http://127.0.0.1:8000"
BASE_URL = f"{DOMAIN}/lic-api"

# Session object to preserve login cookies
session = requests.Session()
csrf_token = None
headers = {}


### 🔐 LOGIN ###
def login(email, password):
    user_api_base = f"{DOMAIN}/user-api"
    response = session.post(f"{user_api_base}/login-api/", json={
        "email": email,
        "password": password
    })
    print("Login Response:", response.status_code)
    return response.json()


def get_csrf_token():
    global csrf_token, headers
    csrf_token = session.cookies.get("csrftoken")
    headers = {"X-CSRFToken": csrf_token}
    print("✅ CSRF Token set:", csrf_token)


### 🔓 LOGOUT ###
def logout():
    user_api_base = f"{DOMAIN}/user-api"
    return session.post(f"{user_api_base}/logout-api/").json()


### 🔁 Generic CRUD for LIC Levels ###
def create_lic_entity(endpoint, payload):
    return session.post(f"{BASE_URL}/{endpoint}-api/", json=payload, headers=headers).json()

def list_lic_entities(endpoint, lic_id=None):
    params = {"id": lic_id} if lic_id else {}
    return session.get(f"{BASE_URL}/{endpoint}-api/", params=params).json()

def update_lic_entity(endpoint, pk, payload):
    return session.put(f"{BASE_URL}/{endpoint}-api/{pk}/", json=payload, headers=headers).json()

# DELETE not used as per your instruction (no deletions for data)


### 🧪 Test Flow ###
if __name__ == "__main__":
    print("\n🔐 Logging in as Admin...")
    print(login("divyam@admin.com", "12345"))

    get_csrf_token()

    ### 1. Head Office
    print("\n🏢 Creating HeadOffice...")
    ho = create_lic_entity("head-office", {
        "lic_id": "HO001",
        "name": "Western HO",
        "address": "Mumbai, India"
    })
    print(ho)

    ### 2. Regional Office
    print("\n🏢 Creating RegionalOffice...")
    ro = create_lic_entity("regional-office", {
        "lic_id": "RO001",
        "name": "Mumbai RO",
        "head_office_id": "HO001",
        "address": "Andheri"
    })
    print(ro)

    ### 3. Divisional Office
    print("\n🏢 Creating DivisionalOffice...")
    do = create_lic_entity("divisional-office", {
        "lic_id": "DO001",
        "name": "Mumbai DO",
        "regional_office_id": "RO001",
        "address": "Dadar"
    })
    print(do)

    ### 4. Branch Office
    print("\n🏢 Creating BranchOffice...")
    br = create_lic_entity("branch-office", {
        "lic_id": "BR001",
        "name": "Bandra Branch",
        "divisional_office_id": "DO001",
        "address": "Bandra East"
    })
    print(br)

    ### 5. Development Officer
    print("\n🧑‍💼 Creating DevelopmentOfficer...")
    dev = create_lic_entity("development-officer", {
        "lic_id": "DEV001",
        "name": "Mr. Shinde",
        "branch_office_id": "BR001",
        "contact_number": "9876543210"
    })
    print(dev)

    ### 6. Agent
    print("\n🧑‍💼 Creating Agent...")
    ag = create_lic_entity("agent", {
        "lic_id": "AGT001",
        "name": "Mr. Pawar",
        "development_officer_id": "DEV001",
        "contact_number": "9123456789"
    })
    print(ag)

    ### 🔍 List all Regional Offices
    print("\n📋 List Regional Offices:")
    print(list_lic_entities("regional-office"))

    ### 🔍 Get a single agent by lic_id
    print("\n📋 Get Agent AGT001:")
    print(list_lic_entities("agent", lic_id="AGT001"))

    print("\n🔓 Logging out...")
    print(logout())
