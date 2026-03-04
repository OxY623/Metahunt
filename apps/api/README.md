# Backand
## Активация env окружения 
`source venv/bin/activate`

## Структура проекта(separation of concerns)

api/
│
├── main.py                    ← точка входа, запуск сервера
├── .env                       ← переменные окружения (секреты)
├── requirements.txt
│
└── app/
    ├── __init__.py
    ├── database.py            ← подключение к PostgreSQL
    ├── config.py              ← настройки из .env
    │
    └── users/
        ├── __init__.py
        ├── models.py          ← таблица в БД
        ├── schemas.py         ← формат данных (вход/выход API)
        ├── repository.py      ← запросы к БД
        ├── service.py         ← бизнес-логика
        ├── dependencies.py    ← dependency injection
        └── router.py          ← HTTP эндпоинты


```

---

## 🔄 Как всё это работает вместе — путь запроса

Клиент отправляет PATCH /api/v1/users/profile
             │
             ▼
        main.py
  app.include_router() находит нужный роутер
             │
             ▼
       router.py
  @router.patch("/profile") — нашли эндпоинт
  FastAPI читает JSON тело → создаёт UserUpdate
  Запускает цепочку Depends():
    get_session() → открывает сессию БД
    get_user_repository(session) → создаёт репозиторий
    get_user_service(repo) → создаёт сервис
             │
             ▼
       service.py
  update_profile() — проверяет никнейм, бизнес-правила
             │
             ▼
      repository.py
  update() — выполняет UPDATE в PostgreSQL
             │
             ▼
  Данные идут обратно наверх
  router.py получает User объект
  FastAPI сериализует через UserResponse (без password_hash)
             │
             ▼
  Клиент получает JSON { id, email, nickname, ... }



  Регистрация
    │
    ▼
game_profile создаётся автоматически
archetype = NULL, level = 1, все статы = 0
    │
    ▼
Онбординг: POST /game/archetype
Игрок выбирает FOXY или OXY (один раз навсегда)
    │
    ▼
Активность на платформе → add_xp()
    │
    ▼
Level Up → _apply_level_up_stats()
FOXY: charisma / influence / activity растут
OXY:  strategy / reliability / organization растут
    │
    ▼
Репутация копится за помощь, ивенты, тикеты


1. POST /auth/register
   → создаётся User + GameProfile
   → возвращает UserResponse

2. POST /auth/login  { email, password }
   → проверяем пароль
   → создаём access_token (30 мин) + refresh_token (7 дней)
   → access_token → тело ответа (фронт хранит в памяти)
   → refresh_token → httpOnly cookie

3. Каждый запрос к защищённому эндпоинту:
   → заголовок: Authorization: Bearer <access_token>
   → get_current_user проверяет токен → возвращает User

4. Access token истёк → POST /auth/refresh
   → браузер автоматически отправляет cookie с refresh_token
   → получаем новый access_token + новый refresh_token (rotation)

5. POST /auth/logout
   → refresh_token отзывается в БД
   → cookie удаляется