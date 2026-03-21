# MetaHunt

## 📘 Документация разработки игрового сайта

**Проект:** Игровой портал (Landing + Личный кабинет + API)
**Тип:** Web Platform / Game Service Portal
**Цель:** создать официальный сайт игрового сервера с системой аккаунтов, платежей и поддержки.

---

# 1. 🎯 Цели проекта

## Бизнес-цели

- Упростить вход новых игроков
- Централизовать управление аккаунтом
- Монетизация через платежи
- Повысить доверие (безопасность + стабильность)
- Создать масштабируемую платформу

## Пользовательские цели

- Быстро начать играть
- Управлять аккаунтом
- Пополнять баланс
- Получать поддержку
- Следить за новостями сервера

---

# 2. 🧱 Архитектура системы

## Общая схема

```
Client (Next.js)
      ↓
API Gateway (/api/v1)
      ↓
Backend (NestJS)
      ↓
PostgreSQL
      ↓
Payment Provider (webhooks)
```

---

## Frontend (приоритет)

- React
- Next.js (App Router)
- TypeScript
- Tailwind / shadcn UI
- React Query / RTK Query
- Axios / Fetch API

### Причины выбора Next.js

- SSR → SEO для лендинга
- API routes при необходимости
- оптимизация загрузки
- image optimization
- middleware для auth

---

## Backend

**NestJS**

Почему:

- модульная архитектура
- guards (auth)
- interceptors
- validation pipes
- enterprise-ready

---

## Database

**PostgreSQL**

Причины:

- транзакции
- JSONB
- надежность
- масштабируемость

ORM:

- Prisma (приоритет)

---

# 3. 🧩 Модули системы

## Frontend Modules

| Модуль          | Назначение          |
| --------------- | ------------------- |
| Landing         | привлечение игроков |
| Auth            | вход/регистрация    |
| Dashboard       | личный кабинет      |
| Payments        | баланс              |
| Support         | тикеты              |
| News            | новости             |
| Admin (минимум) | управление          |

---

## Backend Modules

```
auth
users
payments
promo
tickets
activity-log
news
admin
```

---

# 4. 🎨 Структура страниц

---

## 🏠 Главная (Landing)

### Sections

1. Header
2. Hero section
3. How to play
4. Updates
5. About server
6. Community
7. Footer

---

### Header

- логотип
- меню:
  - Новости
  - Ивенты
  - Дорожная карта
  - Магазин
  - Поддержка

- CTA:
  - Регистрация
  - Скачать

---

### Hero Screen

- fullscreen арт / видео
- название сервера
- слоган
- кнопки:
  - Начать играть
  - Скачать клиент

---

### How to Play

3 карточки:

```
1. Регистрация
2. Скачать клиент
3. Войти
```

---

### Актуальное

Карточки:

- патчи
- ивенты
- roadmap (2 месяца)

---

### О сервере

- рейты
- уникальные механики
- PvP/PvE особенности

---

### Сообщество

- Discord
- Telegram
- YouTube
- VK

---

### Footer

- правила
- контакты
- copyright

---

# 5. 👤 Личный кабинет

## Dashboard Layout

```
Sidebar
 ├ Profile
 ├ Balance
 ├ Purchases
 ├ Promo codes
 ├ Support
 ├ Activity
 └ Characters (soon)
```

---

## Профиль

- ник
- email
- аватар
- смена пароля

---

## Баланс

- текущий баланс
- кнопка пополнить
- выбор суммы
- история операций

---

## История покупок

- дата
- товар
- сумма
- статус

---

## Промокоды

- ввод кода
- результат
- история активаций

---

## Поддержка

- создать тикет
- статус
- переписка

---

## Активность

- входы
- IP
- устройство
- дата

---

# 6. 🔐 Безопасность

## Auth

- JWT access token
- refresh token (httpOnly cookie)

---

## Защита

- bcrypt hashing
- rate limit
- CSRF protection
- email verification
- audit logs

---

## Route protection

Frontend:

```
middleware.ts
```

Backend:

```
AuthGuard
RolesGuard
```

---

# 7. 📡 API Design

## Base URL

```
/api/v1
```

---

## Auth

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/reset-password
POST /auth/verify-email
```

---

## Users

```
GET /users/me
PATCH /users/profile
```

---

## Payments

```
GET /payments/history
POST /payments/create
POST /payments/webhook
```

---

## Promo

```
POST /promo/redeem
GET /promo/history
```

---

## Tickets

```
GET /tickets
POST /tickets
GET /tickets/:id
POST /tickets/:id/message
```

---

## Activity

```
GET /activity
```

---

# 8. 🗄️ Основные таблицы БД

### users

- id
- email
- password_hash
- nickname
- avatar
- verified
- created_at

### balances

- user_id
- amount

### transactions

- id
- type
- amount
- status

### promo_codes

- code
- reward
- expires_at

### tickets

- id
- status
- user_id

### activity_logs

- user_id
- ip
- device
- timestamp

---

# 9. 🚀 Deployment

## Frontend

- Vercel / Docker

## Backend

- VPS + Docker
- Nginx
- HTTPS (Let's Encrypt)

---

## CI/CD

```
push → tests → build → deploy
```

---

# 10. 📖 API Documentation

- Swagger `/api/docs`
- OpenAPI schema

---

# 11. 📋 User Stories (Agile)

---

## 👶 Новый игрок

**US-01**
Как новый игрок
Я хочу увидеть красивый лендинг
Чтобы понять, стоит ли играть.

**Acceptance**

- hero экран
- описание сервера
- кнопка начать игру

---

## 🧾 Регистрация

**US-02**
Как игрок
Я хочу зарегистрироваться через email
Чтобы создать аккаунт.

**Acceptance**

- email verification
- ошибки валидации
- success screen

---

## 🔑 Авторизация

**US-03**
Как пользователь
Я хочу входить в аккаунт
Чтобы управлять профилем.

---

## 💰 Пополнение

**US-04**
Как игрок
Я хочу пополнить баланс
Чтобы покупать игровые предметы.

---

## 🎟 Поддержка

**US-05**
Как пользователь
Я хочу создать тикет
Чтобы решить проблему.

---

## 📜 История

**US-06**
Как пользователь
Я хочу видеть историю операций
Чтобы контролировать расходы.

---

## 🔐 Безопасность

**US-07**
Как пользователь
Я хочу видеть лог входов
Чтобы понимать, что аккаунт защищён.

---

# 12. 📦 Definition of Done

✅ адаптив
✅ авторизация
✅ личный кабинет
✅ платежи работают
✅ API документация
✅ деплой инструкция
✅ аудит логов
✅ защита роутов

---

# 13. 🧭 Roadmap разработки (пример)

### Phase 1 — Foundation

- Auth
- Landing
- DB schema

### Phase 2 — Cabinet

- Profile
- Balance
- Payments

### Phase 3 — Social

- Tickets
- Activity logs

### Phase 4 — Growth

- Admin panel
- Characters
- Events CMS

---

# 14. 📈 Будущее масштабирование

- Redis (sessions/cache)
- Queue (BullMQ)
- CDN assets
- Microservices payments
- Game API integration
