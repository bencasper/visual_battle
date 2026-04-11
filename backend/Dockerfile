# ---- Backend Dockerfile ----
# Python 3.13 slim image for the FastAPI backend
FROM python:3.13-slim AS base

# Install system dependencies for asyncpg, psycopg2, and GeoAlchemy2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (cached layer)
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server/ ./server/
COPY scripts/ ./scripts/
COPY alembic.ini ./alembic.ini

# Working directory is the server dir so imports resolve correctly
WORKDIR /app/server

EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
