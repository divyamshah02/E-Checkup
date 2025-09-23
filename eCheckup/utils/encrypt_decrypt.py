import base64

# Function to encode text to Base64
def text_to_base64(text):
    # Encode the text to bytes, then convert to Base64
    return base64.b64encode(text.encode()).decode()

# Function to decode Base64 back to text
def base64_to_text(b64_text):
    # Decode the Base64 string back to bytes, then to text
    return base64.b64decode(b64_text.encode()).decode()
