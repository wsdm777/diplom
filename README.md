# Diet Planner API

REST API для отслеживания веса и управления профилем пользователя. Построен на FastAPI с асинхронным PostgreSQL.

## Стек

- **FastAPI** — веб-фреймворк
- **PostgreSQL 16** — база данных
- **SQLAlchemy 2.0** (async) + **asyncpg** — ORM и драйвер БД
- **Alembic** — миграции
- **python-jose** + **passlib/bcrypt** — JWT-аутентификация
- **Pydantic v2** — валидация данных
- **Docker / docker-compose** — контейнеризация
- **Poetry** — управление зависимостями

## Запуск

```bash
cp .env.example .env
docker-compose up --build
```

API будет доступен на `http://localhost:8000`.
При старте контейнер автоматически применяет миграции и запускает сервер.

Swagger UI: `http://localhost:8000/docs`

## Переменные окружения

| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgresql+asyncpg://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Секрет для подписи JWT | `your-secret-key` |
| `ALGORITHM` | Алгоритм JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (мин) | `60` |

## API

### Аутентификация (`/auth`)

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/auth/register` | Регистрация пользователя |
| `POST` | `/auth/login` | Вход (устанавливает cookie `access_token`) |
| `POST` | `/auth/logout` | Выход (удаляет cookie) |
| `GET` | `/auth/me` | Данные текущего пользователя |

### Вес (`/users`)

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/users/me/weight` | Добавить запись о весе |
| `GET` | `/users/{user_id}/weight` | История веса пользователя |

Все запросы к `/users` требуют аутентификации через cookie `access_token`.

## Структура проекта

```
app/
├── core/           # Конфиг, безопасность, зависимости
├── db/             # Сессия и базовый класс ORM
├── models/         # SQLAlchemy-модели (User, WeightEntry)
├── schemas/        # Pydantic-схемы запросов/ответов
├── repositories/   # Слой доступа к данным
├── services/       # Бизнес-логика
└── routers/        # Обработчики маршрутов
alembic/            # Миграции БД
```
