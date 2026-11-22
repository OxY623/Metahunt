from datetime import datetime
from pydantic import BaseModel, Field
from app.game.models import Archetype

class ArcadeScoreDto(BaseModel):
    score: int = Field(ge=0, le=5000)
    duration_seconds: int = Field(ge=10, le=90)

class ArcadeLeaderboardEntry(BaseModel):
    rank: int
    nickname: str
    archetype: Archetype | None
    score: int
    created_at: datetime

class ArcadeResultResponse(BaseModel):
    score: int
    best_score: int
    reward_shards: int
    shards_balance: int
    reward_available_tomorrow: bool

class ArcadeOverviewResponse(BaseModel):
    best_score: int
    leaderboard: list[ArcadeLeaderboardEntry]
