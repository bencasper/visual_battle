from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from db.models import Battle, BattlePhase
from models.battle import BattleModel, BattleListItem, BattlePhasesResponse
from models.battle_requests import (
    BattleCreateRequest, BattleUpdateRequest,
    PhaseCreateRequest, PhaseUpdateRequest,
)
from datetime import date
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def _parse_date(d: str) -> date | None:
    try:
        return date.fromisoformat(d)
    except Exception:
        return None


class BattleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Read ──────────────────────────────────────────────────────────────────

    async def list_battles(self) -> list[BattleListItem]:
        result = await self.db.execute(select(Battle))
        rows = result.scalars().all()
        items = []
        for row in rows:
            data = row.data
            items.append(BattleListItem(
                id=row.id,
                name=row.name,
                slug=row.slug,
                theater=row.theater,
                date_range=data.get("date_range", {}),
                location=data.get("location", {}),
                faction_names=[f["name"] for f in data.get("factions", [])],
                outcome=data.get("outcome", ""),
            ))
        return items

    async def get_battle(self, battle_id: str) -> Optional[BattleModel]:
        result = await self.db.execute(
            select(Battle).where(Battle.id == battle_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return None

        phases_result = await self.db.execute(
            select(BattlePhase)
            .where(BattlePhase.battle_id == battle_id)
            .order_by(BattlePhase.phase_index)
        )
        phase_rows = phases_result.scalars().all()

        battle_data = dict(row.data)
        battle_data["phases"] = [p.data for p in phase_rows]
        return BattleModel(**battle_data)

    async def get_phases(self, battle_id: str) -> Optional[list]:
        exists = await self.db.execute(
            select(Battle.id).where(Battle.id == battle_id)
        )
        if not exists.scalar_one_or_none():
            return None

        result = await self.db.execute(
            select(BattlePhase)
            .where(BattlePhase.battle_id == battle_id)
            .order_by(BattlePhase.phase_index)
        )
        rows = result.scalars().all()
        return [r.data for r in rows]

    # ── Create ────────────────────────────────────────────────────────────────

    async def create_battle(self, req: BattleCreateRequest) -> BattleModel:
        """Create a new battle (without phases — add those separately)."""
        # Build the JSONB data blob (everything the frontend expects)
        data_blob = {
            "id": req.id,
            "name": req.name,
            "slug": req.slug,
            "theater": req.theater,
            "date_range": req.date_range,
            "location": req.location,
            "terrain_type": req.terrain_type,
            "map_bounds": req.map_bounds,
            "outcome": req.outcome,
            "result_summary": req.result_summary,
            "factions": req.factions,
            "casualties": req.casualties,
            "key_figures": req.key_figures,
            "sources": req.sources,
            "wisdom": req.wisdom,
        }

        loc = req.location
        wkt = f"SRID=4326;POINT({loc['lng']} {loc['lat']})" if "lat" in loc and "lng" in loc else None

        battle = Battle(
            id=req.id,
            slug=req.slug,
            name=req.name,
            theater=req.theater,
            date_start=_parse_date(req.date_range.get("start", "")),
            date_end=_parse_date(req.date_range.get("end", "")),
            location=wkt,
            map_bounds=req.map_bounds,
            outcome=req.outcome,
            result_summary=req.result_summary,
            terrain_type=req.terrain_type,
            data=data_blob,
        )
        self.db.add(battle)
        await self.db.commit()
        await self.db.refresh(battle)
        logger.info(f"Created battle: {req.id}")

        # Return the full model (no phases yet)
        return BattleModel(**{**data_blob, "phases": []})

    async def update_battle(self, battle_id: str, req: BattleUpdateRequest) -> Optional[BattleModel]:
        """Partial update of a battle. Merges provided fields into existing data."""
        result = await self.db.execute(
            select(Battle).where(Battle.id == battle_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return None

        data_blob = dict(row.data)

        # Update each provided field in both columns and JSONB blob
        updates = req.model_dump(exclude_unset=True)
        for key, value in updates.items():
            data_blob[key] = value

        # Sync top-level columns
        if req.name is not None:
            row.name = req.name
        if req.slug is not None:
            row.slug = req.slug
        if req.theater is not None:
            row.theater = req.theater
        if req.date_range is not None:
            row.date_start = _parse_date(req.date_range.get("start", ""))
            row.date_end = _parse_date(req.date_range.get("end", ""))
        if req.location is not None:
            loc = req.location
            if "lat" in loc and "lng" in loc:
                row.location = f"SRID=4326;POINT({loc['lng']} {loc['lat']})"
        if req.map_bounds is not None:
            row.map_bounds = req.map_bounds
        if req.outcome is not None:
            row.outcome = req.outcome
        if req.result_summary is not None:
            row.result_summary = req.result_summary
        if req.terrain_type is not None:
            row.terrain_type = req.terrain_type

        row.data = data_blob
        await self.db.commit()
        await self.db.refresh(row)
        logger.info(f"Updated battle: {battle_id}")

        return await self.get_battle(battle_id)

    async def delete_battle(self, battle_id: str) -> bool:
        """Delete a battle and all its phases."""
        result = await self.db.execute(
            select(Battle).where(Battle.id == battle_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return False

        # Delete phases first
        await self.db.execute(
            delete(BattlePhase).where(BattlePhase.battle_id == battle_id)
        )
        await self.db.delete(row)
        await self.db.commit()
        logger.info(f"Deleted battle: {battle_id}")
        return True

    # ── Phase CRUD ────────────────────────────────────────────────────────────

    async def create_phase(self, battle_id: str, req: PhaseCreateRequest) -> Optional[dict]:
        """Create a new phase for an existing battle."""
        # Verify battle exists
        exists = await self.db.execute(
            select(Battle.id).where(Battle.id == battle_id)
        )
        if not exists.scalar_one_or_none():
            return None

        # Determine next phase_index
        max_idx = await self.db.execute(
            select(func.coalesce(func.max(BattlePhase.phase_index), -1))
            .where(BattlePhase.battle_id == battle_id)
        )
        next_index = max_idx.scalar() + 1

        data_blob = {
            "id": req.id,
            "index": next_index,
            "label": req.label,
            "date_range": req.date_range,
            "timestamp_offset_hours": req.timestamp_offset_hours,
            "summary": req.summary,
            "tactical_situation": req.tactical_situation,
            "unit_positions": req.unit_positions,
            "events": req.events,
            "annotation": req.annotation,
            "weather": req.weather,
        }

        phase = BattlePhase(
            id=req.id,
            battle_id=battle_id,
            phase_index=next_index,
            label=req.label,
            date_start=_parse_date(req.date_range.get("start", "")),
            date_end=_parse_date(req.date_range.get("end", "")),
            data=data_blob,
        )
        self.db.add(phase)
        await self.db.commit()
        logger.info(f"Created phase {req.id} for battle {battle_id}")
        return data_blob

    async def update_phase(self, battle_id: str, phase_id: str, req: PhaseUpdateRequest) -> Optional[dict]:
        """Partial update of a phase."""
        result = await self.db.execute(
            select(BattlePhase).where(
                BattlePhase.id == phase_id,
                BattlePhase.battle_id == battle_id,
            )
        )
        row = result.scalar_one_or_none()
        if not row:
            return None

        data_blob = dict(row.data)
        updates = req.model_dump(exclude_unset=True)
        for key, value in updates.items():
            data_blob[key] = value

        # Sync columns
        if req.label is not None:
            row.label = req.label
        if req.date_range is not None:
            row.date_start = _parse_date(req.date_range.get("start", ""))
            row.date_end = _parse_date(req.date_range.get("end", ""))

        row.data = data_blob
        await self.db.commit()
        logger.info(f"Updated phase {phase_id}")
        return data_blob

    async def delete_phase(self, battle_id: str, phase_id: str) -> bool:
        """Delete a phase and re-index remaining phases."""
        result = await self.db.execute(
            select(BattlePhase).where(
                BattlePhase.id == phase_id,
                BattlePhase.battle_id == battle_id,
            )
        )
        row = result.scalar_one_or_none()
        if not row:
            return False

        await self.db.delete(row)
        await self.db.flush()

        # Re-index remaining phases
        remaining = await self.db.execute(
            select(BattlePhase)
            .where(BattlePhase.battle_id == battle_id)
            .order_by(BattlePhase.phase_index)
        )
        for idx, phase in enumerate(remaining.scalars().all()):
            phase.phase_index = idx
            data = dict(phase.data)
            data["index"] = idx
            phase.data = data

        await self.db.commit()
        logger.info(f"Deleted phase {phase_id} from battle {battle_id}")
        return True

    # ── Export ────────────────────────────────────────────────────────────────

    async def export_battle_json(self, battle_id: str) -> Optional[dict]:
        """Return the full battle JSON (suitable for writing to a file)."""
        result = await self.db.execute(
            select(Battle).where(Battle.id == battle_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return None

        phases_result = await self.db.execute(
            select(BattlePhase)
            .where(BattlePhase.battle_id == battle_id)
            .order_by(BattlePhase.phase_index)
        )
        phase_rows = phases_result.scalars().all()

        battle_data = dict(row.data)
        battle_data["phases"] = [dict(p.data) for p in phase_rows]
        return battle_data


def get_battle_service(db: AsyncSession) -> BattleService:
    return BattleService(db)
