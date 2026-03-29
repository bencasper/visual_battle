# ⚔️ Visual Battle — Interactive Historical Battle Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/CONTRIBUTING.md)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Map Engine](https://img.shields.io/badge/Map-MapLibre%20GL%20JS-396CB2?logo=maplibre)](https://maplibre.org/)

> Bring history’s greatest battles to life. Explore terrain, armies, weapons, strategies, and dynamic timelines through an immersive, map-driven experience.

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

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18 (for frontend)
- Python >= 3.10 (managed via pyenv — recommended)
- Docker & Docker Compose (for the database)

---

### Python Environment: pyenv + pyenv-virtualenv

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
pip install -r server/requirements.txt
echo "visual_battle-env" > .python-version
```

---

### Database Setup (Docker Compose)

Run this to start the PostGIS-enabled PostgreSQL DB:

```sh
docker compose up -d db
```

---

### Frontend & Backend

**Frontend:**
```sh
npm install
npm run dev
# Visit http://localhost:5173/
```

**Backend (after pyenv setup and DB running):**
```sh
cp server/.env.example server/.env  # Set DB connection string as needed
cd server
uvicorn main:app --host 0.0.0.0 --port 8000
```
Health check: http://localhost:8000/health
Battles API: http://localhost:8000/api/v1/battles

---

### Initial Data Load

Seed the database (after the DB is up!):

```sh
python scripts/seed_db.py
```

---

## 🏗️ How it works

- **Frontend**: React SPA that visualizes battle data. Communicates with backend via REST API for battles, timelines, etc.
- **Backend**: FastAPI serves structured battle data from Postgres/PostGIS, handles data modeling and migrations (with Alembic).
- **Battle Data**: JSON files define battles, units, phases, terrain, etc. Saved to DB via scripts, used by backend and visualized by frontend.
- **Timeline/Phases**: Each battle is broken into phases; users can scrub through the battle's evolution step by step.

---

## Maintenance & Troubleshooting

- Update dependencies: `pip install -r server/requirements.txt --upgrade`, `npm install`
- Re-seed database: `python scripts/seed_db.py` (after migrations/data changes)
- Logs:
  - Backend logs are in `server/backend_app.log`
  - Frontend logs: See terminal output or browser console

---

## 📁 Project Structure

(Your existing listing...)

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
