import os
import json
import re
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.db import get_db
from app.database.models import Meeting, User, ActionItem
from app.schemas.chat import MeetingChatRequest, MeetingChatResponse
from app.utils.dependencies import get_current_user
from app.services.meeting_analyzer import chat_with_meeting, get_model

router = APIRouter()


def safe_json_loads(val: str | None, default=None):
    if default is None:
        default = []
    if not val:
        return default
    try:
        parsed = json.loads(val)
        return parsed if isinstance(parsed, list) else default
    except Exception:
        return default


# ----------------------------------------------------
# 1. Meeting CRUD
# ----------------------------------------------------

@router.get("/meeting/{meeting_id}")
def get_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    # Fetch structured action items from action_items table
    db_tasks = db.query(ActionItem).filter(
        ActionItem.meeting_id == meeting_id,
        ActionItem.user_id == current_user.id
    ).order_by(ActionItem.id.asc()).all()

    if db_tasks:
        serialized_tasks = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description or "",
                "assignee": t.assignee,
                "due_date": t.due_date,
                "priority": t.priority or "Medium",
                "status": t.status or "Pending",
                "completed_at": t.completed_at.isoformat() if t.completed_at else None
            }
            for t in db_tasks
        ]
    else:
        # Fallback to json tasks stored in meeting.tasks
        serialized_tasks = safe_json_loads(getattr(meeting, "tasks", "[]"))

    return {
        "id": meeting.id,
        "filename": meeting.filename,
        "transcript": meeting.transcript or "",
        "summary": meeting.summary or "",
        "tasks": serialized_tasks,
        "decisions": safe_json_loads(getattr(meeting, "decisions", "[]")),
        "created_at": meeting.created_at.isoformat() if getattr(meeting, "created_at", None) else None
    }


@router.get("/meetings")
def get_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meetings = (
        db.query(Meeting)
        .filter(Meeting.user_id == current_user.id)
        .order_by(Meeting.id.desc())
        .all()
    )

    result = []
    for m in meetings:
        # Count tasks
        task_count = db.query(ActionItem).filter(
            ActionItem.meeting_id == m.id,
            ActionItem.user_id == current_user.id
        ).count()

        result.append({
            "id": m.id,
            "filename": m.filename,
            "transcript": m.transcript or "",
            "summary": m.summary or "",
            "tasks": safe_json_loads(getattr(m, "tasks", "[]")),
            "task_count": task_count,
            "decisions": safe_json_loads(getattr(m, "decisions", "[]")),
            "created_at": m.created_at.isoformat() if getattr(m, "created_at", None) else None
        })

    return result


@router.delete("/meeting/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    # Clean up file on disk if it exists
    if meeting.file_path and os.path.exists(meeting.file_path):
        try:
            os.remove(meeting.file_path)
        except Exception as e:
            print(f"Warning: could not delete file {meeting.file_path}: {e}")

    # Delete related action items
    db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).delete()

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully"
    }


# ----------------------------------------------------
# 2. Feature One: Chat with Meeting
# ----------------------------------------------------

@router.post("/meeting/{meeting_id}/chat", response_model=MeetingChatResponse)
def meeting_chat(
    meeting_id: int,
    request: MeetingChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found or unauthorized access."
        )

    # Fetch action items
    action_items = db.query(ActionItem).filter(
        ActionItem.meeting_id == meeting_id
    ).all()

    tasks_context = [
        {
            "title": a.title,
            "description": a.description,
            "assignee": a.assignee,
            "due_date": a.due_date,
            "priority": a.priority,
            "status": a.status
        }
        for a in action_items
    ] if action_items else safe_json_loads(meeting.tasks)

    decisions_context = safe_json_loads(meeting.decisions)

    # Generate grounded response
    result = chat_with_meeting(
        filename=meeting.filename,
        transcript=meeting.transcript or "",
        summary=meeting.summary or "",
        decisions=decisions_context,
        tasks=tasks_context,
        query=request.message,
        history=[msg.model_dump() for msg in request.history] if request.history else []
    )

    return {
        "reply": result["reply"],
        "cited_excerpts": result.get("cited_excerpts", []),
        "meeting_id": meeting.id
    }


# ----------------------------------------------------
# 3. Feature Three: Cross-Meeting Intelligence
# ----------------------------------------------------

@router.get("/meetings/search-intelligence")
def search_cross_meeting_intelligence(
    q: str = Query(..., min_length=2, description="Search query across meetings"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    search_term = q.strip().lower()
    meetings = db.query(Meeting).filter(
        Meeting.user_id == current_user.id
    ).order_by(Meeting.id.desc()).all()

    matched_results = []
    cross_context_snippets = []

    for m in meetings:
        filename = m.filename or ""
        summary = m.summary or ""
        transcript = m.transcript or ""
        decisions = safe_json_loads(m.decisions)

        # Check action items for this meeting
        tasks = db.query(ActionItem).filter(
            ActionItem.meeting_id == m.id
        ).all()
        task_titles = [t.title for t in tasks]

        # Check match in filename, summary, decisions, tasks, or transcript
        matched_excerpts = []
        is_match = False

        if search_term in filename.lower():
            is_match = True
            matched_excerpts.append(f"Title: {filename}")

        if search_term in summary.lower():
            is_match = True
            matched_excerpts.append(f"Summary: {summary[:250]}...")

        for dec in decisions:
            if search_term in dec.lower():
                is_match = True
                matched_excerpts.append(f"Decision: {dec}")

        for t in tasks:
            if search_term in t.title.lower() or (t.description and search_term in t.description.lower()):
                is_match = True
                matched_excerpts.append(f"Action Item: {t.title} ({t.status})")

        # Search transcript for occurrences
        if search_term in transcript.lower():
            is_match = True
            # Find surrounding snippet
            idx = transcript.lower().find(search_term)
            start_idx = max(0, idx - 100)
            end_idx = min(len(transcript), idx + 200)
            snippet = transcript[start_idx:end_idx].strip()
            matched_excerpts.append(f"Transcript Quote: \"...{snippet}...\"")

        if is_match:
            matched_results.append({
                "meeting_id": m.id,
                "filename": m.filename,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "summary": summary[:200] + "..." if len(summary) > 200 else summary,
                "matched_excerpts": matched_excerpts[:3]
            })
            cross_context_snippets.append(
                f"Meeting: '{m.filename}' (ID: {m.id}):\n" + "\n".join(matched_excerpts[:3])
            )

    # If matches found, generate AI Cross-Meeting synthesis
    ai_synthesis = ""
    if matched_results and len(cross_context_snippets) > 0:
        context_block = "\n\n".join(cross_context_snippets[:6])
        prompt = f"""
You are an AI meeting intelligence system analyzing queries across multiple meetings.
User Question: "{q}"

Relevant excerpts from user's meetings:
{context_block}

Answer the user's question clearly and concisely by synthesizing across the matching meetings.
RULES:
1. Cite specific meeting names where each piece of information was found.
2. If there are conflicting decisions or unresolved tasks across meetings, highlight them.
3. Keep the response to 2-3 structured paragraphs in Markdown.
"""
        try:
            model = get_model()
            res = model.generate_content(prompt)
            if res and res.text:
                ai_synthesis = res.text.strip()
        except Exception as e:
            print("Cross-meeting synthesis notice:", e)

    return {
        "query": q,
        "total_matches": len(matched_results),
        "ai_synthesis": ai_synthesis,
        "meetings": matched_results
    }


# ----------------------------------------------------
# 4. Feature Four: Dashboard Metrics & Intelligence
# ----------------------------------------------------

@router.get("/analytics/dashboard")
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meetings = db.query(Meeting).filter(
        Meeting.user_id == current_user.id
    ).order_by(Meeting.id.desc()).all()

    total_meetings = len(meetings)
    total_words = 0
    total_decisions = 0

    for m in meetings:
        if m.transcript:
            total_words += len(m.transcript.split())
        decisions = safe_json_loads(m.decisions)
        total_decisions += len(decisions)

    # Action Items stats
    all_tasks = db.query(ActionItem).filter(
        ActionItem.user_id == current_user.id
    ).all()

    total_tasks = len(all_tasks)
    pending_tasks = sum(1 for t in all_tasks if t.status == "Pending")
    in_progress_tasks = sum(1 for t in all_tasks if t.status == "In Progress")
    completed_tasks = sum(1 for t in all_tasks if t.status == "Completed")

    # Calculate overdue tasks (has due_date, status != Completed, and due_date parsed as before today)
    today_iso = date.today().isoformat()
    overdue_tasks = 0
    for t in all_tasks:
        if t.status != "Completed" and t.due_date:
            due_clean = t.due_date.strip()
            # If in YYYY-MM-DD format
            if re.match(r"^\d{4}-\d{2}-\d{2}$", due_clean):
                if due_clean < today_iso:
                    overdue_tasks += 1

    # Recent 5 meetings
    recent_meetings = [
        {
            "id": m.id,
            "filename": m.filename,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "summary": m.summary[:150] + "..." if m.summary and len(m.summary) > 150 else (m.summary or ""),
            "word_count": len(m.transcript.split()) if m.transcript else 0
        }
        for m in meetings[:5]
    ]

    # Recent 5 pending tasks with meeting title
    recent_tasks_query = (
        db.query(ActionItem)
        .join(Meeting, ActionItem.meeting_id == Meeting.id)
        .filter(
            ActionItem.user_id == current_user.id,
            ActionItem.status != "Completed"
        )
        .order_by(ActionItem.id.desc())
        .limit(5)
        .all()
    )

    recent_tasks = [
        {
            "id": t.id,
            "title": t.title,
            "meeting_id": t.meeting_id,
            "meeting_title": t.meeting.filename if t.meeting else "Untitled",
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date
        }
        for t in recent_tasks_query
    ]

    return {
        "total_meetings": total_meetings,
        "total_words": total_words,
        "total_decisions": total_decisions,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks,
        "recent_meetings": recent_meetings,
        "recent_tasks": recent_tasks
    }
