from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Any, Optional
from app.game.models import Archetype


class Characteristics(BaseModel):
    charisma:     float
    influence:    float
    activity:     float
    strategy:     float
    reliability:  float
    organization: float

    model_config = {"from_attributes": True}


class GameProfileResponse(BaseModel):
    id:            UUID
    archetype:     Optional[Archetype]
    level:         int
    xp:            int
    xp_to_next:    int
    reputation:    float
    season_points: int
    shards:        int
    energy:        int
    stats:         Characteristics

    model_config = {"from_attributes": True}


class ChooseArchetypeDto(BaseModel):
    archetype: Archetype


class UserWithGameResponse(BaseModel):
    id:           UUID
    email:        str
    nickname:     str
    avatar:       Optional[str]
    bio:          Optional[str]
    privacy:      str
    verified:     bool
    role:         str
    game_profile: Optional[GameProfileResponse]

    model_config = {"from_attributes": True}


class TargetDto(BaseModel):
    target_id: UUID = Field(..., description="ID цели")


class WhisperDto(TargetDto):
    message: str = Field(..., min_length=1, max_length=500)
    room: str = Field(default="general", min_length=1, max_length=64)


class QuestRewardDto(BaseModel):
    quest_key: str = Field(..., min_length=1, max_length=64)


class ShardLedgerResponse(BaseModel):
    id: UUID
    delta: int
    reason: str
    meta: dict[str, Any] | None
    balance_after: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ShardRewardResponse(BaseModel):
    msg: str
    delta: int
    balance: int
    ledger: ShardLedgerResponse | None = None


class FactionPulseItem(BaseModel):
    archetype: Archetype
    count: int
    share: float
    role: str
    pressure_to: Archetype | None
    threat_from: Archetype | None


class FactionPulseEdge(BaseModel):
    source: Archetype
    target: Archetype
    relation: str
    active_pairs: int
    opportunity: str


class FactionPulseResponse(BaseModel):
    total_players: int
    factions: list[FactionPulseItem]
    edges: list[FactionPulseEdge]
    user_recommendation: str
