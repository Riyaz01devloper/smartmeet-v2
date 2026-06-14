import os 
from dotenv import load_dotenv
import google.generativeai as genai 

load_dotenv() 

genai.configure(
    api_key = os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

def extract_tasks(transcript):
        prompt = f"""
        Extract all tasks from this meeting transcript.

        Return ONLY valid JSON.

        Example:

       [
        {{
        "task": "Build frontend",
        "owner": "Riyaz",
        "deadline": "Friday"
        }}
      ]

      Transcript:
      {transcript}
       """
        response = model.generate_content(prompt)

        return response.text

 