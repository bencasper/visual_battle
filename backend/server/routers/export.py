"""Export endpoints: serialize DB battles back to JSON files."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db, settings
from services.battle_service import BattleService, get_battle_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["export"])


def get_service(db: AsyncSession = Depends(get_db)) -> BattleService:
    return get_battle_service(db)


def _write_json(filepath: Path, data: dict) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    logger.info(f"Wrote {filepath}")


def _export_paths(slug: str) -> list[Path]:
    """Return all file paths where a battle JSON should be written."""
    server_dir = Path(__file__).parent.parent
    paths = [
        server_dir / "data" / "battles" / f"{slug}.json",
    ]
    # Also update the frontend public copy if the directory exists
    frontend_public = server_dir.parent.parent / "frontend" / "public" / "data" / "battles"
    if frontend_public.parent.parent.exists():
        paths.append(frontend_public / f"{slug}.json")
    # And the frontend src/data copy
    frontend_src = server_dir.parent.parent / "frontend" / "src" / "data" / "battles"
    if frontend_src.parent.parent.exists():
        paths.append(frontend_src / f"{slug}.json")
    return paths


@router.post("/battles/{battle_id}")
async def export_battle(battle_id: str, service: BattleService = Depends(get_service)):
    """Export a single battle from DB to JSON files."""
    data = await service.export_battle_json(battle_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")

    slug = data.get("slug", battle_id)
    written = []
    for path in _export_paths(slug):
        _write_json(path, data)
        written.append(str(path))

    return {"battle_id": battle_id, "slug": slug, "files_written": written}


@router.post("/battles")
async def export_all_battles(service: BattleService = Depends(get_service)):
    """Export all battles from DB to JSON files."""
    battles = await service.list_battles()
    results = []

    for item in battles:
        data = await service.export_battle_json(item.id)
        if data is None:
            continue
        slug = data.get("slug", item.id)
        written = []
        for path in _export_paths(slug):
            _write_json(path, data)
            written.append(str(path))
        results.append({"battle_id": item.id, "slug": slug, "files_written": written})

    return {"exported": len(results), "battles": results}
