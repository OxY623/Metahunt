from datetime import datetime, time
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.arcade.models import ArcadeRun
from app.economy.models import ShardLedger
from app.game.service import GameService
from app.users.models import User

DAILY_ARCADE_REWARD = 12

class ArcadeService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.game = GameService(session)

    @staticmethod
    def _today_start() -> datetime:
        return datetime.combine(datetime.utcnow().date(), time.min)

    async def submit(self, user: User, score: int, duration_seconds: int) -> dict:
        profile = await self.game.get_or_create_profile(user.id)
        self.session.add(ArcadeRun(user_id=user.id, score=score, duration_seconds=duration_seconds))
        reward = 0
        claimed = await self.session.execute(
            select(ShardLedger.id).where(
                ShardLedger.user_id == user.id,
                ShardLedger.reason == "arcade_daily",
                ShardLedger.created_at >= self._today_start(),
            ).limit(1)
        )
        if claimed.scalar_one_or_none() is None:
            ledger = await self.game.add_shards(
                profile,
                DAILY_ARCADE_REWARD,
                "arcade_daily",
                {"score": score, "duration_seconds": duration_seconds, "source": "shard_runner"},
            )
            reward = ledger.delta if ledger else 0
        await self.session.commit()
        return {
            "score": score,
            "best_score": await self.best_score(user.id),
            "reward_shards": reward,
            "shards_balance": profile.shards,
            "reward_available_tomorrow": reward == 0,
        }

    async def best_score(self, user_id) -> int:
        value = await self.session.scalar(select(func.max(ArcadeRun.score)).where(ArcadeRun.user_id == user_id))
        return int(value or 0)

    async def leaderboard(self, limit: int = 10) -> list[dict]:
        stmt = (
            select(ArcadeRun)
            .options(selectinload(ArcadeRun.user).selectinload(User.game_profile))
            .order_by(ArcadeRun.score.desc(), ArcadeRun.created_at.asc())
        )
        rows = list((await self.session.execute(stmt)).scalars().all())
        leaders = []
        seen_users = set()
        for row in rows:
            if row.user_id in seen_users:
                continue
            seen_users.add(row.user_id)
            leaders.append(row)
            if len(leaders) == limit:
                break
        return [
            {
                "rank": index,
                "nickname": row.user.nickname,
                "archetype": row.user.game_profile.archetype if row.user.game_profile else None,
                "score": row.score,
                "created_at": row.created_at,
            }
            for index, row in enumerate(leaders, start=1)
        ]
