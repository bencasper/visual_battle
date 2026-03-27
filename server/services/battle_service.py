from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from server.db.models import Battle, BattlePhase
from server.models.battle import BattleModel, BattleListItem, BattlePhasesResponse
from datetime import date
from typing import Optional


class BattleService:
    def __init__(self, db: AsyncSession):
        self.db = db

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
        # Fetch battle row
        result = await self.db.execute(
            select(Battle).where(Battle.id == battle_id)
        )
        row = result.scalar_one_or_none()
        if not row:
            return None

        # Fetch all phases for this battle ordered by index
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
        # Verify battle exists
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


def get_battle_service(db: AsyncSession) -> BattleService:
    return BattleService(db)
