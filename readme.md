# ⚔️ Visual Battle — Interactive Historical Battle Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/CONTRIBUTING.md)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Map Engine](https://img.shields.io/badge/Map-MapLibre%20GL%20JS-396CB2?logo=maplibre)](https://maplibre.org/)

> Bring history's greatest battles to life. Explore terrain, armies, weapons, strategies, and dynamic timelines through an immersive, map-driven experience.

---

## 🗺️ What is Visual Battle?

**Visual Battle** is an open-source web application for dynamically exploring historical battles through interactive maps, rich data visualizations, and animated timelines.

**Key capabilities:**
- Reconstruct and visualize iconic battles (from ancient to modern eras).
- Explore accurate topography, terrain features, and battlefield environments.
- Compare armies, weapons, and strategies with side-by-side stats and tactical overlays.
- Step through an animated timeline: watch troop movements, attacks, or retreats, and see how the battle unfolds phase by phase.
- Contextual knowledge panel gives you insight into decisions, turning points, and historical wisdom—bringing dry records to life.
- Built for history buffs, educators, researchers, and wargaming/strategy fans.

---

## ✨ Features

- 🌄 Terrain Rendering: Topographic map engine, seasonal rendering, zoom levels, historical accuracy.
- ⚔️ Army Strength & Order of Battle: View opposing forces, unit types, command chains.
- 🏹 Weapon & Equipment Comparison: Stat cards, era-appropriate gear, tech advantage analysis.
- 🎯 Forces & Strategies: Annotate maneuvers, doctrines, overlays, and decision-trees.
- ⏱️ Dynamic Battle Timeline: Scrub through time, watch troop movements, view key events.
- 📚 Knowledge & Insight Panel: Rich notes, references, sources, quotes, lessons learned.

---

## 🛠️ Tech Stack

| Layer              | Technology            |
|--------------------|----------------------|
| Map Engine         | MapLibre GL JS, Leaflet.js, custom historical tiles |
| Frontend           | React + Vite + TypeScript + Zustand |
| Backend            | Python FastAPI + SQLAlchemy |
| Database           | PostgreSQL + PostGIS |
| Data/Visualization | D3.js, Framer Motion |
| Animations         | Framer Motion, GSAP  |
| Containerization   | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose

For local development without Docker you'll also need:

- Node.js >= 18
- Python >= 3.13 (managed via pyenv — recommended)

---

### Quick Start with Docker (Recommended)

The fastest way to run the full stack — no local Node.js or Python required:

```sh
docker compose up -d
```

This starts four services:

| Service    | URL                           | Description                                      |
|------------|-------------------------------|--------------------------------------------------|
| `frontend` | http://localhost:3000          | React SPA served by nginx, proxies `/api` to backend |
| `backend`  | http://localhost:8000          | FastAPI server                                   |
| `db`       | `localhost:5432`               | PostGIS-enabled PostgreSQL                       |
| `seed`     | —                             | Runs once to populate the database, then exits   |

Open **http://localhost:3000** in your browser and you're in.

#### Common Docker commands

```sh
# Start everything (builds images on first run)
docker compose up -d

# Rebuild after code changes
docker compose up -d --build

# Re-seed the database
docker compose up seed

# View logs
docker compose logs -f              # all services
docker compose logs -f backend      # backend only

# Stop everything
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```

---

### Local Development (without Docker for frontend/backend)

If you prefer running the frontend and backend directly on your machine for faster iteration, you still need Docker for the database.

#### 1. Database

```sh
docker compose up -d db
```

#### 2. Python Environment: pyenv + pyenv-virtualenv

**Why pyenv?**
- Allows multiple Python versions side by side.
- Manages project-specific virtualenvs.
- Avoids system Python/package conflicts.

**Install pyenv and pyenv-virtualenv:**

- macOS:
  ```sh
  brew install pyenv pyenv-virtualenv
  ```
- Linux:
  See https://github.com/pyenv/pyenv-virtualenv#installation

Add to your shell config (.zshrc/.bashrc):

```sh
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```
Restart your shell.

**Create and activate your project's virtualenv:**
```sh
pyenv install 3.13.12
pyenv virtualenv 3.13.12 visual_battle-env
pyenv activate visual_battle-env
pip install -r backend/server/requirements.txt
```

#### 3. Backend

```sh
cd backend/server
cp .env.example .env   # adjust DB credentials if needed
uvicorn main:app --host 0.0.0.0 --port 8000
```

- Health check: http://localhost:8000/health
- Battles API: http://localhost:8000/api/v1/battles

#### 4. Seed the Database

```sh
cd backend
python -m scripts.seed_db
```

#### 5. Frontend

```sh
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

---

## 📁 Project Structure

```
visual_battle/
├── docker-compose.yml          # Orchestrates all services (db, backend, frontend, seed)
├── backend/
│   ├── Dockerfile              # Python 3.13-slim + FastAPI
│   ├── .dockerignore
│   ├── alembic.ini             # Alembic migration config
│   ├── scripts/
│   │   └── seed_db.py          # Seeds battle data into Postgres
│   └── server/
│       ├── main.py             # FastAPI entry point
│       ├── .env                # Local env vars (DATABASE_URL, CORS_ORIGINS, etc.)
│       ├── requirements.txt
│       ├── db/
│       │   ├── database.py     # Async engine, session, settings
│       │   └── models.py       # Battle + BattlePhase ORM models
│       ├── models/
│       │   └── battle.py       # Pydantic response schemas
│       ├── routers/
│       │   └── battles.py      # /api/v1/battles endpoints
│       ├── services/
│       │   └── battle_service.py
│       ├── data/battles/       # Source JSON files (chosin-reservoir, stalingrad)
│       └── alembic/            # Migration versions
├── frontend/
│   ├── Dockerfile              # Node build → nginx:alpine
│   ├── .dockerignore
│   ├── nginx.conf              # SPA routing + /api proxy to backend
│   ├── package.json
│   ├── vite.config.ts          # Dev proxy, path aliases, geojson plugin
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── MapEngine/      # MapLibre GL map with terrain, markers, overlays
│       │   ├── ArmyPanel/      # Faction strength & order of battle
│       │   ├── Timeline/       # Animated phase-by-phase playback
│       │   ├── InsightPanel/   # Knowledge & context panel
│       │   ├── WeaponComparison/
│       │   └── StrategyOverlay/
│       ├── store/              # Zustand stores (battle, timeline, UI)
│       ├── types/              # TypeScript types (mirrors backend schemas)
│       ├── i18n/               # i18next (en, zh)
│       └── utils/              # Map style, colors, helpers
└── readme.md
```

---

## 🏗️ How It Works

- **Frontend**: React SPA that visualizes battle data. Communicates with backend via REST API for battles, timelines, etc. In Docker, nginx serves the built assets and proxies `/api` to the backend container.
- **Backend**: FastAPI serves structured battle data from Postgres/PostGIS, handles data modeling and migrations (with Alembic).
- **Battle Data**: JSON files define battles, units, phases, terrain, etc. The seed script upserts these into the database. The frontend falls back to static JSON if the backend is unavailable.
- **Timeline/Phases**: Each battle is broken into phases; users can scrub through the battle's evolution step by step.

### API Endpoints

| Method | Path                            | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/health`                       | Health check                   |
| GET    | `/api/v1/battles`               | List all battles (summary)     |
| GET    | `/api/v1/battles/{id}`          | Full battle with phases        |
| GET    | `/api/v1/battles/{id}/phases`   | Phases only (lightweight)      |

---

## Maintenance & Troubleshooting

- **Update dependencies**: `pip install -r backend/server/requirements.txt --upgrade`, `cd frontend && npm install`
- **Re-seed database**: `docker compose up seed` (Docker) or `cd backend && python -m scripts.seed_db` (local)
- **Run migrations**: `cd backend && alembic upgrade head`
- **Logs**:
  - Docker: `docker compose logs -f backend`
  - Backend (local): `backend/server/backend_app.log`
  - Frontend: terminal output or browser console

---

## 🤝 Contributing

(Your existing contributing note...)

---

## 📜 License
MIT License

---

## 🙏 Acknowledgements

(Your existing acknowledgements...)

---
