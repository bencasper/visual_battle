"""
Seed script: reads battle JSON files and upserts them into Postgres.

Usage:
    cd server
    python -m scripts.seed_db
"""
import asyncio
import json
import sys
from pathlib import Path
from datetime import date

# Ensure project root is on path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from server.db.database import engine, Base, settings
from server.db.models import Battle, BattlePhase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert


DATA_DIR = Path(__file__).parent.parent / "server" / "data" / "battles"


def parse_date(d: str) -> date | None:
    try:
        return date.fromisoformat(d)
    except Exception:
        return None


async def seed():
    # Ensure PostGIS extension exists
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        await conn.run_sync(Base.metadata.create_all)

    battle_files = list(DATA_DIR.glob("*.json"))
    if not battle_files:
        print(f"No battle JSON files found in {DATA_DIR}")
        return

    async with AsyncSession(engine) as session:
        for filepath in battle_files:
            print(f"Seeding: {filepath.name}")
            battle_data = json.loads(filepath.read_text())

            phases = battle_data.pop("phases", [])

            # Upsert battle row
            stmt = pg_insert(Battle).values(
                id=battle_data["id"],
                slug=battle_data["slug"],
                name=battle_data["name"],
                theater=battle_data["theater"],
                date_start=parse_date(battle_data["date_range"]["start"]),
                date_end=parse_date(battle_data["date_range"]["end"]),
                location=f"SRID=4326;POINT({battle_data['location']['lng']} {battle_data['location']['lat']})",
                map_bounds=battle_data.get("map_bounds"),
                data=battle_data,
            ).on_conflict_do_update(
                index_elements=["id"],
                set_={"name": battle_data["name"], "data": battle_data},
            )
            await session.execute(stmt)

            # Upsert phases
            for phase in phases:
                phase_stmt = pg_insert(BattlePhase).values(
                    id=phase["id"],
                    battle_id=battle_data["id"],
                    phase_index=phase["index"],
                    label=phase["label"],
                    date_start=parse_date(phase["date_range"]["start"]),
                    date_end=parse_date(phase["date_range"]["end"]),
                    data=phase,
                ).on_conflict_do_update(
                    index_elements=["id"],
                    set_={"label": phase["label"], "data": phase},
                )
                await session.execute(phase_stmt)

        await session.commit()
        print(f"Seeded {len(battle_files)} battle(s) successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
