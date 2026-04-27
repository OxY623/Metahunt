from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.game.models import Archetype


class PostMediaDto(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)
    type: str = Field(..., min_length=1, max_length=16)


class PostAuthor(BaseModel):
    id: Optional[UUID] = None
    nickname: Optional[str] = None
    archetype: Optional[Archetype] = None


class PostStats(BaseModel):
    views: int = 0
    replies: int = 0


class PostResponse(BaseModel):
    id: UUID
    author: PostAuthor
    post_type: str
    text: Optional[str] = None
    media: list[PostMediaDto]
    is_anonymous: bool
    geo_tile: Optional[str] = None
    created_at: datetime
    stats: PostStats


class FeedResponse(BaseModel):
    items: list[PostResponse]
    next_cursor: Optional[str] = None
    mode: str


class CreatePostDto(BaseModel):
    post_type: str = Field(..., min_length=1, max_length=16)
    text: Optional[str] = Field(default=None, max_length=2000)
    media: list[PostMediaDto] = Field(default_factory=list)
    is_anonymous: bool = False
    geo_tile: Optional[str] = Field(default=None, max_length=16)
    boost: bool = False

    @model_validator(mode="after")
    def validate_payload(self):
        text = (self.text or "").strip()
        if not text and not self.media:
            raise ValueError("Either text or media is required")
        return self


class CreatePostResponse(BaseModel):
    post: PostResponse
    shards_spent: int
    shards_balance: int
    energy_after: int
