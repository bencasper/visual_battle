from pydantic import BaseModel, Field
from typing import Any, Optional


class LocationModel(BaseModel):
    lat: float
    lng: float
    region: Optional[str] = None
    terrain_description: Optional[str] = None


class MapBoundsModel(BaseModel):
    north: float
    south: float
    east: float
    west: float


class UnitStrengthModel(BaseModel):
    total_troops: int
    engaged_at_reservoir: Optional[int] = None
    infantry_battalions: Optional[int] = None
    infantry_divisions: Optional[int] = None
    artillery_battalions: Optional[int] = None
    tanks: Optional[int] = None
    aircraft_sorties_available: Optional[int] = None


class WeaponStatsModel(BaseModel):
    firepower: Optional[int] = None
    range: Optional[int] = None
    reliability_cold: Optional[int] = None
    weight: Optional[int] = None
    armor: Optional[int] = None
    cold_weather_ops: Optional[int] = None
    mobility: Optional[int] = None
    responsiveness: Optional[int] = None


class WeaponModel(BaseModel):
    id: str
    name: str
    type: str
    caliber: Optional[str] = None
    effective_range_m: Optional[int] = None
    rate_of_fire_rpm: Optional[int] = None
    main_gun: Optional[str] = None
    payload_kg: Optional[float] = None
    stats: WeaponStatsModel


class UnitModel(BaseModel):
    id: str
    name: str
    type: str
    strength: int
    commander: str
    equipment_era: str
    morale: float
    supply_status: str


class FactionModel(BaseModel):
    id: str
    name: str
    full_name: str
    side: str
    color: str
    color_light: str
    commander: str
    higher_command: str
    nation_flags: list[str]
    strength: UnitStrengthModel
    units: list[UnitModel]
    weapons: list[WeaponModel]


class UnitPositionItemModel(BaseModel):
    location: str
    lat: float
    lng: float
    strength_pct: float
    posture: str


class UnitPositionModel(BaseModel):
    unit_id: str
    faction_id: str
    positions: list[UnitPositionItemModel]


class PhaseEventModel(BaseModel):
    id: str
    type: str
    timestamp_offset_hours: int
    label: str
    description: str
    location: LocationModel
    significance: str


class WeatherModel(BaseModel):
    temp_celsius: int
    conditions: str
    wind_kph: int


class DateRangeModel(BaseModel):
    start: str
    end: str


class PhaseModel(BaseModel):
    id: str
    index: int
    label: str
    date_range: DateRangeModel
    timestamp_offset_hours: int
    summary: str
    tactical_situation: str
    unit_positions: list[UnitPositionModel]
    events: list[PhaseEventModel]
    annotation: str
    weather: WeatherModel


class CasualtyDetailModel(BaseModel):
    killed_in_action: int
    wounded_in_action: int
    missing_in_action: Optional[int] = None
    non_battle_frostbite: Optional[int] = None
    total_combat_ineffective: Optional[int] = None
    note: Optional[str] = None


class KeyFigureModel(BaseModel):
    name: str
    faction: str
    role: str
    significance: str


class SourceModel(BaseModel):
    title: str
    type: str
    url: Optional[str] = None


class WisdomModel(BaseModel):
    id: str
    category: str
    title: str
    body: str
    related_phase: str


class BattleModel(BaseModel):
    id: str
    name: str
    slug: str
    theater: str
    date_range: DateRangeModel
    location: LocationModel
    terrain_type: str
    map_bounds: MapBoundsModel
    outcome: str
    result_summary: str
    factions: list[FactionModel]
    phases: list[PhaseModel]
    casualties: dict[str, CasualtyDetailModel]
    key_figures: list[KeyFigureModel]
    sources: list[SourceModel]
    wisdom: list[WisdomModel]


class BattleListItem(BaseModel):
    id: str
    name: str
    slug: str
    theater: str
    date_range: DateRangeModel
    location: LocationModel
    faction_names: list[str]
    outcome: str


class BattlePhasesResponse(BaseModel):
    battle_id: str
    phase_count: int
    phases: list[PhaseModel]
