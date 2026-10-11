import os
import shutil
import uuid
import json
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Meeting, User, ActionItem
from app.utils.dependencies import get_current_user
from app.services.whisper_service import transcribe_audio
from app.services.meeting_analyzer import analyze_meeting

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".webm"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

UPLOAD_DIR = os.path.join("uploads", "audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload."
        )

    # Validate file extension
    clean_original_name = os.path.basename(file.filename)
    _, ext = os.path.splitext(clean_original_name)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Secure unique file path to prevent path traversal & filename collision
    unique_filename = f"{uuid.uuid4().hex[:12]}_{clean_original_name}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validate file size
        file_size = os.path.getsize(file_path)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 25 MB ({file_size / (1024 * 1024):.1f} MB)."
            )

        # Transcribe audio with Groq Whisper
        try:
            transcript = transcribe_audio(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Audio transcription failed: {str(e)}"
            )

        # Analyze transcript with Gemini
        analysis = analyze_meeting(transcript)
        summary = analysis.get("summary", "")
        tasks = analysis.get("tasks", [])
        decisions = analysis.get("decisions", [])

        # Persist meeting in database
        meeting = Meeting(
            filename=clean_original_name,
            file_path=file_path,
            transcript=transcript,
            summary=summary,
            tasks=json.dumps(tasks),
            decisions=json.dumps(decisions),
            user_id=current_user.id
        )
        db.add(meeting)
        db.commit()
        db.refresh(meeting)

        # Persist structured action items in action_items table
        for t in tasks:
            title = t.get("title") if isinstance(t, dict) else str(t)
            desc = t.get("description", "") if isinstance(t, dict) else ""
            assignee = t.get("assignee") if isinstance(t, dict) else None
            due = t.get("due_date") if isinstance(t, dict) else None
            prio = t.get("priority", "Medium") if isinstance(t, dict) else "Medium"

            action_item = ActionItem(
                meeting_id=meeting.id,
                user_id=current_user.id,
                title=title,
                description=desc,
                assignee=assignee,
                due_date=due,
                priority=prio,
                status="Pending"
            )
            db.add(action_item)
        db.commit()

        return {
            "message": "Audio uploaded successfully",
            "meeting_id": meeting.id,
            "filename": clean_original_name,
            "transcript": transcript,
            "summary": summary,
            "tasks": tasks,
            "decisions": decisions
        }

    except HTTPException:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise

    except Exception as e:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload processing failed: {str(e)}"
        )