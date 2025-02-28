from gtts import gTTS
import os

# Create a directory to store the audio files
audio_dir = "audio_files"
os.makedirs(audio_dir, exist_ok=True)

def generate_tts(text, filename):
    """
    Generate a TTS audio file and save it to the specified directory.
    """
    try:
        # Generate TTS audio
        tts = gTTS(text=text, lang='en')
        filepath = os.path.join(audio_dir, filename)
        
        # Save the audio file
        tts.save(filepath)
        print(f"Generated audio file: {filepath}")

        # Validate the file size
        file_size = os.path.getsize(filepath) / 1024  # Size in KB
        if file_size > 5000:  # Misty's file size limit is typically 5 MB
            print(f"Warning: {filename} is too large ({file_size:.2f} KB). Consider reducing the bitrate.")
        else:
            print(f"File size is within limits: {file_size:.2f} KB")

    except Exception as e:
        print(f"Error generating {filename}: {e}")

# Generate audio files for expressions
expressions = [
    "Oppa Gangnam Style",  # Action 1: Neutral expression
    "Ronaldo is better than Messi in football",  # Action 2: Happy expression
    "Wow, this is so exciting!",  # Action 3: Surprised expression
    "Oppa Gangnam Style Yeah Yeah Yeah",  # Action 4: Confused expression
    "I'm feeling sleepy and need some rest."  # Action 5: Sleeping expression
]

for i, text in enumerate(expressions):
    generate_tts(text, f"expression_{i+1}.mp3")