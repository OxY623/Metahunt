from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.invites.schemas import (
    CreateInviteDto,
    CreateInviteResponse,
    InviteBalances,
    InviteCreator,
    InviteLimits,
    InviteListResponse,
    InviteResponse,
    RedeemInviteDto,
    RedeemInviteResponse,
    RedeemInviter,
    RedeemReward,
)
from app.invites.service import InviteService
from app.users.models import User

router = APIRouter(prefix="/invites", tags=["Invites"])


def get_invite_service(session: AsyncSession = Depends(get_session)) -> InviteService:
    return InviteService(session)


def _invite_response(invite, creator: InviteCreator) -> InviteResponse:
    return InviteResponse(
        id=invite.id,
        code=invite.code,
        status=invite.status,
        expires_at=invite.expires_at,
        created_at=invite.created_at,
        creator=creator,
    )


@router.get("", response_model=InviteListResponse)
async def list_invites(
    current_user: User = Depends(get_current_user),
    service: InviteService = Depends(get_invite_service),
):
    items, profile, limits = await service.list_invites(current_user)
    creator = InviteCreator(id=current_user.id, nickname=current_user.nickname, archetype=profile.archetype)
    return InviteListResponse(
        items=[_invite_response(invite, creator) for invite in items],
        limits=InviteLimits(**limits),
    )


@router.post("", response_model=CreateInviteResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    _dto: CreateInviteDto,
    current_user: User = Depends(get_current_user),
    service: InviteService = Depends(get_invite_service),
):
    invite, profile = await service.create_invite(current_user)
    creator = InviteCreator(id=current_user.id, nickname=current_user.nickname, archetype=profile.archetype)
    return CreateInviteResponse(
        invite=_invite_response(invite, creator),
        balances=InviteBalances(
            invite_balance=profile.invite_balance,
            shards_balance=profile.shards,
            energy=profile.energy,
        ),
    )


@router.post("/redeem", response_model=RedeemInviteResponse)
async def redeem_invite(
    dto: RedeemInviteDto,
    service: InviteService = Depends(get_invite_service),
):
    payload = await service.redeem(dto)
    return RedeemInviteResponse(
        status=payload["status"],
        inviter=RedeemInviter(id=payload["inviter_id"], archetype=payload["inviter_archetype"]),
        reward=RedeemReward(**payload["reward"]),
    )
