import os
import boto3
import base64

def base64_to_text(b64_text):
    # Decode the Base64 string back to bytes, then to text
    return base64.b64decode(b64_text.encode()).decode()


def upload_file_to_s3(uploaded_file):
    """Uploads a file to AWS S3, renaming it if a file with the same name exists."""
    region_name = "eu-north-1"
    s3_client = boto3.client(
        "s3",
        aws_access_key_id = base64_to_text("QUtJQTVJSk9YQlFVVEVFNU9NSkI="),
        aws_secret_access_key = base64_to_text("TlIwblU5T0oyQ0lkQm1nRkFXMEk4RTRiT01na3NEVXVPQnJJTU5iNQ=="),
        region_name = region_name
    )
    
    bucket_name = "sankievents"
    base_name, extension = os.path.splitext(uploaded_file.name)
    file_name = uploaded_file.name
    s3_key = f"test/{file_name}"
    counter = 1

    # Check if file exists and rename if necessary
    while True:
        try:
            s3_client.head_object(Bucket=bucket_name, Key=s3_key)
            # If file exists, update the filename
            file_name = f"{base_name}({counter}){extension}"
            s3_key = f"test/{file_name}"
            counter += 1
        except s3_client.exceptions.ClientError:
            break  # File does not exist, proceed with upload

    # Upload file
    s3_client.upload_fileobj(uploaded_file, bucket_name, s3_key)

    # Generate file URL
    file_url = f"https://{bucket_name}.s3.{region_name}.amazonaws.com/{s3_key}"

    return file_url


if __name__ == '__main__':
    # Example usage:
    bucket_name = "sankievents"
    # event_name = "Nesco"
    # event_dates = ["2025-12-12", "2025-12-13"]

    # event_folder_path = create_event_folders_s3(event_name, event_dates)
    # print(f"Event folder created at: {event_folder_path}")

