import requests
import json

MISTY_IP = "10.134.71.237"  # Replace with Misty's IP address

def change_expression(expression_name):
    url = f"http://{MISTY_IP}/api/expressions"
    with open("expressions.json") as f:
        expressions = json.load(f)["expressions"]
    expression = next(e for e in expressions if e["name"] == expression_name)
    data = {
        "face": expression["face"],
        "arms": expression["arms"],
        "head": expression["head"],
        "led": expression["led"]
    }
    response = requests.post(url, json=data)
    print(f"Changed expression to {expression_name}: {response.status_code}")

def play_audio(filename):
    url = f"http://{MISTY_IP}/api/audio/play"
    files = {'file': open(filename, 'rb')}
    response = requests.post(url, files=files)
    print(f"Playing audio {filename}: {response.status_code}")

def move(direction):
    url = f"http://{MISTY_IP}/api/drive"
    data = {"direction": direction, "speed": 50}
    response = requests.post(url, json=data)
    print(f"Moving {direction}: {response.status_code}")

def stop():
    url = f"http://{MISTY_IP}/api/stop"
    response = requests.post(url)
    print(f"Stopped: {response.status_code}")

def delete_file(filename):
    url = f"http://{MISTY_IP}/api/files/delete"
    data = {"filename": filename}
    response = requests.post(url, json=data)
    print(f"Deleted file {filename}: {response.status_code}")