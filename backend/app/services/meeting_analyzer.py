import os
import json
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

DEFAULT_MODEL_NAME = "gemini-2.5-flash"


def get_model():
    return genai.GenerativeModel(DEFAULT_MODEL_NAME)


def normalize_tasks(raw_tasks: Any) -> List[Dict[str, Any]]:
    """Normalize tasks output whether Gemini returns strings or dicts."""
    normalized = []
    if not isinstance(raw_tasks, list):
        return normalized

    for item in raw_tasks:
        if isinstance(item, str) and item.strip():
            normalized.append({
                "title": item.strip(),
                "description": "",
                "assignee": None,
                "due_date": None,
                "priority": "Medium"
            })
        elif isinstance(item, dict):
            title = str(item.get("title") or item.get("task") or "").strip()
            if not title:
                continue
            normalized.append({
                "title": title,
                "description": str(item.get("description") or "").strip(),
                "assignee": item.get("assignee") if item.get("assignee") else None,
                "due_date": item.get("due_date") if item.get("due_date") else None,
                "priority": item.get("priority", "Medium") if item.get("priority") in ["Low", "Medium", "High"] else "Medium"
            })
    return normalized


def analyze_meeting(transcript: str) -> dict:
    """Analyze a meeting transcript to extract summary, action items, and key decisions."""
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
Analyze the following meeting transcript and extract intelligence.
Return ONLY valid JSON matching this schema exactly without markdown formatting:

{{
    "summary": "Concise executive summary of the meeting",
    "tasks": [
        {{
            "title": "Action item title",
            "description": "Brief description of the task",
            "assignee": "Name of assigned person, or null if not explicitly mentioned",
            "due_date": "Due date if explicitly mentioned, or null if not mentioned",
            "priority": "High, Medium, or Low"
        }}
    ],
    "decisions": [
        "Key decision 1",
        "Key decision 2"
    ]
}}

CRITICAL RULES:
1. Do NOT invent or fabricate an assignee or due date if not explicitly stated in the transcript.
2. If no decisions were made, return an empty array for decisions.
3. If no action items were assigned, return an empty array for tasks.

Transcript:
{transcript}
"""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        text = response.text.strip() if response and response.text else ""

        # Remove markdown fences
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE).strip()

        parsed = None
        try:
            parsed = json.loads(text)
        except Exception:
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))

        if isinstance(parsed, dict):
            raw_tasks = parsed.get("tasks", [])
            tasks = normalize_tasks(raw_tasks)
            decisions = [str(d).strip() for d in parsed.get("decisions", []) if str(d).strip()]
            summary = str(parsed.get("summary", "")).strip()

            return {
                "summary": summary,
                "tasks": tasks,
                "decisions": decisions
            }

        fallback_result["summary"] = text[:500] if text else fallback_result["summary"]
        return fallback_result

    except Exception as e:
        print("Analysis error:", e)
        fallback_result["summary"] = f"Analysis temporarily unavailable: {str(e)[:150]}"
        return fallback_result


def chunk_transcript(transcript: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    """Split transcript into overlapping chunks."""
    if len(transcript) <= chunk_size:
        return [transcript]
    chunks = []
    start = 0
    while start < len(transcript):
        end = start + chunk_size
        chunks.append(transcript[start:end])
        start += chunk_size - overlap
    return chunks


def score_chunk_relevance(chunk: str, query: str) -> float:
    """Calculate keyword and phrase relevance score for a chunk against user query."""
    query_words = set(re.findall(r"\w+", query.lower()))
    if not query_words:
        return 0.0
    chunk_lower = chunk.lower()
    score = 0.0
    for word in query_words:
        if len(word) > 2 and word in chunk_lower:
            score += chunk_lower.count(word) * (len(word) ** 0.5)
    return score


def chat_with_meeting(
    filename: str,
    transcript: str,
    summary: str,
    decisions: List[str],
    tasks: List[Dict[str, Any]],
    query: str,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """Grounded AI Q&A assistant for a meeting."""
    if not transcript and not summary:
        return {
            "reply": "No transcript or summary is available for this meeting to answer your question.",
            "cited_excerpts": []
        }

    # Context retrieval
    cited_excerpts = []
    if len(transcript) <= 12000:
        transcript_context = transcript
    else:
        chunks = chunk_transcript(transcript)
        scored_chunks = [(score_chunk_relevance(c, query), c) for c in chunks]
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        # Take top 6 chunks
        top_chunks = [c for s, c in scored_chunks[:6] if s > 0]
        if not top_chunks:
            top_chunks = chunks[:4]
        transcript_context = "\n---\n".join(top_chunks)

    # Format decisions and tasks context
    decisions_str = "\n".join([f"- {d}" for d in decisions]) if decisions else "None recorded"
    tasks_str = "\n".join([
        f"- {t.get('title') or t.get('task')} (Assignee: {t.get('assignee') or 'Unassigned'}, Due: {t.get('due_date') or 'Not specified'}, Priority: {t.get('priority', 'Medium')})"
        for t in tasks
    ]) if tasks else "None recorded"

    formatted_history = ""
    if history:
        for msg in history[-6:]:  # Keep recent history
            role = "User" if msg.get("role") == "user" else "Assistant"
            formatted_history += f"{role}: {msg.get('content')}\n"

    system_prompt = f"""
You are an intelligent, fact-grounded meeting assistant for the meeting titled "{filename}".
Your task is to answer user questions about this specific meeting accurately and objectively.

CRITICAL GROUNDING RULES:
1. Base your answer STRICTLY on the meeting transcript, summary, recorded decisions, and action items provided below.
2. NEVER fabricate, assume, or hallucinate decisions, deadlines, participants, or tasks that are not supported by the meeting text.
3. If the provided meeting context DOES NOT contain the answer, state clearly: "Based on the meeting transcript and records, this was not discussed or mentioned."
4. Always cite specific verbatim quotes or excerpts from the transcript when relevant (e.g., Quote: "...").
5. Clearly distinguish verified facts from any AI interpretation or suggestion.
6. Keep your answers concise, clear, and well-structured using Markdown.

MEETING CONTEXT:
Summary:
{summary}

Recorded Decisions:
{decisions_str}

Action Items:
{tasks_str}

Transcript Excerpts:
{transcript_context}

Previous Conversation:
{formatted_history}

User Question:
{query}
"""

    try:
        model = get_model()
        response = model.generate_content(system_prompt)
        reply = response.text.strip() if response and response.text else "I could not generate an answer based on this meeting."

        # Extract quotes cited in reply for highlighting
        quote_matches = re.findall(r'["“]([^"”]{15,180})["”]', reply)
        for q in quote_matches:
            if q in transcript and q not in cited_excerpts:
                cited_excerpts.append(q)

        return {
            "reply": reply,
            "cited_excerpts": cited_excerpts[:4]
        }
    except Exception as e:
        print("Meeting chat error:", e)
        return {
            "reply": f"Sorry, I encountered an error while analyzing the meeting: {str(e)}",
            "cited_excerpts": []
        }