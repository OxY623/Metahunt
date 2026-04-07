---
id: skills-api
title: Скиллы — API
sidebar_label: Скиллы
sidebar_position: 3
description: Логика скиллов фракций на бэкенде
tags: [fastapi, skills, factions, gameplay]
---

# Скиллы — API

## Общие правила

- Навыки с направлением работают **только по контр‑связи** (см. `R_counter`).
- Цель приходит от клиента (выбор кликом в чате).
- `Золотой щит` даёт иммунитет к контр‑навыкам на 5 минут.
- `Шёпот` создаёт анонимное сообщение, видимое только отправителю и цели.

---

## Скилл «Глитч экрана» (FOXY → OXY)

```python
# POST /api/v1/game/skills/glitch
@router.post("/skills/glitch")
async def skill_glitch(dto: TargetDto, current_user = Depends(get_current_user)):
    # только FOXY и только по OXY (counter)
    await spend_shards(current_user, 15)
    set_effect(dto.target_id, "glitch", 30)
    return {"msg": "Экран цели заглючен на 30 секунд."}
```

---

## Скилл «Прямой удар» (OXY → BEAR)

```python
# POST /api/v1/game/skills/direct_strike
@router.post("/skills/direct_strike")
async def skill_direct_strike(dto: TargetDto, current_user = Depends(get_current_user)):
    # только OXY и только по BEAR (counter)
    await spend_shards(current_user, 5)
    target.xp = max(0, target.xp - 5)
    return {"msg": "Прямой удар нанесён."}
```

---

## Скилл «Золотой щит» (BEAR)

```python
# POST /api/v1/game/skills/golden_shield
@router.post("/skills/golden_shield")
async def skill_golden_shield(current_user = Depends(get_current_user)):
    await spend_shards(current_user, 20)
    set_effect(current_user.id, "shield", 300)
    return {"msg": "Золотой щит активирован на 5 минут."}
```

---

## Скилл «Блокировка порта» (BEAR → FOXY)

```python
# POST /api/v1/game/skills/ban
@router.post("/skills/ban")
async def skill_ban(dto: TargetDto, current_user = Depends(get_current_user)):
    # только BEAR и только по FOXY (counter)
    await spend_shards(current_user, 30)
    set_effect(dto.target_id, "ban", 60)
    return {"msg": "Порт цели временно заблокирован."}
```

---

## Скилл «Шёпот» (OWL — анонимный DM)

```python
# POST /api/v1/game/skills/whisper
@router.post("/skills/whisper")
async def skill_whisper(dto: WhisperDto, current_user = Depends(get_current_user)):
    await spend_shards(current_user, 20)
    # создаём анонимное сообщение в текущей комнате
    create_whisper_message(dto.target_id, dto.message, room=dto.room)
    return {"msg": "Шёпот отправлен анонимно."}
```

---

## Стоимость скиллов — таблица

| Скилл            | Фракция | Стоимость (Осколки) | Эффект                                  |
| ---------------- | ------- | ------------------- | --------------------------------------- |
| Прямой удар      | OXY     | 5                   | −XP цели (только BEAR)                  |
| Глитч экрана     | FOXY    | 15                  | Помехи 30 сек (только OXY)              |
| Золотой Щит      | BEAR    | 20                  | Иммунитет к контр‑навыкам 5 минут       |
| Блокировка Порта | BEAR    | 30                  | Бан порта 1 минута (только FOXY)        |
| Шёпот            | OWL     | 20                  | Анонимный DM по клику (текущая комната) |
