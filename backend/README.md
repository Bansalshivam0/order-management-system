# Backend

FastAPI backend for the Order Management System.

## Run locally

Set `DATABASE_URL` to your PostgreSQL server before starting the app. For a local database named `order_management`, the value looks like this:

```bash
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/order_management
```

Then run the app:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-dir app
```

## Docker

```bash
cd backend
cp .env.example .env
docker compose up --build
```

## Alembic

Use Alembic for database migrations after adding models:

```bash
cd backend
alembic revision --autogenerate -m "add your migration message"
alembic upgrade head
```

