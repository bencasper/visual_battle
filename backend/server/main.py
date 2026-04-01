import logging

logging.basicConfig(
    filename="backend_app.log",
    level=logging.INFO,
    format="%(levelname)s %(asctime)s %(message)s",
)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import settings, engine, Base
from routers import battles, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (Alembic handles migrations in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Visual Battle API",
    description="API for the Visual Battle interactive historical battle visualizer",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(battles.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
