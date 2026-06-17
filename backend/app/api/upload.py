from fastapi import APIRouter,UploadFile,File
from app.services.whisper_service import transcribe_audio
from app.database.db import SessionLocal
from app.database.models import Meeting
from app.services.meeting_analyzer import analyze_meeting
import json

from app.services.meeting_analyzer import analyze_meeting
import os 
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/audio"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post ("/upload")
async def upload_Audio (file:UploadFile = File(...)): 
    file_path = os.path.join(
        UPLOAD_DIR, 
        file.filename
        
    )
    print("Step 1: File Saved")
    with open(file_path, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

    print("Step 1: File Saved")

    # transcript = transcribe_audio(file_path)
    transcript = "This is a test transcript"

    print("Step 2: Transcription Complete")
    print("Word Count:", len(transcript.split()))
    # if len (transcript.split()) <20:
    #     return{
    #          "transcript": transcript,
    #     "summary": "Transcript too short for meaningful analysis",
    #     "tasks": [],
    #     "decisions": []
    #     }
        

    analysis = analyze_meeting(transcript)
    # data=json.loads(analysis)
    
    summary=analysis["summary"]
    tasks=analysis["tasks"]
    decisions=analysis["decisions"]

    print("Step 3: Analysis Complete")
    tasks=[]
    
    db=SessionLocal() 
    meeting= Meeting(
        filename=file.filename,
        file_path=file_path,
        transcript=transcript,
        summary=summary
        
    )
    db.add(meeting) 
    db.commit()
    db.refresh(meeting)
    return {
    "message": "Audio uploaded successfully",
    "meeting_id":meeting.id,
    "filename": file.filename,
    "transcript": transcript,
    "summary":summary,
    "tasks" :tasks,
    "decisions":decisions
    
    
}
# from fastapi import APIRouter, UploadFile, File

# router = APIRouter()

# @router.post("/upload")
# async def upload_Audio(file: UploadFile = File(...)):
#     return {
#         "success": True,
#         "filename": file.filename
#     }