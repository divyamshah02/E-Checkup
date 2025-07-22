import os
import boto3
import base64

def base64_to_text(b64_text):
    # Decode the Base64 string back to bytes, then to text
    return base64.b64decode(b64_text.encode()).decode()

def create_event_folders_s3(event_name, event_dates):
    """
    Creates an event folder in S3 with subfolders for each event date.
    
    :param event_name: Name of the event.
    :param event_dates: List of event dates in YYYY-MM-DD format.
    :return: Path of the created event folder.
    """
    bucket_name = "sankievents"
    s3 = boto3.client(
            's3',
            aws_access_key_id=base64_to_text('QUtJQTVJSk9YQlFVVEVFNU9NSkI='),
            aws_secret_access_key=base64_to_text('TlIwblU5T0oyQ0lkQm1nRkFXMEk4RTRiT01na3NEVXVPQnJJTU5iNQ=='),
            region_name='eu-north-1'
        )

    # Check if event folder already exists, add a counter if needed
    counter = 1
    event_folder = f"Events/{event_name}/"
    
    # List existing objects in S3 to check for duplicate event names
    existing_folders = {obj['Key'].split('/')[0] for obj in s3.list_objects_v2(Bucket=bucket_name).get('Contents', [])}
    
    original_folder = event_folder
    while event_folder.rstrip('/') in existing_folders:
        event_folder = f"{original_folder.rstrip('/')}_{counter}/"
        counter += 1

    # Create empty object to represent folder in S3
    s3.put_object(Bucket=bucket_name, Key=event_folder)

    # Create subfolders for event dates
    for date in event_dates:
        date_folder = f"{event_folder}{date}/"
        s3.put_object(Bucket=bucket_name, Key=date_folder)

    return f"s3://{bucket_name}/{event_folder}"  # Return full S3 path

def upload_ticket_to_s3_event_folder(uploaded_files, event_folder):
    """Uploads a file to AWS S3, renaming it if a file with the same name exists."""
    bucket_name = "sankievents"
    region_name = 'eu-north-1'
    s3 = boto3.client(
            's3',
            aws_access_key_id=base64_to_text('QUtJQTVJSk9YQlFVVEVFNU9NSkI='),
            aws_secret_access_key=base64_to_text('TlIwblU5T0oyQ0lkQm1nRkFXMEk4RTRiT01na3NEVXVPQnJJTU5iNQ=='),
            region_name=region_name
        )
    error_files = []
    total_files_uploaded = 0
    for uploaded_file in uploaded_files:
        try:
            base_name, extension = os.path.splitext(uploaded_file.name)
            file_name = uploaded_file.name
            s3_key = f"{event_folder}/{file_name}"
            counter = 1

            # Check if file exists and rename if necessary
            while True:
                try:
                    s3.head_object(Bucket=bucket_name, Key=s3_key)
                    # If file exists, update the filename
                    file_name = f"{base_name}({counter}){extension}"
                    s3_key = f"{event_folder}/{file_name}"
                    counter += 1
                except s3.exceptions.ClientError:
                    break  # File does not exist, proceed with upload

            # Upload file
            s3.upload_fileobj(uploaded_file, bucket_name, s3_key)

            # Generate file URL
            file_url = f"https://{bucket_name}.s3.{region_name}.amazonaws.com/{s3_key}"

            total_files_uploaded+=1
        
        except Exception as ex:
            print(ex)
            error_files.append(uploaded_file)

    return total_files_uploaded, error_files

def get_number_of_tickets_in_event_folder(folder_name):
    bucket_name = "sankievents"
    s3 = boto3.client(
            's3',
            aws_access_key_id=base64_to_text('QUtJQTVJSk9YQlFVVEVFNU9NSkI='),
            aws_secret_access_key=base64_to_text('TlIwblU5T0oyQ0lkQm1nRkFXMEk4RTRiT01na3NEVXVPQnJJTU5iNQ=='),
            region_name='eu-north-1'
        )

    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)

    if "Contents" in response:
        return len(response["Contents"])
    else:
        return 0  # No files found

if __name__ == '__main__':
    # Example usage:
    bucket_name = "sankievents"
    event_name = "Nesco"
    event_dates = ["2025-12-12", "2025-12-13"]

    event_folder_path = create_event_folders_s3(event_name, event_dates)
    print(f"Event folder created at: {event_folder_path}")

