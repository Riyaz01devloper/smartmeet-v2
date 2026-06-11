import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

def generate_summary(transcript):
    
    transcript=transcript[:2000]

    prompt = f"""
    Summarize the following meeting transcript.

    Provide:
    1. Meeting Summary
    2. Key Decisions
    3. Important Points

    Transcript:
    {transcript}
    """

    response = model.generate_content(prompt)

    return response.text