from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, inspect, text
from sqlalchemy.orm import relationship
from app.database.db import Base, engine

class Meeting(Base):
    __tablename__ = "meetings" 
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    transcript = Column(Text)
    summary = Column(Text)
    tasks = Column(Text, default="[]")
    decisions = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)

    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    user = relationship("User", back_populates="meetings")
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)

    meetings = relationship("Meeting", back_populates="user", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="user", cascade="all, delete-orphan")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assignee = Column(String, nullable=True)
    due_date = Column(String, nullable=True)
    priority = Column(String, default="Medium")  # Low, Medium, High
    status = Column(String, default="Pending")    # Pending, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="action_items")
    user = relationship("User", back_populates="action_items")


def run_migrations():
    """Ensure existing databases have the new tables and columns without breaking."""
    try:
        # Create all tables including action_items if missing
        Base.metadata.create_all(bind=engine)

        inspector = inspect(engine)
        if "meetings" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("meetings")]
            with engine.connect() as conn:
                if "tasks" not in columns:
                    conn.execute(text("ALTER TABLE meetings ADD COLUMN tasks TEXT DEFAULT '[]'"))
                if "decisions" not in columns:
                    conn.execute(text("ALTER TABLE meetings ADD COLUMN decisions TEXT DEFAULT '[]'"))
                if "created_at" not in columns:
                    conn.execute(text("ALTER TABLE meetings ADD COLUMN created_at TIMESTAMP"))
                conn.commit()

        # Migrate existing legacy tasks into action_items if action_items is empty
        if "action_items" in inspector.get_table_names() and "meetings" in inspector.get_table_names():
            with engine.connect() as conn:
                count_res = conn.execute(text("SELECT count(*) FROM action_items")).scalar()
                if count_res == 0:
                    meetings_rows = conn.execute(text("SELECT id, user_id, tasks, created_at FROM meetings")).fetchall()
                    for m_id, u_id, t_json, m_created in meetings_rows:
                        if not t_json or not u_id:
                            continue
                        try:
                            parsed = json.loads(t_json)
                            if isinstance(parsed, list):
                                for item in parsed:
                                    title = item if isinstance(item, str) else item.get("title", str(item))
                                    desc = item.get("description", "") if isinstance(item, dict) else ""
                                    assignee = item.get("assignee", None) if isinstance(item, dict) else None
                                    due = item.get("due_date", None) if isinstance(item, dict) else None
                                    priority = item.get("priority", "Medium") if isinstance(item, dict) else "Medium"
                                    conn.execute(
                                        text("""
                                            INSERT INTO action_items (meeting_id, user_id, title, description, assignee, due_date, priority, status, created_at)
                                            VALUES (:m_id, :u_id, :title, :desc, :assignee, :due, :priority, 'Pending', :created)
                                        """),
                                        {
                                            "m_id": m_id, "u_id": u_id, "title": title[:255],
                                            "desc": desc, "assignee": assignee, "due": due,
                                            "priority": priority, "created": m_created or datetime.utcnow()
                                        }
                                    )
                        except Exception:
                            pass
                    conn.commit()
    except Exception as e:
        print("Migration check notice:", e)
