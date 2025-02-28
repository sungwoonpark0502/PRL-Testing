import requests

# Replace with Misty's IP address
MISTY_IP = "10.134.71.237"  # Replace with Misty's actual IP address

# List of audio files to delete
audio_files = [
    "expression_1.mp3",
    "expression_2.mp3",
    "expression_3.mp3",
    "expression_4.mp3",
    "expression_5.mp3"
]

# Function to delete an audio file
def delete_audio(filename):
    url = f"http://{MISTY_IP}/api/audio"
    data = {"FileName": filename}
    try:
        response = requests.delete(url, json=data)
        if response.status_code == 200:
            print(f"Deleted {filename} successfully!")
        else:
            print(f"Failed to delete {filename}. Status code: {response.status_code}")
            print(f"Response: {response.text}")  # Print the response for debugging
    except Exception as e:
        print(f"Error deleting {filename}: {e}")

# Delete all audio files
for file in audio_files:
    delete_audio(file)