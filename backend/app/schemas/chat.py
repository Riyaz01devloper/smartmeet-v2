from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class MeetingChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class MeetingChatResponse(BaseModel):
    reply: str
    cited_excerpts: List[str] = Field(default_factory=list)
    meeting_id: int

