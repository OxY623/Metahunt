# app/game/service.py

from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.game.models import GameProfile, Archetype
from app.game.schemas import ChooseArchetypeDto


def xp_to_next_level(level: int) -> int:
    return level * 100


ARCHETYPE_STATS = {
    Archetype.FOXY: ["charisma", "influence", "activity"],
    Archetype.OXY:  ["strategy", "reliability", "organization"],
    Archetype.BEAR: ["reliability", "organization", "charisma"],
    Archetype.OWL:  ["strategy", "influence", "charisma"],
}

STAT_POINTS_PER_LEVEL = 5.0


class GameService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_profile(self, user_id: UUID) -> GameProfile:
        result = await self.session.execute(
            select(GameProfile).where(GameProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            profile = GameProfile(user_id=user_id)
            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(profile)

        return profile

    async def choose_archetype(self, user_id: UUID, dto: ChooseArchetypeDto) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)

        if profile.archetype is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Архетип уже выбран и не может быть изменён",
            )

        profile.archetype = dto.archetype
        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def add_xp(self, user_id: UUID, amount: int) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)

        profile.xp += amount

        while profile.xp >= xp_to_next_level(profile.level):
            profile.xp -= xp_to_next_level(profile.level)
            profile.level += 1
            await self._apply_level_up_stats(profile)

        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def _apply_level_up_stats(self, profile: GameProfile) -> None:
        if profile.archetype is None:
            return

        stats = ARCHETYPE_STATS[profile.archetype]
        points_each = STAT_POINTS_PER_LEVEL / len(stats)

        for stat in stats:
            current = getattr(profile, stat)
            new_val = min(100.0, current + points_each)
            setattr(profile, stat, new_val)

    async def add_reputation(self, user_id: UUID, amount: float) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)
        profile.reputation = max(0.0, min(1000.0, profile.reputation + amount))
        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def spend_shards(self, profile: GameProfile, cost: int) -> None:
        if profile.shards < cost:
            raise HTTPException(status_code=400, detail="Недостаточно Осколков")
        profile.shards -= cost

    async def spend_energy(self, profile: GameProfile, cost: int) -> None:
        if profile.energy < cost:
            raise HTTPException(status_code=400, detail="Недостаточно энергии")
        profile.energy -= cost

    def build_response(self, profile: GameProfile) -> dict:
        return {
            "id": profile.id,
            "archetype": profile.archetype,
            "level": profile.level,
            "xp": profile.xp,
            "xp_to_next": xp_to_next_level(profile.level),
            "reputation": profile.reputation,
            "season_points": profile.season_points,
            "shards": profile.shards,
            "energy": profile.energy,
            "stats": {
                "charisma": profile.charisma,
                "influence": profile.influence,
                "activity": profile.activity,
                "strategy": profile.strategy,
                "reliability": profile.reliability,
                "organization": profile.organization,
            },
        }
