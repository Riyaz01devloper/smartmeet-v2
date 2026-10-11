from datetime import datetime
from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import ActionItem, Meeting, User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def serialize_task(task: ActionItem, meeting_title: Optional[str] = None) -> dict:
    return {
        "id": task.id,
        "meeting_id": task.meeting_id,
        "meeting_title": meeting_title or (task.meeting.filename if task.meeting else None),
        "title": task.title,
        "description": task.description or "",
        "assignee": task.assignee,
        "due_date": task.due_date,
        "priority": task.priority or "Medium",
        "status": task.status or "Pending",
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
    }


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    meeting_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ActionItem).join(Meeting, ActionItem.meeting_id == Meeting.id).filter(
        ActionItem.user_id == current_user.id
    )

    if meeting_id:
        query = query.filter(ActionItem.meeting_id == meeting_id)

    if status_filter:
        query = query.filter(ActionItem.status.ilike(status_filter))

    if priority_filter:
        query = query.filter(ActionItem.priority.ilike(priority_filter))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (ActionItem.title.ilike(search_term)) |
            (ActionItem.description.ilike(search_term)) |
            (ActionItem.assignee.ilike(search_term))
        )

    tasks = query.order_by(ActionItem.id.desc()).all()
    return [serialize_task(t) for t in tasks]


@router.post("", response_model=TaskResponse)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify meeting exists and belongs to current user
    meeting = db.query(Meeting).filter(
        Meeting.id == payload.meeting_id,
        Meeting.user_id == current_user.id
    ).first()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated meeting not found or unauthorized."
        )

    task = ActionItem(
        meeting_id=meeting.id,
        user_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        assignee=payload.assignee.strip() if payload.assignee else None,
        due_date=payload.due_date.strip() if payload.due_date else None,
        priority=payload.priority if payload.priority in ["Low", "Medium", "High"] else "Medium",
        status=payload.status if payload.status in ["Pending", "In Progress", "Completed"] else "Pending",
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow() if payload.status == "Completed" else None
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return serialize_task(task, meeting.filename)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(ActionItem).filter(
        ActionItem.id == task_id,
        ActionItem.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found or unauthorized."
        )

    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.description is not None:
        task.description = payload.description.strip() if payload.description else None
    if payload.assignee is not None:
        task.assignee = payload.assignee.strip() if payload.assignee else None
    if payload.due_date is not None:
        task.due_date = payload.due_date.strip() if payload.due_date else None
    if payload.priority is not None and payload.priority in ["Low", "Medium", "High"]:
        task.priority = payload.priority
    if payload.status is not None:
        new_status = payload.status
        if new_status in ["Pending", "In Progress", "Completed"]:
            task.status = new_status
            if new_status == "Completed":
                task.completed_at = datetime.utcnow()
            else:
                task.completed_at = None

    db.commit()
    db.refresh(task)

    return serialize_task(task)


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(ActionItem).filter(
        ActionItem.id == task_id,
        ActionItem.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found or unauthorized."
        )

    db.delete(task)
    db.commit()

    return {"message": "Action item deleted successfully"}

