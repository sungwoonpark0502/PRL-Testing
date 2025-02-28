import requests

# Replace with Misty's IP address
MISTY_IP = "10.134.71.237"
UPLOAD_URL = f"http://{MISTY_IP}/api/images"

# List of image files to upload
IMAGE_FILES = ["green_check.png", "red_check.png", "black_check.png"]

def upload_image(file_path):
    """Upload an image file to Misty."""
    try:
        with open(file_path, "rb") as file:
            files = {
                "file": (file_path, file, "image/png")
            }
            data = {
                "FileName": file_path,
                "ImmediatelyApply": "true",
                "OverwriteExisting": "true"
            }
            response = requests.post(UPLOAD_URL, files=files, data=data)
            if response.status_code == 200:
                print(f"Successfully uploaded {file_path} to Misty.")
            else:
                print(f"Failed to upload {file_path}. Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")

# Upload all image files
for image_file in IMAGE_FILES:
    upload_image(image_file)