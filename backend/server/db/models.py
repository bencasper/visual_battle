from sqlalchemy import Column, String, Date, Integer, Text, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from db.database import Base


class Battle(Base):
    __tablename__ = "battles"

    id = Column(String, primary_key=True)          # "chosin-reservoir-1950"
    slug = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    theater = Column(String, nullable=False)
    date_start = Column(Date, nullable=True)
    date_end = Column(Date, nullable=True)
    location = Column(Geometry("POINT", srid=4326), nullable=True)
    map_bounds = Column(JSONB, nullable=True)
    outcome = Column(Text, nullable=True)
    result_summary = Column(Text, nullable=True)
    terrain_type = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    data = Column(JSONB, nullable=False)           # full battle JSON minus phases


class BattlePhase(Base):
    __tablename__ = "battle_phases"

    id = Column(String, primary_key=True)          # "phase-1-initial-contact"
    battle_id = Column(String, nullable=False, index=True)
    phase_index = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    date_start = Column(Date, nullable=True)
    date_end = Column(Date, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    data = Column(JSONB, nullable=False)           # full phase JSON
