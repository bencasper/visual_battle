"""Initial schema: battles + battle_phases tables with PostGIS

Revision ID: 001
Revises:
Create Date: 2026-03-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        'battles',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('slug', sa.String(), unique=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('theater', sa.String(), nullable=False),
        sa.Column('date_start', sa.Date(), nullable=True),
        sa.Column('date_end', sa.Date(), nullable=True),
        sa.Column('location', Geometry('POINT', srid=4326), nullable=True),
        sa.Column('map_bounds', JSONB(), nullable=True),
        sa.Column('data', JSONB(), nullable=False),
    )

    op.create_table(
        'battle_phases',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('battle_id', sa.String(), nullable=False, index=True),
        sa.Column('phase_index', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(), nullable=False),
        sa.Column('date_start', sa.Date(), nullable=True),
        sa.Column('date_end', sa.Date(), nullable=True),
        sa.Column('data', JSONB(), nullable=False),
        sa.ForeignKeyConstraint(['battle_id'], ['battles.id'], ondelete='CASCADE'),
    )


def downgrade() -> None:
    op.drop_table('battle_phases')
    op.drop_table('battles')
