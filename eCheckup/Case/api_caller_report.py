import requests

BASE_URL = "http://127.0.0.1:8000/case-api"
LOGIN_URL = "http://127.0.0.1:8000/user-api/login-api/"
LOGOUT_URL = "http://127.0.0.1:8000/user-api/logout-api/"

# Use session to persist CSRF and auth
session = requests.Session()


def login(email, password):
    response = session.post(LOGIN_URL, json={"email": email, "password": password})
    print("Login:", response.status_code, response.text)
    return session.cookies.get("csrftoken")


def download_report(report_type, payload):
    csrf_token = session.cookies.get("csrftoken")
    headers = {
        "X-CSRFToken": csrf_token
    }

    response = session.post(
        f"{BASE_URL}/report-download-api/",
        json={"report_type": report_type, **payload},
        headers=headers,
        stream=True
    )

    if response.status_code == 200:
        filename = response.headers.get("Content-Disposition").split("filename=")[-1]
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Report downloaded: {filename}")
    else:
        print("❌ Failed:", response.status_code, response.text)


def logout():
    response = session.post(LOGOUT_URL)
    print("Logout:", response.status_code, response.text)


if __name__ == "__main__":
    login("divyam@admin.com", "12345")  # Replace with valid admin credentials

    # 1️⃣ DC Invoice
    download_report("dc_invoice", {
        "dc_user_id": "DC2000195299",
        "month": "2025-07"
    })

    # 2️⃣ LIC Invoice
    download_report("lic_invoice", {
        "lic_office_code": "BR001",
        "month": "2025-07"
    })

    # 3️⃣ Coordinator Report
    download_report("coordinator_report", {
        "coordinator_id": "CO1234567890",
        "month": "2025-07"
    })

    logout()
