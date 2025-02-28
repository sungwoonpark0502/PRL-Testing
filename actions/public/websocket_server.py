import asyncio
import websockets
import json
import aiohttp  # For making HTTP requests to Misty's REST API

# Misty's IP address
MISTY_IP = "10.134.71.237"  # Replace with Misty's actual IP address

# List of sentences for Misty to speak
sentences = [
    "This is the first sentence.",
    "This is the second sentence.",
    "This is the third sentence."
]

async def make_misty_speak(sentence):
    """Send a request to Misty's REST API to make her speak."""
    url = f"http://{MISTY_IP}/api/audio/speech"  # Correct endpoint
    data = {
        "Text": sentence,
        "Flush": True
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as response:
            if response.status == 200:
                print(f"Misty is speaking: {sentence}")
            else:
                print(f"Failed to make Misty speak: {await response.text()}")

async def handle_connection(websocket, path):
    print(f"Client connected from path: {path}")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("command") == "start":
                print("Starting sentence playback")
                for i, sentence in enumerate(sentences):
                    # Notify the web interface which sentence is being played
                    await websocket.send(json.dumps({
                        "status": "playing",
                        "sentence_index": i,
                        "sentence": sentence
                    }))

                    # Make Misty speak the sentence
                    await make_misty_speak(sentence)

                    # Wait for the SpeechComplete event
                    while True:
                        response = await websocket.recv()
                        response_data = json.loads(response)
                        if response_data.get("message") == "SpeechComplete":
                            break

                    # Notify the web interface that the sentence is done
                    await websocket.send(json.dumps({
                        "status": "done",
                        "sentence_index": i
                    }))

                    # If not the last sentence, simulate Misty saying "Let's go to the next sentence"
                    if i < len(sentences) - 1:
                        print("Misty says: Let's go to the next sentence")
                        await websocket.send(json.dumps({
                            "status": "next",
                            "message": "Let's go to the next sentence"
                        }))
                        await make_misty_speak("Let's go to the next sentence")

                # Notify the web interface that all sentences are done
                await websocket.send(json.dumps({
                    "status": "complete"
                }))
    except websockets.ConnectionClosed:
        print("Client disconnected")

async def start_server():
    async with websockets.serve(handle_connection, "0.0.0.0", 8765):
        print("WebSocket server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # Run forever

# Start the server
asyncio.run(start_server())