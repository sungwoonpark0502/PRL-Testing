import requests
import os

# Replace with Misty's IP address
MISTY_IP = "10.134.71.237"  # Replace with Misty's actual IP address

# Directory containing the audio files
audio_dir = "audio_files"

# List of audio files to upload
audio_files = [
    "expression_1.mp3",
    "expression_2.mp3",
    "expression_3.mp3",
    "expression_4.mp3",
    "expression_5.mp3"
]

# Function to upload a file to Misty
def upload_file(filename):
    url = f"http://{MISTY_IP}/api/audio"
    filepath = os.path.join(audio_dir, filename)
    try:
        with open(filepath, 'rb') as file:
            # Include the 'FileName' parameter in the request
            files = {'file': (filename, file, 'audio/mpeg')}
            data = {'FileName': filename}  # Add the 'FileName' parameter
            response = requests.post(url, files=files, data=data)
            if response.status_code == 200:
                print(f"Uploaded {filename} successfully!")
            else:
                print(f"Failed to upload {filename}. Status code: {response.status_code}")
                print(f"Response: {response.text}")  # Print the response for debugging
    except Exception as e:
        print(f"Error uploading {filename}: {e}")

# Upload all audio files
for file in audio_files:
    upload_file(file)