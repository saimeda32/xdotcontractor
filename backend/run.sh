#!/bin/bash

# Generate Alembic files only if they don't already exist
if [ ! -f "/app/alembic.ini" ]; then
    alembic init migrations
fi

# Set the correct database URL in alembic.ini if it exists
if [ -f "/app/alembic.ini" ]; then
    sed -i "s|sqlalchemy.url =.*|sqlalchemy.url = ${DATABASE_URL}|" /app/alembic.ini
fi

# Generate initial migration if it hasn't been created
if [ -z "$(ls -A migrations/versions)" ]; then
    alembic revision --autogenerate -m "Initial migration"
fi

# Apply the migration
alembic upgrade head

# Start FastAPI
uvicorn main:app --host 0.0.0.0 --port 8000
