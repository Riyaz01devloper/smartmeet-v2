from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, inspect, text
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
    user_id = Column(Integer, ForeignKey("users.id"))
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)


def run_migrations():
    """Ensure existing databases have the new columns without breaking."""
    try:
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
    except Exception as e:
        print("Migration check notice:", e)
