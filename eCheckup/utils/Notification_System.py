import yagmail
import requests
import firebase_admin
from firebase_admin import credentials, messaging
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email import encoders
import os

# ---------- Helper ----------
def decrypt(b64_text):
    """Decode the Base64 string back to text."""
    return base64.b64decode(b64_text.encode()).decode()


# ---------- EMAIL SENDER ----------
def send_email(recipient_email, subject, message):
    try:
        sender_email = "autoresponse@ericsonhealthcare.com"
        sender_password = decrypt('QUVyaWNzb25oZWFsdGhjYXJlQDEyMw==')

        msg = MIMEText(message, "plain")
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient_email

        # Force a custom local hostname in EHLO
        with smtplib.SMTP_SSL("smtp.rediffmailpro.com", 465, local_hostname="ericsontpa.com") as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [recipient_email], msg.as_string())

        print(f"Email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def send_medical_email(
    recipient_email,
    subject,
    insurance_company,
    intimation_number,
    branch_code,
    proposal_number,
    client_name,
    dob,
    gender,
    contact_number,
    sum_assured,
    medical_test,
    intimation_date,
    appointment_time,
    visit_type,
    client_address
):
    try:
        print(f"Sending mail to - {recipient_email}")
        # recipient_email = 'divyamshah2020@gmail.com'
        sender_email = "autoresponse@ericsonhealthcare.com"
        sender_password = decrypt('QUVyaWNzb25oZWFsdGhjYXJlQDEyMw==')

        # Create HTML body
        html = f"""
        <p>Dear Sir/Mam,</p>
        <p>
            As per discussion have schedule the appointment on <b>{intimation_date}</b>, 
            request you to conduct medical checkup and send all document softcopies via email,
        </p>
        <p>Below is the details,</p>
        <ul>
            <li>Client signature is mandatory on required report</li>
            <li>Please send the Complete report via email at 
                <a href="mailto:pimsmumbai@ericsontpa.com">pimsmumbai@ericsontpa.com</a>
            </li>
            <li>ID Proof and ECG & TMT report should be self-attested by Customer.</li>
            <li>
                GEO-TAGGING is MANDATORY for All Insurers with diagnostic center background 
                - in all Client Photos taken during Medicals - During both - Center Visit and Home Visit
            </li>
        </ul>
        
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; font-family: Arial; font-size: 13px;">
            <tr><td><b>Insurance Company</b></td><td>{insurance_company}</td></tr>
            <tr><td><b>Intimation Number</b></td><td>{intimation_number}</td></tr>
            <tr><td><b>Branch Code</b></td><td>{branch_code}</td></tr>
            <tr><td><b>Proposal Number</b></td><td>{proposal_number}</td></tr>
            <tr><td><b>Client Name</b></td><td>{client_name}</td></tr>
            <tr><td><b>Date Of Birth</b></td><td>{dob}</td></tr>
            <tr><td><b>Gender</b></td><td>{gender}</td></tr>
            <tr><td><b>Client Contact Number</b></td><td>{contact_number}</td></tr>
            <tr><td><b>Sum Assured</b></td><td>{sum_assured}</td></tr>
            <tr><td><b>Medical Test</b></td><td>{medical_test}</td></tr>
            <tr><td><b>Intimation Date</b></td><td>{intimation_date}</td></tr>
            <tr><td><b>Appointment Time</b></td><td>{appointment_time}</td></tr>
            <tr><td><b>Visit Type</b></td><td>{visit_type}</td></tr>
            <tr><td><b>Client Address</b></td><td>{client_address}</td></tr>
        </table>

        <p>Thanks & Regards,<br>Deepti Vipparthi</p>
        """

        # Create message container
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient_email

        # Attach HTML content
        msg.attach(MIMEText(html, "html"))
        attachment_folder = 'Attachments'
        if os.path.isdir(attachment_folder):
            for filename in os.listdir(attachment_folder):
                filepath = os.path.join(attachment_folder, filename)
                if os.path.isfile(filepath):
                    with open(filepath, "rb") as f:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f'attachment; filename="{filename}"',
                        )
                        msg.attach(part)

        # Send email
        with smtplib.SMTP_SSL("smtp.rediffmailpro.com", 465, local_hostname="ericsontpa.com") as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [recipient_email], msg.as_string())

        print(f"Email sent to {recipient_email} ---- medical email")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


# ---------- SMS SENDER ----------
def send_sms(number, message, original_url=None):
    url = "http://buzzify.in/V2/http-api-post.php"
    headers = {"Content-Type": "application/json"}
    if original_url:
        message = str(message).replace(f'{original_url}', 'https://bz1.in/ERITPA/{short}')
    data = {
        "apikey": decrypt('NlRZcjZKTTVNVUlnV3dWdw=='),
        "senderid": "ERITPA",
        "number": number,
        "message": message,
        "shortlink": 1 if original_url else 0,
        "originalurl": original_url if original_url else "https://bz1.in/ERITPA/{short}",
    }
    if original_url is None:
        data.pop("shortlink")
        data.pop("originalurl")

    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        print(response.text)
        response.raise_for_status()
        print(f"SMS sent to {number}")
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False


# ---------- PUSH NOTIFICATION ----------
def send_push(device_id, title, body, image_url=None):
    firebase_config = {
        'type': decrypt("c2VydmljZV9hY2NvdW50"),
        'project_id': decrypt("ZWNoZWNrdXAtNGI4ODI="),
        'private_key_id': decrypt("NDZjMDA4NGU0ZjI0NWY0N2JmOWE3YzFjYmVlZGQwODRlYmU3MjY5Nw=="),
        'private_key': decrypt("LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2QUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktZd2dnU2lBZ0VBQW9JQkFRQ2RySHVsYS9LbjJ4MzcKQS9rY0V6YllObWxUUjJrODhPLzM2cTI1T1lyYmNCRTlsQXEzaEN0QXFEMGxmK1ZaWHFLd1EyYm9nd2N3dGlmSQpKb2VtMVQyK3FwTmx4ZjVxR0R0VW5TZEpPc0FKMXMyZ1JYdThHd3ZkUkJzWnd4Uk5RUThheGU2QXk0SGNWNUI2ClhMcmJka2E1U25jSG1KUTNuSUprZUxoWlRlUEJJeGxQcDk1K3FJSGVGQlJVdmU1Uk5hZzl2aTZSdEJlS3VGM0gKYlJ2TlRFemJZZklSNGF0UjFrdTMvQ2NiZDM3MjBrL0tHYUJ3b051ZUVVTTFhTXBnRW8wNUlsb29pS0lFS3VYcgpJL3R4NUliSnpYWWRKU05zMjNMaVZYSnJlTHJ5L0RkMTB5cXdpb24xMFkrS05sVzVsOERsTUhpdHNaOTRGdjR5CjJmblIzWTJaQWdNQkFBRUNnZ0VBSWxJc3VmWFU1SS9RSjFjV2p2TnB3VWVheHB0cFAzQXNzL2piNXRFdE5oWGYKVXRtYU9aY2wrUldGOWRjd203TDdVOFhnTFNWMFY3aVcwVHo5MHlWZ290T3JjUUJYb0UxMUFMYVNtaUNWTTY4VApwRnJyazZjSmZwajRFelFCQTgzeEZVRlhhS2FqdGt4RE1UZGxIeWRRUHI0RVNkMS9DZG5pRWkrcTVSbU14WG5nCmJSSTl0VWwycytoSlpIZGxEUmJqK0dOcGtuWmU4NTZzdEZWMkhvNXNTWmFwYlFFQmhEemVvYlNTK2RBWWFyQzMKNEJPbnUrZEpYeXZWOUpqbzFZOTk0bjY0VWFzWEtRd1ZveGxHWkh4dEJmTTRYK0g3M0RKZmVIYitDNGtVb054VQoydGxxWE5scURkNTFvNnZZbmlHU0laenV5VzZSWm1UQlpINkh2ejQxZHdLQmdRREtxQXhwZzV2dFVPVmVoR0t0ClhnQ3Frb2JpR2FudTdFaG5reWJuNVJKaVJtVjk4cUwyNmhMYVQyQUNnTWI1Ky9QWkhXYVNORjhncmY0S3lFWjIKcFE4QmV5K0xQWkV0Qm9yQjJadUJuUHRwSHNWV2xVNXdXMjVnbEpya3l2RzBseVdCc3YvTTNJbnNYaC9OMXovNwpWb3BmYXpOaVU5MTZtS1EyaEdXcWZPTTNzd0tCZ1FESExVbllZMzlKay9VQVhRMWFPZlV2V3Nja0JiRlNVSy9KCnBVaEpCMDZRdUdBWVd2V2ZLWjdmWlFSa3UvRHBrVmEwbTVzY1lsOVZ6cXAvYi9zWmhDWWdxOGt0cFFSaGVQN28KUG9ZVzNmdzZRZUJYWkkwMWNDZlZ6YnZmUGdGR1h2clpJTTlPbXc2RUd1Skg1SEp1YWhWZTZETDRXNHVLUFBNMQp4WitMaEJFL2d3S0JnRUZXQnBKcURQWm84MW9Tb21HMGdkQjhaeUkwRmZaaWxVRlhUdDdLbXErMmRIZ3pwdGltClJLZS9tWHVWR3hGemFuMmdIZmFiRGVSU1ZDb1R3YXYwc1M3UUVWYjU1WGszdDdxaHRxSUdBNFF6bUhtK3IwaEkKSWdEZlNFVGxMU0lFN09HdzNRbW1QSTFKRjBYYzFOTHFacmcycnAxUDNvTHMvVnhhT1JETExOSkRBb0dBWWRlcgppUE1IbWx0bVpYRlFsOXdVeDlodUx4SGswNnp6VGJrMTB6b1ZyQjRHaHJCWUxJSERtN1lCL0lJZWpINXErM25kCkxvcGNqc2hoRlEwcmFwTnlMMlowQTBvbTVzTUxaWWNoVTZaa3V6R1ZSUmtPRFF3MVpXQVZSRXN2VVNSalVibysKWER6cldwWGlSckxBUytFczhseGFmWXBxOTlPTkhnTWdwdWFQbW9VQ2dZQldRL0hoMmF1Szl6ODFBQXBWWHRnSQpRdWhHd3pFT2U2clpqTTJRV3FlYVJHZzRIY25ja2FoUlRqS1pMZzFoTHJGMlNWVjdOcUtjRSsrMkFrUXFEa1NnCnl2emgwOFVWdFBPdlRVS0dXMzNZQzlaQTA1eWdSdW5kRlV2Um9GVzRtZ1oxdzZuUG1wa0taTFZwUmNJL2kvM1cKYVdCdGV1eGFZWVgrMGk4anFmU2JCZz09Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K"),
        'client_email': decrypt("ZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAZWNoZWNrdXAtNGI4ODIuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20="),
        'client_id': decrypt("MTE1MDc0NzI1NTk3MDU3MjYxNDg0"),
        'auth_uri': decrypt("aHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGg="),
        'token_uri': decrypt("aHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4="),
        'auth_provider_x509_cert_url': decrypt("aHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRz"),
        'client_x509_cert_url': decrypt("aHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay1mYnN2YyU0MGVjaGVja3VwLTRiODgyLmlhbS5nc2VydmljZWFjY291bnQuY29t"),
        'universe_domain': decrypt("Z29vZ2xlYXBpcy5jb20="),
    }

    if "[DEFAULT]" in firebase_admin._apps:
        firebase_admin.delete_app(firebase_admin.get_app())

    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
            image=image_url,
        ),
        token=device_id,
    )

    try:
        response = messaging.send(message)
        print(f"Push notification sent! Response: {response}")
        firebase_admin.delete_app(firebase_admin.get_app())
        return True
    except Exception as e:
        print(f"Failed to send notification: {e}")
        return False


# ---------- MESSAGE TEMPLATES ----------
def get_welcome_message():
    return """Greetings from Ericson TPA!
Our team will call you for scheduling your appointment for Pre policy health checkup. We seek your kind cooperation.

Thank you.
Regards,
PPHC Dept.
ERICSON TPA"""


def get_scheduled_message(date, time, dc_name, address, gmap_link, contact_number, email_id):
    return f"""Your Pre Policy health checkup has been confirmed on {f'{date}, {time}'},at {dc_name}.You can use shared link for easy reach.  {gmap_link}

Kindly carry original as well as 1 copy of Govt.issued valid ID proof for submission at centre. Absence of ID proof may result into cancellation of checkup.
You can inform us on {contact_number}, or mail us on {email_id}, in case of non visit or wish to cancel/postpone your appointment.

Thank you.
Regards,
PPHC Dept.
ERICSON TPA."""


def get_feedback_message(name, feedback_form_link):
    return f"""Dear {name},
We have been successful in conducting your Pre Policy health checkup. Your report will be submitted directly to insurance company.
Kindly rate us with your experience on {feedback_form_link} Your kind feedback will assist us in improving services.
Thank you.
Regards,
PPHC Dept.
ERICSON TPA."""



def get_non_contact_message(contact_number, email_id):
    return f"""Greetings from Ericson TPA!!
We tried to reach you for scheduling your appointment for Pre-Policy health checkup, on behalf of LIC OF INDIA. It seems you are out of reach.

Kindly contact us on {contact_number} or email us {email_id} with your convenient date & time to call & fix your appointment.
Thank you.
Regards,
PPHC Dept.
ERICSON TPA."""


# ---------- MASTER FUNCTIONS ----------
def send_welcome(recipient_email=None, phone=None, device_id=None):
    msg = get_welcome_message()
    if recipient_email:
        send_email(recipient_email, "Welcome - PPHC", msg)
    if phone:
        send_sms(phone, msg)
    if device_id:
        send_push(device_id, "Welcome - PPHC", msg)


def send_scheduled(date, time, dc_name, address, gmap_link, contact_number, email_id,
                   recipient_email=None, phone=None, device_id=None):
    msg = get_scheduled_message(date, time, dc_name, address, gmap_link, contact_number, email_id)

    if recipient_email:
        send_email(recipient_email, "Appointment Scheduled - PPHC", msg)
    if phone:
        send_sms(phone, msg, original_url=gmap_link)
    if device_id:
        send_push(device_id, "Appointment Scheduled", msg)


def send_feedback(name, feedback_form_link, recipient_email=None, phone=None, device_id=None):
    msg = get_feedback_message(name, feedback_form_link)
    if recipient_email:
        send_email(recipient_email, "Feedback Request - PPHC", msg)
    if phone:
        send_sms(phone, msg, original_url=feedback_form_link)
    if device_id:
        send_push(device_id, "Feedback Request", msg)


def send_non_contact(contact_number, email_id, recipient_email=None, phone=None, device_id=None):
    msg = get_non_contact_message(contact_number, email_id)
    if recipient_email:
        send_email(recipient_email, "Unable to Contact - PPHC", msg)
    if phone:
        send_sms(phone, msg)
    if device_id:
        send_push(device_id, "Unable to Contact", msg)


# ---------- Example Usage ----------
if __name__ == "__main__":
    # Example: send welcome email + sms
    # send_welcome(
    #     recipient_email="divyamshah1234@gmail.com",
    #     # phone="9054413199",
    #     # device_id="cbgzxlcOmEDzlpBFlcVJwX:APA91bGEaqcHpDahTI1rm5tKfyNRjw1PvDnMqhG8_MzzHSsKlHC9ulxCfk-E_4yA8tI-LY0eW0eMA2otFcV8t9Tu1_JZAoixY4Pch_n_GU5Qq_ox8MdyV_k"
    # )

    # Example: send scheduled notification
    # send_scheduled(
    #     date="20-Sep-2025",
    #     time="10:30 AM",
    #     dc_name="ABC Diagnostics",
    #     address="123 Main Street",
    #     gmap_link="https://goo.gl/maps/example",
    #     contact_number="1800-123-456",
    #     email_id="support@ericsonhealthcare.com",
    #     recipient_email="divyamshah1234@gmail.com",
    #     phone="9054413199",
    #     device_id="cbgzxlcOmEDzlpBFlcVJwX:APA91bGEaqcHpDahTI1rm5tKfyNRjw1PvDnMqhG8_MzzHSsKlHC9ulxCfk-E_4yA8tI-LY0eW0eMA2otFcV8t9Tu1_JZAoixY4Pch_n_GU5Qq_ox8MdyV_k"
    # )

    # send_feedback(
    #     name="Divyam Shah",
    #     feedback_form_link="https://forms.gle/example",
    #     recipient_email="divyamshah1234@gmail.com",
    #     phone="9054413199",
    #     device_id="cbgzxlcOmEDzlpBFlcVJwX:APA91bGEaqcHpDahTI1rm5tKfyNRjw1PvDnMqhG8_MzzHSsKlHC9ulxCfk-E_4yA8tI-LY0eW0eMA2otFcV8t9Tu1_JZAoixY4Pch_n_GU5Qq_ox8MdyV_k"
    # )

    send_medical_email(
        recipient_email="divyamshah1234@gmail.com",
        subject="Medical Appointment Intimation",
        insurance_company="LIC OF INDIA",
        intimation_number="58252",
        branch_code="93P",
        proposal_number="1008",
        client_name="SIDDHARTH SATEJ KAMAT",
        dob="10/29/1996",
        gender="M",
        contact_number="9764172721",
        sum_assured="20000000",
        medical_test="CTMT#ECG#HBA1C#HEMO#RUA#SBT13EM#URNCOT#VMER",
        intimation_date="30-Sep-25",
        appointment_time="9:00AM TO 11:00AM",
        visit_type="Centre visit",
        client_address="T-2 SAPPHIRE APTS., VODLEM BHAT TALEIGAO, NORTH GOA."
    )
