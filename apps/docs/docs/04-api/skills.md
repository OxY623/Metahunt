---
id: skills-api
title: Скиллы — API
sidebar_label: Скиллы
sidebar_position: 3
description: Логика скиллов фракций на бэкенде
tags: [fastapi, skills, factions, gameplay]
---

# Скиллы — API

## Логика «Налогового Инспектора» (Медведь)

Срабатывает автоматически при визите Волка к Лисе.

```python
# POST /interact
@app.post("/interact")
async def interact(visitor_id: str, target_id: str, db: AsyncSession = Depends(get_db)):
    visitor = await get_user(db, visitor_id)
    target  = await get_user(db, target_id)

    if visitor.side == "oxy" and target.side == "foxy":
        tax = 10
        visitor.shards        -= tax
        target.shards         += int(tax * 0.3)   # Лисе 30%
        # Bear treasury получает 70% — отдельная таблица
        await log_transaction(db, visitor_id, target_id, tax, "bear_tax")
        await db.commit()
        return {"msg": "Медведь взял налог за вход. Ты обеднел.", "shards_lost": tax}

    return {"msg": "Визит засчитан."}
```

---

## Скилл «Глитч экрана» (Лиса → Волк)

```python
# POST /skills/glitch
@router.post("/glitch")
async def glitch_screen(target_id: str, current_user = Depends(get_current_user)):
    if current_user.side != "foxy":
        raise HTTPException(403, "Только Лиса может использовать этот скилл")
    if current_user.shards < 15:
        raise HTTPException(400, "Недостаточно Осколков")

    current_user.shards -= 15
    # Записываем активный эффект на 30 секунд
    await set_effect(target_id, "glitch", duration_seconds=30)
    return {"msg": "Экран Волка заглючен на 30 секунд.", "shards_spent": 15}
```

---

## Скилл «Шёпот» (Сова — анонимный DM)

```python
# POST /skills/whisper
@router.post("/whisper")
async def whisper(target_id: str, message: str, current_user = Depends(get_current_user)):
    if current_user.side != "owl":
        raise HTTPException(403, "Только Сова может шептать")

    cost = 20  # двойная цена за анонимность
    if current_user.shards < cost:
        raise HTTPException(400, "Недостаточно Осколков")

    current_user.shards -= cost
    await send_anonymous_message(target_id, message)
    return {"msg": "Шёпот отправлен. Получатель не знает от кого."}
```

---

## Стоимость скиллов — таблица

| Скилл            | Фракция | Стоимость (Осколки) | Эффект                      |
| ---------------- | ------- | ------------------- | --------------------------- |
| Прямой удар      | OXY     | 5                   | -XP противника без комиссии |
| Глитч экрана     | FOXY    | 15                  | Блокировка UI Волка 30 сек  |
| Золотой Щит      | BEAR    | 20                  | Волк не видит Лису 5 мин    |
| Блокировка Порта | BEAR    | 30                  | Бан Волка на 1 минуту       |
| Шёпот            | OWL     | 20                  | Анонимный DM                |
| Прослушка        | OWL     | 25                  | Кто смотрит профиль (1 час) |
| Слив компромата  | OWL     | 10                  | Продать данные за Осколки   |
