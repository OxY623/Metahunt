---
id: archetype-tasks
title: Задачи Архетипов
sidebar_label: Задачи Архетипов
sidebar_position: 4
description: Логика задач для архетипов, связанная с чатом, картой, постингом, ledger и faction pulse
tags: [gameplay, archetypes, quests, shards, roadmap]
---

# Задачи Архетипов

:::note Статус
Рабочая спецификация для следующей итерации. Документ связывает уже реализованные процессы: выбор архетипа, скиллы, `shards_ledger`, чат, карту, постинг, инвайты и faction pulse.
:::

## Зачем нужен слой задач

Сейчас в MetaHunt уже есть базовая игровая петля:

```text
выбор архетипа -> действие в чате/карте/постах -> списание или награда Осколков ->
ledger -> faction pulse -> рекомендация следующего действия
```

Задачи должны не добавлять отдельную мини-игру, а объяснять игроку, зачем идти в уже существующие экраны:

- чат дает цель и контр-действия;
- карта дает территорию, check-in и ping;
- постинг дает публичный сигнал и реакции;
- инвайты дают рост фракции и налоговую экономику;
- ledger показывает последствия;
- faction pulse превращает личное действие во вклад фракции.

## Что уже можно использовать

| Процесс | Уже есть в коде | Как использовать в задачах |
| --- | --- | --- |
| Выбор архетипа | `POST /api/v1/game/archetype` | Открывает персональные задачи и фракционные подсказки |
| Ledger Осколков | `GET /api/v1/game/shards/ledger`, `shards_ledger` | Источник правды для прогресса и наград |
| Дневная награда | `POST /api/v1/game/rewards/daily-login` | Общий стартовый daily task |
| Быстрые квесты | `POST /api/v1/game/rewards/quest`, `QUEST_REWARDS` | MVP-реестр задач с лимитами |
| Контр-скиллы | `glitch`, `direct_strike`, `ban`, `golden_shield`, `whisper`, `owl_deal` | Архетипные задачи с расходом/наградой |
| Чат | сообщения, выбор цели кликом, эффекты | Основной экран выполнения задач |
| Faction pulse | `GET /api/v1/game/factions/pulse` | Подсказывает, какая задача выгодна сейчас |
| Карта | tiles, clusters, check-in, ping | Территориальные задачи и влияние района |
| Постинг | посты, boost, anonymous, geo tile | Публичные задачи и реакционные награды |
| Инвайты | лимиты по архетипам, налог BEAR/доля FOXY | Задачи роста сети и экономики |

## Модель задачи

Задача должна быть событием поверх существующих действий. Минимальная модель:

```ts
type ArchetypeTask = {
  key: string;
  archetype: "ALL" | "FOXY" | "OXY" | "BEAR" | "OWL";
  screen: "dashboard" | "chat" | "map" | "posts" | "invites";
  trigger: string;
  reward_reason: string;
  reward_shards: number;
  daily_limit: number;
  contributes_to: "economy" | "counter" | "control" | "activity" | "intel";
  next_hint: string;
};
```

Правило: задача считается выполненной только если действие уже прошло через существующий backend-процесс. Награда пишется в `shards_ledger` с `reason = quest_reward`, а в `meta.key` хранится ключ задачи.

## Общая петля игрока

```text
1. Игрок открывает dashboard.
2. Видит 1 общую задачу, 1 архетипную задачу, 1 задачу из faction pulse.
3. Переходит в нужный экран: chat/map/posts/invites.
4. Делает реальное действие: skill, check-in, ping, post, invite.
5. Backend пишет cost/reward в ledger.
6. Dashboard показывает результат и предлагает следующий шаг.
```

Важно: задача не должна награждать за нажатие кнопки "получить". Она должна проверять факт действия в ledger, chat events, map events, posts или invites.

## Базовые задачи для всех

| Key | Задача | Экран | Условие | Награда | Уже связано |
| --- | --- | --- | --- | ---: | --- |
| `daily_login` | Вернуться в сеть | Dashboard | Первый вход за день | +10 | `daily_login` |
| `first_message` | Оставить след | Chat | Первое сообщение в комнате | +5 | `first_message` |
| `first_move` | Сделать первый ход | Chat/Dashboard | Любой фракционный skill или trade | +15 | `QUEST_REWARDS.first_move` |
| `district_voice` | Голос района | Posts | Пост получил 3 реакции | +10 | `QUEST_REWARDS.district_voice` |
| `geo_first_checkin` | Отметиться в районе | Map | Первый check-in за день | +8 | `geo_checkin_reward` |
| `use_invite` | Привести контакт | Invites | Инвайт был активирован | +20 до налога | invite reward/tax |

## OXY: охота и давление

OXY должен получать задачи не "атакуй всех", а "ломай тяжелый контроль BEAR и создавай окно для команды".

| Key | Задача | Экран | Условие | Награда | Связь с процессами |
| --- | --- | --- | --- | ---: | --- |
| `oxy_hunt_power` | Охота на власть | Chat | `direct_strike` по BEAR | +12, OXY получает +20% | Уже есть в `QUEST_REWARDS` и `grant_counter_reward` |
| `oxy_mark_tile` | Метка охоты | Map | Ping типа `hunt` в BEAR/contested tile | +8 | Использует `mapPing`, дальше нужен influence score |
| `oxy_break_checkpoint` | Сломать контроль | Map | Сделать действие в tile, где доминирует BEAR | +12 | Ляжет на `dominant_archetype` сейчас, потом на control score |
| `oxy_public_call` | Публичный вызов | Posts | Пост с geo tile и пометкой цели | +10 | Использует post + geo tile |

## FOXY: скорость, маскировка, провокация

FOXY должна разгонять социальный шум, но жить под угрозой BEAR.

| Key | Задача | Экран | Условие | Награда | Связь с процессами |
| --- | --- | --- | --- | ---: | --- |
| `foxy_beautiful_lie` | Красивый обман | Chat | `glitch` по OXY | +12 | Уже есть в `QUEST_REWARDS` и `grant_counter_reward` |
| `foxy_masked_signal` | След без лица | Posts | Anonymous/hidden post с geo tile | +10 | Использует post anonymous + geo |
| `foxy_fast_invite` | Быстрая вербовка | Invites | Создать и активировать инвайт | +12 | Использует invite limits и reward/tax |
| `foxy_escape_bear` | Уйти от печати | Chat/Map | Действие после угрозы BEAR без ban effect | +8 | Нужна проверка активных effects |

## BEAR: контроль, казна, удержание

BEAR должен играть не только банами. Его задачи должны делать экономику видимой.

| Key | Задача | Экран | Условие | Награда | Связь с процессами |
| --- | --- | --- | --- | ---: | --- |
| `bear_control_seal` | Печать контроля | Chat | `ban` по FOXY | +12 | Уже есть в `QUEST_REWARDS` и `grant_counter_reward` |
| `bear_raise_shield` | Поднять щит | Chat/Dashboard | `golden_shield` активирован | +6 | Уже есть skill cost/effect |
| `bear_collect_tax` | Собрать казну | Invites/Interact | Получить `tax_income` | +8 | Уже есть `apply_tax_split` |
| `bear_checkpoint` | Поставить чек-пойнт | Map | Geo action типа checkpoint | +10 | Стоимость есть в `balance.py`, endpoint еще нужен |

## OWL: информация и сделки

OWL не должен побеждать прямым давлением. Его задачи должны связывать перекос сил с рынком данных.

| Key | Задача | Экран | Условие | Награда | Связь с процессами |
| --- | --- | --- | --- | ---: | --- |
| `owl_silent_price` | Тихая цена | Chat | `owl_deal` с любым архетипом | +20 | Уже есть в `QUEST_REWARDS` и `grant_owl_deal` |
| `owl_whisper_seed` | Посеять шепот | Chat | `whisper` по выбранной цели | +8 | Уже есть whisper + anonymous message |
| `owl_scan_district` | Скан района | Map | Intel scan активной зоны | +10 | Стоимость есть в `balance.py`, endpoint еще нужен |
| `owl_sell_to_underdog` | Продать слабой стороне | Chat/Pulse | Сделка с фракцией под давлением | +15 | Нужен расширенный `factions/pulse` |

## Как выбирать следующую задачу

Система должна предлагать не полный список, а 2-3 понятных действия:

| Слот | Правило выбора | Пример |
| --- | --- | --- |
| Daily | Самая простая общая задача дня | daily login, first message, check-in |
| Archetype | Личная задача по выбранному архетипу | OXY -> удар по BEAR |
| Pulse | Задача из текущего фракционного перекоса | BEAR доминирует -> OXY получает hunt target |

Если архетип не выбран, показываем только:

- выбрать архетип;
- написать первое сообщение;
- посмотреть карту;
- забрать daily login.

## Привязка к ledger

Рекомендуемые `reason`:

| Reason | Когда |
| --- | --- |
| `quest_reward` | Награда за задачу |
| `counter_reward` | Автонаграда за успешный counter skill |
| `daily_login` | Daily |
| `first_message` | Первое сообщение |
| `geo_checkin_reward` | Первый/полезный check-in |
| `skill_cost` | Стоимость скилла |
| `tax` | Списание налога |
| `tax_income` | Доход BEAR/FOXY |
| `owl_deal` | Доход OWL |
| `post_reaction_reward` | Пост набрал реакции |

Для `quest_reward.meta`:

```json
{
  "key": "oxy_hunt_power",
  "source": "chat",
  "archetype": "OXY",
  "target_archetype": "BEAR",
  "tile_id": "x1439y2075"
}
```

## Приоритет реализации

### Этап 1: Зафиксировать задачи как backend-реестр

1. Вынести `QUEST_REWARDS` в отдельный task registry.
2. Добавить поля: `screen`, `trigger`, `contributes_to`, `next_hint`.
3. Добавить endpoint:

```http
GET /api/v1/game/tasks
```

Ответ должен возвращать доступные задачи, прогресс за день и рекомендацию.

### Этап 2: Автоматически закрывать задачи по событиям

1. После skill/counter проверять `first_move` и архетипную задачу.
2. После chat message проверять `first_message`.
3. После map check-in/ping проверять geo-задачи.
4. После post/reaction проверять post-задачи.
5. После invite redeem проверять invite-задачи.

### Этап 3: Связать задачи с faction pulse

1. Расширить `factions/pulse` недельными целями.
2. Добавить "слабую сторону" и recommended task key.
3. Показывать на dashboard: личный вклад, фракционный вклад, следующую цель.

## Минимальный DoD

Задачный слой готов, когда игрок:

1. Видит задачи, соответствующие своему архетипу.
2. Выполняет задачу через реальный экран, а не через отдельную кнопку награды.
3. Получает запись в `shards_ledger`.
4. Видит, как задача связана с фракционным конфликтом.
5. Получает следующую рекомендацию от `factions/pulse`.

Тогда архетип становится не цветом профиля, а ежедневным способом играть.
