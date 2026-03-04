---
id: auth
title: Авторизация (JWT)
sidebar_label: Авторизация
sidebar_position: 2
description: Регистрация, логин и JWT токены
tags: [fastapi, auth, jwt, security]
---

# Авторизация (JWT)

:::note Статус
🚧 В разработке — будет добавлено в Фазе 2
:::

## Что будет реализовано

- Регистрация с выбором фракции
- Хеширование пароля через `bcrypt`
- Выдача JWT access token при логине
- Защищённые роуты через `Depends(get_current_user)`
- Refresh token механика

---

## Зависимости

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

---

## Регистрация — эндпоинт

```python
# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from database import get_db
from models import User
from schemas import UserCreate, UserResponse
import uuid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=UserResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = User(
        id=str(uuid.uuid4()),
        username=data.username,
        email=data.email,
        password=pwd_context.hash(data.password),
        side=data.side,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
```

---

## Логин — получить токен

```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret"
ALGORITHM  = "HS256"

@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, data.email)
    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=401, detail="Неверные данные")

    token = jwt.encode(
        {"sub": user.id, "exp": datetime.utcnow() + timedelta(minutes=30)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}
```

---

## Защита роутов

```python
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    return await get_user_by_id(db, user_id)

# Использование:
@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return current_user
```
