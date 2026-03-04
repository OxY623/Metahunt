# app/game/service.py

from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.game.models import GameProfile, Archetype
from app.game.schemas import ChooseArchetypeDto


# --- Формула опыта до следующего уровня ---
# level 1→2: 100 XP, level 2→3: 200 XP, level 9→10: 1000 XP
# Чем выше уровень — тем сложнее прокачаться
def xp_to_next_level(level: int) -> int:
    return level * 100


# --- Какие характеристики прокачивает каждый архетип ---
ARCHETYPE_STATS = {
    Archetype.FOXY: ["charisma", "influence", "activity"],
    Archetype.OXY:  ["strategy", "reliability", "organization"],
}

# --- Сколько очков характеристик даётся за уровень ---
STAT_POINTS_PER_LEVEL = 5.0


class GameService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_profile(self, user_id: UUID) -> GameProfile:
        # Ищем существующий профиль
        result = await self.session.execute(
            select(GameProfile).where(GameProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            # Создаём профиль автоматически при первом обращении
            # Это называется "lazy initialization"
            profile = GameProfile(user_id=user_id)
            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(profile)

        return profile

    async def choose_archetype(self, user_id: UUID, dto: ChooseArchetypeDto) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)

        # Архетип можно выбрать только один раз — это постоянное решение
        # Как в RPG: выбрал класс — живи с ним
        if profile.archetype is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Архетип уже выбран и не может быть изменён"
            )

        profile.archetype = dto.archetype
        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def add_xp(self, user_id: UUID, amount: int) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)

        profile.xp += amount

        # --- Проверяем левел-ап ---
        # while — потому что за одно действие можно получить несколько уровней
        while profile.xp >= xp_to_next_level(profile.level):
            profile.xp    -= xp_to_next_level(profile.level)  # остаток XP переносится
            profile.level += 1
            await self._apply_level_up_stats(profile)          # раздаём очки характеристик

        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def _apply_level_up_stats(self, profile: GameProfile) -> None:
        # Приватный метод — только для внутреннего использования
        # _ в начале имени — Python-конвенция для приватных методов
        if profile.archetype is None:
            return   # нет архетипа — нет прокачки

        # Получаем список характеристик для этого архетипа
        stats = ARCHETYPE_STATS[profile.archetype]
        # Делим очки поровну между характеристиками архетипа (3 стата)
        points_each = STAT_POINTS_PER_LEVEL / len(stats)

        for stat in stats:
            current = getattr(profile, stat)           # читаем текущее значение
            new_val = min(100.0, current + points_each) # максимум 100
            setattr(profile, stat, new_val)            # записываем новое значение

    async def add_reputation(self, user_id: UUID, amount: float) -> GameProfile:
        profile = await self.get_or_create_profile(user_id)
        # Репутация — зажата между 0 и 1000
        profile.reputation = max(0.0, min(1000.0, profile.reputation + amount))
        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    def build_response(self, profile: GameProfile) -> dict:
        # Добавляем вычисляемое поле xp_to_next которого нет в БД
        return {
            "id":            profile.id,
            "archetype":     profile.archetype,
            "level":         profile.level,
            "xp":            profile.xp,
            "xp_to_next":    xp_to_next_level(profile.level),  # вычисляем на лету
            "reputation":    profile.reputation,
            "season_points": profile.season_points,
            "stats": {
                "charisma":     profile.charisma,
                "influence":    profile.influence,
                "activity":     profile.activity,
                "strategy":     profile.strategy,
                "reliability":  profile.reliability,
                "organization": profile.organization,
            }
        }