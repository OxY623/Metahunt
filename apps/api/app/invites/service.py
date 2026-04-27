import secrets
import string
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.balance import FOX_TAX_SHARE, INVITE_TAX_RATE, get_mode, invite_limits, invite_reward, invite_ttl_hours
from app.game.models import Archetype, GameProfile
from app.game.service import GameService
from app.invites.models import Invite
from app.invites.schemas import RedeemInviteDto
from app.users.models import User

ALPHABET = string.ascii_uppercase + string.digits
ACTIVE_INVITE_STATUSES = ("created", "sent")


class InviteService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.game = GameService(session)

    async def _get_profile(self, user_id):
        return await self.game.get_or_create_profile(user_id)

    @staticmethod
    def _maybe_reset_daily(profile: GameProfile) -> None:
        now = datetime.utcnow()
        if profile.invite_last_reset_at is None or profile.invite_last_reset_at.date() != now.date():
            profile.invite_daily_used = 0
            profile.invite_last_reset_at = now

    @staticmethod
    def _new_code() -> str:
        left = "".join(secrets.choice(ALPHABET) for _ in range(4))
        right = "".join(secrets.choice(ALPHABET) for _ in range(4))
        return f"MH-{left}-{right}"

    async def _generate_unique_code(self) -> str:
        for _ in range(16):
            code = self._new_code()
            stmt = select(Invite.id).where(Invite.code == code)
            exists = (await self.session.execute(stmt)).scalar_one_or_none()
            if not exists:
                return code
        raise HTTPException(status_code=500, detail="invite_code_generation_failed")

    async def list_invites(self, current_user: User):
        profile = await self._get_profile(current_user.id)
        self._maybe_reset_daily(profile)

        stmt = (
            select(Invite)
            .where(Invite.creator_id == current_user.id)
            .order_by(Invite.created_at.desc())
        )
        items = list((await self.session.execute(stmt)).scalars().all())

        limits = invite_limits(profile.archetype) if profile.archetype else {"daily": 0, "storage": 0}
        return items, profile, {
            "daily_total": limits["daily"],
            "daily_used": profile.invite_daily_used,
            "storage_cap": limits["storage"],
            "mode": get_mode(),
        }

    async def create_invite(self, current_user: User):
        profile = await self._get_profile(current_user.id)
        if profile.archetype is None:
            raise HTTPException(status_code=400, detail="choose_archetype_first")

        self._maybe_reset_daily(profile)
        now = datetime.utcnow()

        limits = invite_limits(profile.archetype)
        if profile.invite_daily_used >= limits["daily"]:
            raise HTTPException(status_code=409, detail="invite_limit")

        active_count_stmt = select(func.count(Invite.id)).where(
            Invite.creator_id == current_user.id,
            Invite.status.in_(ACTIVE_INVITE_STATUSES),
            Invite.expires_at > now,
        )
        active_count = int((await self.session.execute(active_count_stmt)).scalar_one())
        if active_count >= limits["storage"]:
            raise HTTPException(status_code=409, detail="invite_limit")

        if profile.invite_balance <= 0:
            raise HTTPException(status_code=402, detail="invite_balance")

        invite = Invite(
            code=await self._generate_unique_code(),
            creator_id=current_user.id,
            status="created",
            expires_at=now + timedelta(hours=invite_ttl_hours()),
        )
        profile.invite_balance -= 1
        profile.invite_daily_used += 1
        profile.invite_last_reset_at = now

        self.session.add(invite)
        await self.session.flush()
        await self.session.refresh(invite)
        await self.session.commit()
        await self.session.refresh(profile)

        return invite, profile

    async def redeem(self, dto: RedeemInviteDto):
        normalized_code = dto.code.strip().upper()
        invite_stmt = select(Invite).where(Invite.code == normalized_code)
        invite = (await self.session.execute(invite_stmt)).scalar_one_or_none()

        if not invite:
            raise HTTPException(status_code=400, detail="invalid_code")

        now = datetime.utcnow()
        if invite.expires_at <= now:
            invite.status = "expired"
            await self.session.commit()
            raise HTTPException(status_code=410, detail="invite_expired")

        if invite.status == "redeemed" or invite.redeemed_by is not None:
            raise HTTPException(status_code=409, detail="invite_used")

        inviter_profile = await self._get_profile(invite.creator_id)

        reward_total = invite_reward()
        tax_to_bear = int(reward_total * INVITE_TAX_RATE)
        tax_to_fox = 0
        if inviter_profile.archetype and inviter_profile.archetype != Archetype.FOXY:
            tax_to_fox = int(tax_to_bear * FOX_TAX_SHARE)

        inviter_delta = max(reward_total - tax_to_bear - tax_to_fox, 0)
        inviter_profile.shards += inviter_delta

        invite.status = "redeemed"
        invite.redeemed_by = dto.redeemed_by

        creator_stmt = select(User).where(User.id == invite.creator_id)
        creator = (await self.session.execute(creator_stmt)).scalar_one_or_none()

        await self.session.commit()
        await self.session.refresh(invite)

        return {
            "status": invite.status,
            "inviter_id": invite.creator_id,
            "inviter_archetype": inviter_profile.archetype,
            "inviter_nickname": creator.nickname if creator else "unknown",
            "reward": {
                "inviter_shards_delta": inviter_delta,
                "tax_to_bear": tax_to_bear,
                "tax_to_fox": tax_to_fox,
            },
        }
