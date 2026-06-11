from fastapi import APIRouter
from app.database.db import SessionLocal
from app.database.models import Meeting

router = APIRouter()

@router.get("/meeting/{meeting_id}")
def get_meeting(meeting_id:int):
    
    db= SessionLocal()
    
    meeting =db.query(Meeting).filter(
        Meeting.id==meeting_id
    ).first()
    
    if not meeting:
        return {
            "message":"Meeting not found"
        }
        
     
    
    return {
        # "message":"Meeting deleted successfully",
        "id":meeting.id,
        "filename":meeting.filename,
        "transcript":meeting.transcript,
        "summary":meeting.summary
    }



@router.get("/meetings")
def get_meetings():
    db=SessionLocal()
    
    meetings = db.query(Meeting).all()
    
    result=[]
    
    for meeting in meetings:
        result.append ({
            "id":meeting.id,
            "filename":meeting.filename,
            "transcript":meeting.transcript,
            "summary":meeting.summary
        })
    return result
        
@router.delete ("/meeting/{meeting_id}")
def delete_meeting(meeting_id:int):
    db=SessionLocal()
    
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id
    ). first()
    
    if not meeting:
        return {
            "message":"meeting not found"
        }
    db.delete(meeting)
    db.commit()
    
    return {
        "message":"meeting deleted"
    }
   

