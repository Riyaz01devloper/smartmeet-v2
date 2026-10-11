import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in the environment.")
    return Groq(api_key=api_key)


def transcribe_audio(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found at {file_path}")

    # Check file size (Groq limit is 25 MB)
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb > 25:
        raise ValueError(f"Audio file size ({file_size_mb:.1f} MB) exceeds Groq's 25 MB limit.")

    client = get_groq_client()
    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3"
        )

    return transcription.text or ""