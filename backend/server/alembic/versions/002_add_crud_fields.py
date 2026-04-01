"""Add CRUD support columns to battles and battle_phases

Revision ID: 002
Revises: 001
Create Date: 2026-04-01
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Promote searchable fields from JSONB to columns
    op.add_column('battles', sa.Column('outcome', sa.Text(), nullable=True))
    op.add_column('battles', sa.Column('result_summary', sa.Text(), nullable=True))
    op.add_column('battles', sa.Column('terrain_type', sa.String(), nullable=True))
    op.add_column('battles', sa.Column('updated_at', sa.DateTime(timezone=True),
                                       server_default=sa.func.now(), nullable=False))

    op.add_column('battle_phases', sa.Column('updated_at', sa.DateTime(timezone=True),
                                             server_default=sa.func.now(), nullable=False))

    # Backfill from JSONB data for existing rows
    op.execute("""
        UPDATE battles SET
            outcome = data->>'outcome',
            result_summary = data->>'result_summary',
            terrain_type = data->>'terrain_type'
        WHERE data IS NOT NULL
    """)


def downgrade() -> None:
    op.drop_column('battle_phases', 'updated_at')
    op.drop_column('battles', 'updated_at')
    op.drop_column('battles', 'terrain_type')
    op.drop_column('battles', 'result_summary')
    op.drop_column('battles', 'outcome')
