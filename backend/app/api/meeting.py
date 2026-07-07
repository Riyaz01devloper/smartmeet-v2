from fastapi import HTTPException

from fastapi import APIRouter
from app.database.db import SessionLocal
from app.database.models import Meeting
from fastapi import Depends
from app.utils.dependencies import get_current_user
from app.database.models import User
from app.database.db import get_db

router = APIRouter()

@router.get("/meeting/{meeting_id}")
def get_meeting(
    meeting_id: int,
    current_user: User = Depends(get_current_user)
):
    
    db= SessionLocal()
    
    meeting =db.query(Meeting).filter(
        Meeting.user_id==current_user.id,
        Meeting.user_id==current_user.id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
     
    
    return {
        # "message":"Meeting deleted successfully",
        "id":meeting.id,
        "filename":meeting.filename,
        "transcript":meeting.transcript,
        "summary":meeting.summary
    }



@router.get("/meetings")
def get_meetings(current_user: User = Depends(get_current_user)
):
    db=SessionLocal()
    
    
    meetings = db.query(Meeting).filter(Meeting.user_id==current_user.id).all()
    
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
def delete_meeting(meeting_id:int,
                   current_user: User = Depends(get_current_user)):
    db=SessionLocal()
    
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.user_id== current_user.id
    ). first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    
    return {
        "message":"meeting deleted"
    }
   

