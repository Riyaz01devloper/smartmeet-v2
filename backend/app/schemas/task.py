from typing import Optional
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    meeting_id: int
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    meeting_id: int
    meeting_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: str
    status: str
    created_at: Optional[str] = None
    completed_at: Optional[str] = None

    class Config:
        from_attributes = True

