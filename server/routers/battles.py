from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.battle_service import BattleService, get_battle_service
from models.battle import BattleModel, BattleListItem, BattlePhasesResponse

router = APIRouter(prefix="/battles", tags=["battles"])


def get_service(db: AsyncSession = Depends(get_db)) -> BattleService:
    return get_battle_service(db)


@router.get("", response_model=list[BattleListItem])
async def list_battles(service: BattleService = Depends(get_service)):
    """Return a summary list of all available battles."""
    return await service.list_battles()


@router.get("/{battle_id}", response_model=BattleModel)
async def get_battle(battle_id: str, service: BattleService = Depends(get_service)):
    """Return the full battle data including all phases."""
    battle = await service.get_battle(battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")
    return battle


@router.get("/{battle_id}/phases", response_model=BattlePhasesResponse)
async def get_phases(battle_id: str, service: BattleService = Depends(get_service)):
    """Return only the phases for a battle (lightweight for timeline prefetch)."""
    phases = await service.get_phases(battle_id)
    if phases is None:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")
    return BattlePhasesResponse(
        battle_id=battle_id,
        phase_count=len(phases),
        phases=phases,
    )
