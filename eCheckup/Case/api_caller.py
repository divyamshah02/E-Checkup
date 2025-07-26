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
    print("🔐 Login:", response.status_code)
    return response.json()


def set_headers():
    csrf_token = get_csrf_token()
    return {
        "X-CSRFToken": csrf_token
    }

def user_details():
    response = session.get(f"{DOMAIN}/user-api/user-detail-api/")    
    return response.json().get("data", [])

def get_users_by_role(role, headers):
    response = session.get(f"{BASE_URL}/staff-list-api/", params={"role": role}, headers=headers)
    data = response.json().get("data", [])
    print(f"👥 {role.capitalize()}s:", [u['user_id'] for u in data])
    return data


def create_case(headers, coordinator_id):
    payload = {
        "case_type": "online",  # Change to 'dc_visit' to simulate DC flow
        "policy_type": "new",
        "policy_number": "POL936895178",
        "sum_assured": "3400000",
        "priority": "normal",
        "due_date": str(datetime.date.today() + datetime.timedelta(days=3)),
        "payment_method": "lic",
        "holder_name": "Ram Shah",
        "holder_phone": "9047931533",
        "holder_email": "ram@example.com",
        "lic_office_code": "BR002",
        "assigned_coordinator_id": coordinator_id,
        "created_by": "HO1234567890"
    }
    response = session.post(f"{BASE_URL}/case-api/", json=payload, headers=headers)
    print("📄 Create Case:", response.status_code, response.text)
    return response.json().get("data", {}).get("case_id")


def assign_user_to_case(case_id, role, user_id, headers):
    response = session.post(f"{BASE_URL}/assign-api/", json={
        "case_id": case_id,
        "role": role,
        "assign_to": user_id
    }, headers=headers)
    print(f"👤 Assign {role}:", response.status_code, response.text)


def schedule_case(case_id, creator_id, headers):
    dt = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    response = session.post(f"{BASE_URL}/schedule-api/", json={
        "case_id": case_id,
        "schedule_time": dt,
        "created_by": creator_id
    }, headers=headers)
    print("📅 Schedule:", response.status_code, response.text)


def upload_video(case_id, headers):
    response = session.post(f"{BASE_URL}/upload-document-api/", json={
        "case_id": case_id,
        "video_url": "https://example.com/video.mp4"
    }, headers=headers)
    print("📹 Upload Video:", response.status_code, response.text)


def upload_report(case_id, headers):
    response = session.put(f"{BASE_URL}/upload-document-api/{case_id}/", json={
        "case_id": case_id,
        "report_url": "https://example.com/report.pdf"
    }, headers=headers)
    print("📄 Upload Report:", response.status_code, response.text)


def submit_to_lic(case_id, headers):
    response = session.put(f"{BASE_URL}/case-api/{case_id}/", json={
        "case_id": case_id,
        "status": "submitted_to_lic"
    }, headers=headers)
    print("📤 Submit to LIC:", response.status_code, response.text)


def get_case_details(case_id, headers):
    response = session.get(f"{BASE_URL}/case-api?case_id={case_id}", headers=headers)
    print("📄 Get Case Details:", response.status_code, response.text)
    return response.json().get("data", {})

def get_cases(headers):
    response = session.get(f"{BASE_URL}/case-api/", headers=headers)
    # print("📄 Get Cases:", response.status_code, response.text)
    return response.json().get("data", [])

def logout(headers):
    response = session.post(f"{DOMAIN}/user-api/logout-api/", headers=headers)
    print("🔓 Logout:", response.status_code)
    # print("Response:", response.text)


def create_case_flow():
    print("\n🔐 Logging in as Admin/HOD...")
    login("divyam@admin.com", "12345")
    headers = set_headers()

    print("\n👥 Getting Coordinators...")
    coordinators = get_users_by_role("coordinator", headers)
    coordinator_id = coordinators[0]['user_id']

    print("\n✅ Creating Case...")
    case_id = create_case(headers, coordinator_id)

    print("\n👥 Getting Telecallers...")
    telecallers = get_users_by_role("telecaller", headers)
    telecaller_id = telecallers[0]['user_id']

    logout(headers)
    login("testcoordinator@example.com", "12345")
    headers = set_headers()    

    print("\n👤 Assigning Telecaller...")
    assign_user_to_case(case_id, "telecaller", telecaller_id, headers)

    # logout(headers)
    # login("testtelecaller@example.com", "12345")
    # headers = set_headers()    

    # print("\n📅 Scheduling (by Telecaller)...")
    # schedule_case(case_id, telecaller_id, headers)

    # print("\n👥 Getting VMER Med Co / DC...")
    # case_type = "online"  # Change to 'dc_visit' for DC flow

    # if case_type == "vmer" or case_type == "online":
    #     users = get_users_by_role("vmer_med_co", headers)
    #     assigned_id = users[0]['user_id']
    #     print("\n👤 Assigning VMER Med Co...")
    #     assign_user_to_case(case_id, "vmer_med_co", assigned_id, headers)

    #     logout(headers)
    #     login("testvmer_med_co@example.com", "12345")
    #     headers = set_headers()        

    #     print("\n📹 Uploading Video...")
    #     upload_video(case_id, headers)

    # elif case_type == "dc_visit":
    #     users = get_users_by_role("diagnostic_center", headers)
    #     assigned_id = users[0]['user_id']
    #     print("\n👤 Assigning DC...")
    #     assign_user_to_case(case_id, "diagnostic_center", assigned_id, headers)

    #     logout(headers)
    #     login("abc@dc.com", "12345")
    #     headers = set_headers()        

    #     print("\n📄 Uploading Report...")
    #     upload_report(case_id, headers)

    # logout(headers)
    # login("divyam@admin.com", "12345")
    # headers = set_headers()

    # print("\n📤 Submitting Case to LIC...")
    # submit_to_lic(case_id, headers)

    print("\n🔓 Logging out...")
    logout(headers)

def user_data():
    login("testcoordinator@example.com", "12345")
    headers = set_headers()
    cases_data = get_cases(headers)
    user_data = user_details()
    print(f"Data of {user_data['name']}")
    for case_status in cases_data.keys():
        print(f"\n📄 Cases with status '{case_status}':")
        for case in cases_data[case_status]:
            print(f"Case ID: {case['case_id']}, Status: {case['status']}, Type: {case['case_type']}")
            # case_details = get_case_details(case['case_id'], headers)
            # print("Details:", case_details)


    logout(headers)
    login("testtelecaller@example.com", "12345")
    headers = set_headers()
    cases_data = get_cases(headers)
    user_data = user_details()
    print(f"Data of {user_data['name']}")
    for case_status in cases_data.keys():
        print(f"\n📄 Cases with status '{case_status}':")
        for case in cases_data[case_status]:
            print(f"Case ID: {case['case_id']}, Status: {case['status']}, Type: {case['case_type']}")
            # case_details = get_case_details(case['case_id'], headers)
            # print("Details:", case_details)


    logout(headers)
    login("testvmer_med_co@example.com", "12345")
    headers = set_headers()
    cases_data = get_cases(headers)
    user_data = user_details()
    print(f"Data of {user_data['name']}")
    for case_status in cases_data.keys():
        print(f"\n📄 Cases with status '{case_status}':")
        for case in cases_data[case_status]:
            print(f"Case ID: {case['case_id']}, Status: {case['status']}, Type: {case['case_type']}")
            # case_details = get_case_details(case['case_id'], headers)
            # print("Details:", case_details)


    logout(headers)
    login("abc@dc.com", "12345")
    headers = set_headers()
    cases_data = get_cases(headers)
    user_data = user_details()
    print(f"Data of {user_data['name']}")
    for case_status in cases_data.keys():
        print(f"\n📄 Cases with status '{case_status}':")
        for case in cases_data[case_status]:
            print(f"Case ID: {case['case_id']}, Status: {case['status']}, Type: {case['case_type']}")
            # case_details = get_case_details(case['case_id'], headers)
            # print("Details:", case_details)


if __name__ == "__main__":
    create_case_flow()

    # user_data()
    
    
