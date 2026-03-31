from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
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



