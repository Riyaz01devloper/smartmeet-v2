import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Meeting, User
from app.utils.dependencies import get_current_user

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

    return {
        "id": meeting.id,
        "filename": meeting.filename,
        "transcript": meeting.transcript or "",
        "summary": meeting.summary or "",
        "tasks": safe_json_loads(getattr(meeting, "tasks", "[]")),
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
        result.append({
            "id": m.id,
            "filename": m.filename,
            "transcript": m.transcript or "",
            "summary": m.summary or "",
            "tasks": safe_json_loads(getattr(m, "tasks", "[]")),
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

    db.delete(meeting)
    db.commit()

    return {
        "message": "Meeting deleted successfully"
    }
