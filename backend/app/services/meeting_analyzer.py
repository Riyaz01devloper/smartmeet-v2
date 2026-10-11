import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Fallback model list if gemini-2.5-flash fails or deprecated
DEFAULT_MODEL_NAME = "gemini-2.5-flash"


def get_model():
    return genai.GenerativeModel(DEFAULT_MODEL_NAME)


def analyze_meeting(transcript: str) -> dict:
    fallback_result = {
        "summary": "Transcript processed but detailed analysis could not be generated.",
        "tasks": [],
        "decisions": []
    }

    if not transcript or not transcript.strip():
        return {
            "summary": "Empty transcript provided.",
            "tasks": [],
            "decisions": []
        }

    prompt = f"""
Analyze the following meeting transcript and return ONLY valid JSON without markdown wrapping.

JSON schema:
{{
    "summary": "Concise summary of the meeting",
    "tasks": [
        "Action item 1",
        "Action item 2"
    ],
    "decisions": [
        "Key decision 1",
        "Key decision 2"
    ]
}}

Transcript:
{transcript}
"""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        text = response.text.strip() if response and response.text else ""

        # Remove markdown fences if present
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE).strip()

        # Try direct parse
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return {
                    "summary": str(parsed.get("summary", "")),
                    "tasks": list(parsed.get("tasks", [])),
                    "decisions": list(parsed.get("decisions", []))
                }
        except Exception:
            # Fallback: extract json block using regex
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if isinstance(parsed, dict):
                    return {
                        "summary": str(parsed.get("summary", "")),
                        "tasks": list(parsed.get("tasks", [])),
                        "decisions": list(parsed.get("decisions", []))
                    }

        # If parsing completely failed, use raw text as summary
        fallback_result["summary"] = text[:500] if text else fallback_result["summary"]
        return fallback_result

    except Exception as e:
        print("Analysis error:", e)
        fallback_result["summary"] = f"Analysis temporarily unavailable: {str(e)[:150]}"
        return fallback_result