from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TileResponse(BaseModel):
    tile_id: str
    intensity: float
    dominant_archetype: Optional[str] = None
    last_activity_at: datetime

    model_config = {"from_attributes": True}


class TilesResponse(BaseModel):
    items: list[TileResponse]
    mode: str


class GeoPointDto(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)


class CheckinDto(BaseModel):
    geo: GeoPointDto
    visibility: Literal["exact", "approx", "hidden"] = "approx"


class CheckinResponse(BaseModel):
    tile_id: str
    visibility: str
    next_allowed_at: datetime
    energy_after: int


class PingDto(BaseModel):
    ping_type: str = Field(..., min_length=1, max_length=10)
    tile_id: str = Field(..., min_length=3, max_length=16)


class PingResponse(BaseModel):
    ping_id: UUID
    ping_type: str
    tile_id: str
    effect_until: datetime
    shards_spent: int
    shards_balance: int
