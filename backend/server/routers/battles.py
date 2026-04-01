from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.battle_service import BattleService, get_battle_service
from models.battle import BattleModel, BattleListItem, BattlePhasesResponse
from models.battle_requests import (
    BattleCreateRequest, BattleUpdateRequest,
    PhaseCreateRequest, PhaseUpdateRequest,
)

router = APIRouter(prefix="/battles", tags=["battles"])


def get_service(db: AsyncSession = Depends(get_db)) -> BattleService:
    return get_battle_service(db)


# ── Battle Read ───────────────────────────────────────────────────────────────

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


# ── Battle Create / Update / Delete ──────────────────────────────────────────

@router.post("", response_model=BattleModel, status_code=201)
async def create_battle(req: BattleCreateRequest, service: BattleService = Depends(get_service)):
    """Create a new battle (phases are added separately)."""
    try:
        return await service.create_battle(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{battle_id}", response_model=BattleModel)
async def update_battle(battle_id: str, req: BattleUpdateRequest, service: BattleService = Depends(get_service)):
    """Partial update of a battle. Only provided fields are changed."""
    battle = await service.update_battle(battle_id, req)
    if not battle:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")
    return battle


@router.delete("/{battle_id}", status_code=204)
async def delete_battle(battle_id: str, service: BattleService = Depends(get_service)):
    """Delete a battle and all its phases."""
    deleted = await service.delete_battle(battle_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")


# ── Phase Read ────────────────────────────────────────────────────────────────

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


# ── Phase Create / Update / Delete ───────────────────────────────────────────

@router.post("/{battle_id}/phases", status_code=201)
async def create_phase(battle_id: str, req: PhaseCreateRequest, service: BattleService = Depends(get_service)):
    """Add a new phase to a battle (appended at the end)."""
    phase = await service.create_phase(battle_id, req)
    if phase is None:
        raise HTTPException(status_code=404, detail=f"Battle '{battle_id}' not found")
    return phase


@router.put("/{battle_id}/phases/{phase_id}")
async def update_phase(
    battle_id: str, phase_id: str, req: PhaseUpdateRequest,
    service: BattleService = Depends(get_service),
):
    """Partial update of a single phase."""
    phase = await service.update_phase(battle_id, phase_id, req)
    if phase is None:
        raise HTTPException(status_code=404, detail=f"Phase '{phase_id}' not found in battle '{battle_id}'")
    return phase


@router.delete("/{battle_id}/phases/{phase_id}", status_code=204)
async def delete_phase(
    battle_id: str, phase_id: str,
    service: BattleService = Depends(get_service),
):
    """Delete a phase and re-index remaining phases."""
    deleted = await service.delete_phase(battle_id, phase_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Phase '{phase_id}' not found in battle '{battle_id}'")
