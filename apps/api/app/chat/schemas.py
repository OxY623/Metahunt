# app/chat/schemas.py

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.game.models import Archetype


class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)
    room: str = Field(default="general", min_length=1, max_length=64)


class MessageResponse(BaseModel):
    id: UUID
    sender_id: Optional[UUID]  # None для анонимных (Whisper)
    sender_nickname: Optional[str]  # None для анонимных
    sender_archetype: Optional[Archetype] = None
    room: str
    text: str
    is_anonymous: bool
    effect: str | None = None
    effect_payload: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
