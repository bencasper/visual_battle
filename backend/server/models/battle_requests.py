"""Request schemas for battle CRUD operations."""

from pydantic import BaseModel, Field
from typing import Any, Optional


# ── Battle requests ───────────────────────────────────────────────────────────

class BattleCreateRequest(BaseModel):
    """Create a new battle. Phases are created separately via the phases endpoint."""

    id: str = Field(..., description="Unique battle ID, e.g. 'gettysburg-1863'")
    name: str
    slug: str = Field(..., description="URL-friendly slug, e.g. 'gettysburg'")
    theater: str
    date_range: dict = Field(..., description='{"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}')
    location: dict = Field(..., description='{"lat": float, "lng": float, "region": str, "terrain_description": str}')
    terrain_type: str
    map_bounds: dict = Field(..., description='{"north": float, "south": float, "east": float, "west": float}')
    outcome: str
    result_summary: str
    factions: list[dict] = Field(default_factory=list, description="Array of faction objects with units and weapons")
    casualties: dict = Field(default_factory=dict, description="Keyed by faction ID")
    key_figures: list[dict] = Field(default_factory=list)
    sources: list[dict] = Field(default_factory=list)
    wisdom: list[dict] = Field(default_factory=list)


class BattleUpdateRequest(BaseModel):
    """Partial update for a battle. Only provided fields are updated."""

    name: Optional[str] = None
    slug: Optional[str] = None
    theater: Optional[str] = None
    date_range: Optional[dict] = None
    location: Optional[dict] = None
    terrain_type: Optional[str] = None
    map_bounds: Optional[dict] = None
    outcome: Optional[str] = None
    result_summary: Optional[str] = None
    factions: Optional[list[dict]] = None
    casualties: Optional[dict] = None
    key_figures: Optional[list[dict]] = None
    sources: Optional[list[dict]] = None
    wisdom: Optional[list[dict]] = None


# ── Phase requests ────────────────────────────────────────────────────────────

class PhaseCreateRequest(BaseModel):
    """Create a new phase for a battle."""

    id: str = Field(..., description="Unique phase ID, e.g. 'phase-1-opening-barrage'")
    label: str
    date_range: dict = Field(..., description='{"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}')
    timestamp_offset_hours: int = 0
    summary: str = ""
    tactical_situation: str = ""
    unit_positions: list[dict] = Field(default_factory=list)
    events: list[dict] = Field(default_factory=list)
    annotation: str = ""
    weather: dict = Field(default_factory=lambda: {"temp_celsius": 20, "conditions": "clear", "wind_kph": 10})


class PhaseUpdateRequest(BaseModel):
    """Partial update for a phase. Only provided fields are updated."""

    label: Optional[str] = None
    date_range: Optional[dict] = None
    timestamp_offset_hours: Optional[int] = None
    summary: Optional[str] = None
    tactical_situation: Optional[str] = None
    unit_positions: Optional[list[dict]] = None
    events: Optional[list[dict]] = None
    annotation: Optional[str] = None
    weather: Optional[dict] = None
