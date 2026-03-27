from sqlalchemy import Column, String, Date, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from server.db.database import Base


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
    data = Column(JSONB, nullable=False)           # full battle JSON minus phases


class BattlePhase(Base):
    __tablename__ = "battle_phases"

    id = Column(String, primary_key=True)          # "phase-1-initial-contact"
    battle_id = Column(String, nullable=False, index=True)
    phase_index = Column(Integer, nullable=False)
    label = Column(String, nullable=False)
    date_start = Column(Date, nullable=True)
    date_end = Column(Date, nullable=True)
    data = Column(JSONB, nullable=False)           # full phase JSON
