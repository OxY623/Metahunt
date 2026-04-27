from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.game.models import Archetype


class InviteCreator(BaseModel):
    id: UUID
    nickname: str
    archetype: Optional[Archetype] = None


class InviteResponse(BaseModel):
    id: UUID
    code: str
    status: str
    expires_at: datetime
    created_at: datetime
    creator: InviteCreator

    model_config = {"from_attributes": True}


class InviteLimits(BaseModel):
    daily_total: int
    daily_used: int
    storage_cap: int
    mode: str


class InviteBalances(BaseModel):
    invite_balance: int
    shards_balance: int
    energy: int


class InviteListResponse(BaseModel):
    items: list[InviteResponse]
    limits: InviteLimits


class CreateInviteDto(BaseModel):
    delivery: str = Field(default="link", min_length=1, max_length=16)
    note: Optional[str] = Field(default=None, max_length=300)


class CreateInviteResponse(BaseModel):
    invite: InviteResponse
    balances: InviteBalances


class RedeemInviteDto(BaseModel):
    code: str = Field(..., min_length=4, max_length=32)
    device_fingerprint: Optional[str] = Field(default=None, max_length=256)
    redeemed_by: UUID | None = None


class RedeemReward(BaseModel):
    inviter_shards_delta: int
    tax_to_bear: int
    tax_to_fox: int


class RedeemInviter(BaseModel):
    id: UUID
    archetype: Optional[Archetype] = None


class RedeemInviteResponse(BaseModel):
    status: str
    inviter: RedeemInviter
    reward: RedeemReward
