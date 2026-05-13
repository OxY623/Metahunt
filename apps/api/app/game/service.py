# app/game/service.py

from datetime import datetime, time
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.balance import FOX_TAX_SHARE
from app.economy.models import ShardLedger
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

DEMO_DAILY_CAP = 100
DEMO_REWARDS = {
    "daily_login": 10,
    "first_message": 5,
    "quest_reward": 25,
    "counter_reward": 12,
    "response_reward": 8,
    "owl_deal": 20,
    "post_reaction_reward": 10,
    "geo_checkin_reward": 8,
}

QUEST_REWARDS = {
    "first_move": {"reward": 15, "daily_limit": 1},
    "response_spark": {"reward": 8, "daily_limit": 5},
    "oxy_hunt_power": {"reward": 12, "daily_limit": 5, "archetype": Archetype.OXY},
    "foxy_beautiful_lie": {"reward": 12, "daily_limit": 5, "archetype": Archetype.FOXY},
    "bear_control_seal": {"reward": 12, "daily_limit": 5, "archetype": Archetype.BEAR},
    "owl_silent_price": {"reward": 20, "daily_limit": 3, "archetype": Archetype.OWL},
    "district_voice": {"reward": 10, "daily_limit": 2},
}

FACTION_ROLES = {
    Archetype.FOXY: "Провоцирует OXY, разгоняет инвайты и хаос.",
    Archetype.OXY: "Давит BEAR и держит темп охоты.",
    Archetype.BEAR: "Контролирует FOXY, собирает налоги и защищает казну.",
    Archetype.OWL: "Продает информацию всем сторонам и запускает интриги.",
}

PRESSURE_TO = {
    Archetype.FOXY: Archetype.OXY,
    Archetype.OXY: Archetype.BEAR,
    Archetype.BEAR: Archetype.FOXY,
    Archetype.OWL: None,
}

THREAT_FROM = {
    Archetype.FOXY: Archetype.BEAR,
    Archetype.OXY: Archetype.FOXY,
    Archetype.BEAR: Archetype.OXY,
    Archetype.OWL: None,
}


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

    @staticmethod
    def _today_start() -> datetime:
        return datetime.combine(datetime.utcnow().date(), time.min)

    async def _daily_reason_count(
        self,
        user_id: UUID,
        reason: str,
        meta_key: str | None = None,
    ) -> int:
        stmt = select(ShardLedger).where(
            ShardLedger.user_id == user_id,
            ShardLedger.reason == reason,
            ShardLedger.created_at >= self._today_start(),
        )
        rows = list((await self.session.execute(stmt)).scalars().all())
        if meta_key is not None:
            rows = [row for row in rows if row.meta and row.meta.get("key") == meta_key]
        return len(rows)

    async def _daily_positive_total(self, user_id: UUID) -> int:
        stmt = select(ShardLedger).where(
            ShardLedger.user_id == user_id,
            ShardLedger.delta > 0,
            ShardLedger.created_at >= self._today_start(),
        )
        rows = list((await self.session.execute(stmt)).scalars().all())
        return sum(row.delta for row in rows)

    async def list_ledger(self, user_id: UUID, limit: int = 20) -> list[ShardLedger]:
        stmt = (
            select(ShardLedger)
            .where(ShardLedger.user_id == user_id)
            .order_by(ShardLedger.created_at.desc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def faction_pulse(self, user_id: UUID) -> dict:
        profile = await self.get_or_create_profile(user_id)
        stmt = (
            select(GameProfile.archetype, func.count(GameProfile.id))
            .where(GameProfile.archetype.is_not(None))
            .group_by(GameProfile.archetype)
        )
        rows = (await self.session.execute(stmt)).all()
        counts = {archetype: int(count) for archetype, count in rows if archetype is not None}
        total = sum(counts.values())

        factions = []
        for archetype in Archetype:
            count = counts.get(archetype, 0)
            factions.append(
                {
                    "archetype": archetype,
                    "count": count,
                    "share": round(count / total, 3) if total else 0.0,
                    "role": FACTION_ROLES[archetype],
                    "pressure_to": PRESSURE_TO[archetype],
                    "threat_from": THREAT_FROM[archetype],
                }
            )

        edges = []
        for source, target, opportunity in (
            (Archetype.FOXY, Archetype.OXY, "Глитчи и маскировка создают шум против Волков."),
            (Archetype.OXY, Archetype.BEAR, "Охота режет контроль Медведя и открывает окно для команды."),
            (Archetype.BEAR, Archetype.FOXY, "Блокировки охлаждают разгон Лисы и защищают налоги."),
        ):
            edges.append(
                {
                    "source": source,
                    "target": target,
                    "relation": "counter",
                    "active_pairs": min(counts.get(source, 0), counts.get(target, 0)),
                    "opportunity": opportunity,
                }
            )

        owl_count = counts.get(Archetype.OWL, 0)
        for target in (Archetype.FOXY, Archetype.OXY, Archetype.BEAR):
            edges.append(
                {
                    "source": Archetype.OWL,
                    "target": target,
                    "relation": "trade",
                    "active_pairs": min(owl_count, counts.get(target, 0)),
                    "opportunity": "Сова продает сигнал той стороне, где сейчас больше выгоды.",
                }
            )

        recommendation = "Выбери архетип, чтобы увидеть свою роль в общем конфликте."
        if profile.archetype == Archetype.FOXY:
            recommendation = "Ищи OXY в активной комнате: твой глитч запускает давление и кормит контр-награду."
        elif profile.archetype == Archetype.OXY:
            recommendation = "Твоя цель - BEAR. Маркер и прямой удар ломают контроль самой тяжелой фракции."
        elif profile.archetype == Archetype.BEAR:
            recommendation = "Держи FOXY под блокировкой и собирай налоги: ты превращаешь хаос в казну."
        elif profile.archetype == Archetype.OWL:
            recommendation = "Смотри на перекос сил и продавай сигнал слабой стороне: так интрига не тухнет."

        return {
            "total_players": total,
            "factions": factions,
            "edges": edges,
            "user_recommendation": recommendation,
        }

    async def add_shards(
        self,
        profile: GameProfile,
        amount: int,
        reason: str,
        meta: dict | None = None,
        *,
        apply_daily_cap: bool = True,
    ) -> ShardLedger | None:
        if amount <= 0:
            return None

        final_amount = amount
        if apply_daily_cap:
            earned_today = await self._daily_positive_total(profile.user_id)
            if earned_today >= DEMO_DAILY_CAP:
                final_amount = max(1, int(final_amount * 0.5))

        profile.shards += final_amount
        ledger = ShardLedger(
            user_id=profile.user_id,
            delta=final_amount,
            reason=reason,
            meta=meta,
            balance_after=profile.shards,
        )
        self.session.add(ledger)
        await self.session.flush()
        return ledger

    async def subtract_shards(
        self,
        profile: GameProfile,
        amount: int,
        reason: str,
        meta: dict | None = None,
    ) -> ShardLedger | None:
        if amount <= 0:
            return None
        if profile.shards < amount:
            raise HTTPException(status_code=400, detail="Недостаточно Осколков")
        profile.shards -= amount
        ledger = ShardLedger(
            user_id=profile.user_id,
            delta=-amount,
            reason=reason,
            meta=meta,
            balance_after=profile.shards,
        )
        self.session.add(ledger)
        await self.session.flush()
        return ledger

    async def claim_daily_login(self, user_id: UUID) -> tuple[GameProfile, ShardLedger | None]:
        profile = await self.get_or_create_profile(user_id)
        if await self._daily_reason_count(user_id, "daily_login") > 0:
            return profile, None
        ledger = await self.add_shards(
            profile,
            DEMO_REWARDS["daily_login"],
            "daily_login",
            {"source": "demo_loop"},
        )
        await self.session.commit()
        await self.session.refresh(profile)
        return profile, ledger

    async def claim_first_message_reward(self, user_id: UUID) -> ShardLedger | None:
        profile = await self.get_or_create_profile(user_id)
        if await self._daily_reason_count(user_id, "first_message") > 0:
            return None
        return await self.add_shards(
            profile,
            DEMO_REWARDS["first_message"],
            "first_message",
            {"source": "chat"},
        )

    async def claim_quest_reward(
        self,
        user_id: UUID,
        quest_key: str,
    ) -> tuple[GameProfile, ShardLedger | None]:
        profile = await self.get_or_create_profile(user_id)
        quest = QUEST_REWARDS.get(quest_key)
        if not quest:
            raise HTTPException(status_code=404, detail="unknown_quest")
        required_archetype = quest.get("archetype")
        if required_archetype and profile.archetype != required_archetype:
            raise HTTPException(status_code=403, detail="wrong_archetype")
        count = await self._daily_reason_count(user_id, "quest_reward", quest_key)
        if count >= int(quest["daily_limit"]):
            return profile, None
        ledger = await self.add_shards(
            profile,
            int(quest["reward"]),
            "quest_reward",
            {"key": quest_key, "source": "demo_loop"},
        )
        await self.session.commit()
        await self.session.refresh(profile)
        return profile, ledger

    async def grant_counter_reward(
        self,
        profile: GameProfile,
        target: GameProfile,
        skill: str,
    ) -> ShardLedger | None:
        if await self._daily_reason_count(profile.user_id, "counter_reward", skill) >= 5:
            return None
        reward = DEMO_REWARDS["counter_reward"]
        if profile.archetype == Archetype.OXY and target.archetype == Archetype.BEAR:
            reward = int(reward * 1.2)
        return await self.add_shards(
            profile,
            reward,
            "counter_reward",
            {
                "key": skill,
                "target_id": str(target.user_id),
                "source_archetype": profile.archetype.value if profile.archetype else None,
                "target_archetype": target.archetype.value if target.archetype else None,
            },
        )

    async def grant_owl_deal(
        self,
        profile: GameProfile,
        target: GameProfile,
    ) -> ShardLedger | None:
        if profile.archetype != Archetype.OWL:
            raise HTTPException(status_code=403, detail="only_owl_can_trade")
        if await self._daily_reason_count(profile.user_id, "owl_deal") >= 3:
            return None
        return await self.add_shards(
            profile,
            DEMO_REWARDS["owl_deal"],
            "owl_deal",
            {
                "target_id": str(target.user_id),
                "target_archetype": target.archetype.value if target.archetype else None,
            },
        )

    async def apply_tax_split(
        self,
        payer: GameProfile,
        amount: int,
        reason: str,
        meta: dict | None = None,
        *,
        fox_share: bool = False,
    ) -> dict:
        await self.subtract_shards(payer, amount, reason, meta)
        bear_amount = amount
        fox_amount = 0
        if fox_share:
            fox_amount = int(amount * FOX_TAX_SHARE)
            bear_amount = amount - fox_amount

        if bear_amount:
            await self._award_to_archetype(Archetype.BEAR, bear_amount, "tax_income", meta)
        if fox_amount:
            await self._award_to_archetype(Archetype.FOXY, fox_amount, "tax_income", meta)

        return {"tax_to_bear": bear_amount, "tax_to_fox": fox_amount}

    async def _award_to_archetype(
        self,
        archetype: Archetype,
        amount: int,
        reason: str,
        meta: dict | None = None,
    ) -> None:
        if amount <= 0:
            return
        stmt = select(GameProfile).where(GameProfile.archetype == archetype).limit(1)
        profile = (await self.session.execute(stmt)).scalar_one_or_none()
        if profile:
            await self.add_shards(profile, amount, reason, meta, apply_daily_cap=False)

    async def choose_archetype(self, user_id: UUID, dto: ChooseArchetypeDto) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)

        if profile.archetype is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Архетип уже выбран и не может быть изменён",
            )

        profile.archetype = dto.archetype
        if profile.shards < 80:
            profile.shards = 80
        if profile.invite_balance <= 0:
            profile.invite_balance = {
                Archetype.OXY: 3,
                Archetype.FOXY: 5,
                Archetype.BEAR: 2,
                Archetype.OWL: 4,
            }.get(dto.archetype, 0)
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
        await self.subtract_shards(profile, cost, "skill_cost", {"legacy": True})

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
