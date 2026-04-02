# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Battle is an interactive historical battle visualizer. Users explore battles through map-driven UI with animated timelines, troop movement overlays, army comparisons, and contextual knowledge panels. Currently includes two battles: Chosin Reservoir (1950) and Stalingrad.

## Development Commands

### Prerequisites
- Docker running (for PostGIS database)
- pyenv with `visual_battle-env` virtualenv (Python 3.13)
- Node.js >= 18

### Database
```sh
docker compose up -d db          # Start PostGIS (port 5432)
```

### Backend (run from `backend/server/`)
```sh
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000   # Start API server
python -m scripts.seed_db                       # Seed DB (run from backend/)
```

### Frontend (run from `frontend/`)
```sh
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # TypeScript check + Vite production build
npm run typecheck    # TypeScript only (tsc --noEmit)
npm run lint         # ESLint
```

### Alembic Migrations (run from `backend/`)
```sh
alembic upgrade head
alembic revision -m "description"   # New migration
```

## Architecture

### Monorepo with Two Independent Apps

**`frontend/`** — React 18 SPA (Vite + TypeScript + Tailwind CSS)
- **Routing**: React Router v6 — `/battles` (list) and `/battle/:battleId` (viewer)
- **State**: Three Zustand stores, no Redux:
  - `useBattleStore` — fetches battle data from API (falls back to local JSON in `public/data/`)
  - `useTimelineStore` — playback state (phase index, play/pause, speed, loop)
  - `useUIStore` — panel toggles, selected faction/unit, map view state, language (en/zh)
- **Map**: MapLibre GL JS with custom Wikipedia-style base map (Carto Voyager tiles, parchment palette). 2D/3D toggle adds terrain exaggeration via DEM tiles + ESRI satellite.
- **Path alias**: `@/` maps to `frontend/src/` (configured in vite.config.ts)
- **i18n**: i18next with English and Chinese (`src/i18n/locales/{en,zh}/ui.json`)
- **GeoJSON**: Custom Vite plugin transforms `.geojson` files into JS modules

**`backend/`** — Python FastAPI with async SQLAlchemy
- **Entry point**: `backend/server/main.py` — the FastAPI app
- **Database**: PostgreSQL + PostGIS, async via asyncpg. Connection config in `server/db/database.py` using pydantic-settings (reads from `server/.env`)
- **ORM models**: `server/db/models.py` — `Battle` and `BattlePhase` tables. Battle metadata in columns; full JSON stored in a JSONB `data` column
- **Pydantic schemas**: `server/models/battle.py` — response models mirrored by `frontend/src/types/battle.ts`
- **Service layer**: `server/services/battle_service.py` — all DB queries go through `BattleService`
- **Router**: `server/routers/battles.py` — mounted at `/api/v1/battles`
- **Alembic**: Migrations in `server/alembic/versions/`, config in `backend/alembic.ini` (uses sync psycopg2 URL)

### API Endpoints
- `GET /health` — health check
- `GET /api/v1/battles` — list all battles (summary)
- `GET /api/v1/battles/{id}` — full battle with phases
- `GET /api/v1/battles/{id}/phases` — phases only (lightweight)

### Data Flow
Battle data lives as JSON files in `backend/server/data/battles/`. The seed script (`backend/scripts/seed_db.py`) upserts these into Postgres, splitting phases into `battle_phases` rows. The frontend fetches from the API; if the backend is unavailable, it falls back to static JSON files served from `frontend/public/data/`.

### Key Patterns
- **Frontend can run without backend**: `useBattleStore` catches API failures and loads from `/public/data/` JSON files instead
- **Type parity**: `frontend/src/types/battle.ts` mirrors `backend/server/models/battle.py` — keep them in sync when changing the data model
- **Vite proxy**: `/api` requests proxy to `http://localhost:8000` in dev (configured in `vite.config.ts`)
- **Visual theme**: Wikipedia military map aesthetic — parchment backgrounds, serif headings (Linux Libertine), faction colors (UN blue `#003f87`, PVA red `#aa0000`). Color tokens are in both `tailwind.config.ts` and `src/utils/wikiMapStyle.ts`
- **Component structure**: Each major feature (`MapEngine`, `ArmyPanel`, `Timeline`, `InsightPanel`, `WeaponComparison`, `StrategyOverlay`) has its own directory with a `.types.ts` file for props
