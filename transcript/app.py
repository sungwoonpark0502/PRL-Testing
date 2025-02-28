# -------------------------------
# Flask Backend:
# - A Flask app is created to handle HTTP requests and WebSocket communication.
# - Routes are defined for starting, stopping, resetting, and saving transcription.
# -------------------------------
from flask import Flask, request, jsonify, send_file, render_template, send_from_directory
from flask_socketio import SocketIO, emit
import speech_recognition as sr
import threading

app = Flask(__name__)
socketio = SocketIO(app)

# -------------------------------
# Speech Recognition:
# - The SpeechRecognition library captures audio from the microphone and transcribes it
# - using Google's Speech-to-Text API.
# -------------------------------
recognizer = sr.Recognizer()
microphone = sr.Microphone()

# Global variables for managing transcription state
transcribed_text = ""
is_transcribing = False
# Language Support: Default is English (US), supports multiple languages via language codes
language = "en-US"  

# -------------------------------
# Threading:
# - Transcription runs in a separate thread to avoid blocking the main Flask server.
# -------------------------------
def transcribe_audio():
    global transcribed_text, is_transcribing, language
    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening...")
        while is_transcribing:
            try:
                # Speech-to-Text conversion using Google's API
                audio = recognizer.listen(source)
                text = recognizer.recognize_google(audio, language=language)
                transcribed_text = text
                print(f"Transcribed: {text}")
                
                # Real-Time Updates via WebSocket:
                # Send updates to all connected clients
                socketio.emit('update_transcription', {'text': text})
                
            except sr.UnknownValueError:
                print("Could not understand audio")
            except sr.RequestError as e:
                print(f"Error: {e}")

# -------------------------------
# RESTful Routes:
# - Handle HTTP requests for controlling transcription and serving the UI
# -------------------------------
@app.route('/')
def index():
    """Serve the main interface page"""
    return render_template('index.html')

@app.route('/start_transcription', methods=['POST'])
def start_transcription():
    """Start transcription with selected language"""
    global is_transcribing, language
    is_transcribing = True
    language = request.json.get('language', 'en-US')
    threading.Thread(target=transcribe_audio, daemon=True).start()
    return jsonify({"status": "Transcription started"})

@app.route('/stop_transcription', methods=['POST'])
def stop_transcription():
    """Stop active transcription"""
    global is_transcribing
    is_transcribing = False
    return jsonify({"status": "Transcription stopped"})

@app.route('/reset_transcription', methods=['POST'])
def reset_transcription():
    """Clear transcription text"""
    global transcribed_text
    transcribed_text = ""
    socketio.emit('update_transcription', {'text': transcribed_text})
    return jsonify({"status": "Transcription reset"})

@app.route('/save_transcription', methods=['GET'])
def save_transcription():
    """Save transcription to text file"""
    global transcribed_text
    with open("transcription.txt", "w") as file:
        file.write(transcribed_text)
    return send_file("transcription.txt", as_attachment=True)

# -------------------------------
# WebSocket Integration:
# - Handle real-time client connections and updates
# -------------------------------
@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connections"""
    print("Client connected")

# -------------------------------
# Main Application Entry Point
# -------------------------------
if __name__ == '__main__':
    # Techniques Used:
    # - WebSocket for real-time communication
    # - Threading for non-blocking operations
    socketio.run(app, debug=True)