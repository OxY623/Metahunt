from dataclasses import dataclass

from app.game.models import Archetype


@dataclass(frozen=True)
class ArchetypeTask:
    key: str
    title: str
    description: str
    archetype: Archetype | None
    screen: str
    trigger: str
    reward_shards: int
    daily_limit: int
    contributes_to: str
    next_hint: str
    slot: str = "archetype"
    reward_reason: str = "quest_reward"


TASKS: tuple[ArchetypeTask, ...] = (
    ArchetypeTask(
        key="daily_login",
        title="Вернуться в сеть",
        description="Забери ежедневную награду за вход.",
        archetype=None,
        screen="dashboard",
        trigger="daily_login",
        reward_shards=10,
        daily_limit=1,
        contributes_to="activity",
        next_hint="После входа оставь след в чате или отметься на карте.",
        slot="daily",
        reward_reason="daily_login",
    ),
    ArchetypeTask(
        key="first_message",
        title="Оставить след",
        description="Напиши первое сообщение в любой комнате.",
        archetype=None,
        screen="chat",
        trigger="chat_message",
        reward_shards=5,
        daily_limit=1,
        contributes_to="activity",
        next_hint="Выбери сообщение другого игрока, чтобы увидеть доступные связи.",
        slot="daily",
        reward_reason="first_message",
    ),
    ArchetypeTask(
        key="first_move",
        title="Первый ход",
        description="Примени любой фракционный скилл или сделку.",
        archetype=None,
        screen="chat",
        trigger="skill_or_trade",
        reward_shards=15,
        daily_limit=1,
        contributes_to="counter",
        next_hint="Теперь посмотри faction pulse: он подскажет, куда давить дальше.",
        slot="daily",
    ),
    ArchetypeTask(
        key="geo_first_checkin",
        title="Отметиться в районе",
        description="Сделай первый check-in на карте.",
        archetype=None,
        screen="map",
        trigger="map_checkin",
        reward_shards=8,
        daily_limit=1,
        contributes_to="control",
        next_hint="Выбери тайл и отправь ping, если район важен для фракции.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="district_voice",
        title="Голос района",
        description="Опубликуй сигнал, который двигает публичную сцену.",
        archetype=None,
        screen="posts",
        trigger="post_created",
        reward_shards=10,
        daily_limit=2,
        contributes_to="activity",
        next_hint="Пост с geo tile связывает ленту с картой.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="use_invite",
        title="Привести контакт",
        description="Твой инвайт должен быть активирован новым участником.",
        archetype=None,
        screen="invites",
        trigger="invite_redeemed",
        reward_shards=10,
        daily_limit=3,
        contributes_to="economy",
        next_hint="Инвайты двигают численность фракции и включают налоговую экономику.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="oxy_hunt_power",
        title="Охота на власть",
        description="Примени прямой удар по BEAR.",
        archetype=Archetype.OXY,
        screen="chat",
        trigger="direct_strike",
        reward_shards=12,
        daily_limit=5,
        contributes_to="counter",
        next_hint="Если BEAR держит район, ищи его tile на карте.",
    ),
    ArchetypeTask(
        key="oxy_mark_tile",
        title="Метка охоты",
        description="Отправь hunt ping в активный район.",
        archetype=Archetype.OXY,
        screen="map",
        trigger="map_ping:hunt",
        reward_shards=8,
        daily_limit=3,
        contributes_to="control",
        next_hint="Hunt ping помогает связать охоту в чате с территорией.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="foxy_beautiful_lie",
        title="Красивый обман",
        description="Примени глитч по OXY.",
        archetype=Archetype.FOXY,
        screen="chat",
        trigger="glitch",
        reward_shards=12,
        daily_limit=5,
        contributes_to="counter",
        next_hint="После глитча уходи в постинг или инвайты, пока BEAR не закрыл порт.",
    ),
    ArchetypeTask(
        key="foxy_masked_signal",
        title="След без лица",
        description="Опубликуй анонимный сигнал с geo tile.",
        archetype=Archetype.FOXY,
        screen="posts",
        trigger="anonymous_geo_post",
        reward_shards=10,
        daily_limit=2,
        contributes_to="activity",
        next_hint="Маскировка полезна, когда BEAR усиливает контроль.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="foxy_fast_invite",
        title="Быстрая вербовка",
        description="Добейся активации инвайта как FOXY.",
        archetype=Archetype.FOXY,
        screen="invites",
        trigger="invite_redeemed",
        reward_shards=12,
        daily_limit=3,
        contributes_to="economy",
        next_hint="FOXY сильнее всех разгоняет сеть, но каждая активация кормит налоговую игру.",
        slot="archetype",
    ),
    ArchetypeTask(
        key="bear_control_seal",
        title="Печать контроля",
        description="Заблокируй порт FOXY.",
        archetype=Archetype.BEAR,
        screen="chat",
        trigger="ban",
        reward_shards=12,
        daily_limit=5,
        contributes_to="counter",
        next_hint="После блокировки проверь казну и удержание районов.",
    ),
    ArchetypeTask(
        key="bear_raise_shield",
        title="Поднять щит",
        description="Активируй Золотой щит.",
        archetype=Archetype.BEAR,
        screen="chat",
        trigger="golden_shield",
        reward_shards=6,
        daily_limit=2,
        contributes_to="economy",
        next_hint="Щит покупает время для налогов и checkpoint-задач.",
        slot="pulse",
    ),
    ArchetypeTask(
        key="owl_silent_price",
        title="Тихая цена",
        description="Закрой сделку с данными.",
        archetype=Archetype.OWL,
        screen="chat",
        trigger="owl_deal",
        reward_shards=20,
        daily_limit=3,
        contributes_to="intel",
        next_hint="Продавай сигнал той стороне, которой сейчас больнее всего.",
    ),
    ArchetypeTask(
        key="owl_whisper_seed",
        title="Посеять шепот",
        description="Отправь анонимный шепот выбранной цели.",
        archetype=Archetype.OWL,
        screen="chat",
        trigger="whisper",
        reward_shards=8,
        daily_limit=3,
        contributes_to="intel",
        next_hint="Шепот создает повод для новой сделки.",
        slot="pulse",
    ),
)

TASK_BY_KEY = {task.key: task for task in TASKS}

QUEST_REWARDS = {
    task.key: {
        "reward": task.reward_shards,
        "daily_limit": task.daily_limit,
        **({"archetype": task.archetype} if task.archetype else {}),
    }
    for task in TASKS
    if task.reward_reason == "quest_reward" and task.key not in {"daily_login", "first_message"}
}
