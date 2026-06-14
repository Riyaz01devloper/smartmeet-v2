from dotenv import load_dotenv
import google.generativeai as genai
import os
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_meeting(transcript: str):

    prompt = f"""
Analyze the following meeting transcript and return ONLY valid JSON.

Format:

{{
    "summary": "short summary",
    "tasks": [
        "task 1",
        "task 2"
    ],
    "decisions": [
        "decision 1",
        "decision 2"
    ]
}}

Transcript:
{transcript}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    # Remove markdown code fences if Gemini adds them
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        return json.loads(text)

    except Exception as e:
        print("JSON Parse Error:", e)
        print("Gemini Response:", text)

        return {
            "summary": "AI analysis unavailable",
            "tasks": [],
            "decisions": []
        }