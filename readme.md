# ⚔️ Visual Battle — Interactive Historical Battle Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/CONTRIBUTING.md)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Map Engine](https://img.shields.io/badge/Map-MapLibre%20GL%20JS-396CB2?logo=maplibre)](https://maplibre.org/)

> Bring history's greatest battles to life. Explore terrain, armies, weapons, strategies, and dynamic timelines through an immersive, map-driven experience.

---

## 🗺️ Overview

**Visual Battle** is an open-source interactive application that reconstructs historical battles with rich, data-driven visualizations. Powered by a war-game-style map engine, it lets users explore every dimension of a battle — from the lay of the land to the clash of armies — and draw tactical wisdom and historical insight from the past.

Whether you're a history enthusiast, student, educator, or strategy game fan, **Visual Battle** transforms dry historical records into living, breathing battlefields.

---

## ✨ Key Features

### 🌄 Terrain Rendering
- Topographic map engine with elevation, rivers, forests, marshes, roads, and settlements
- Historically accurate terrain reconstructed from period maps, satellite data, and archaeological records
- Day/night and seasonal rendering modes
- Zoom from theatre-level overview to unit-level detail

### ⚔️ Army Strength & Order of Battle
- Side-by-side comparison of both (or all) opposing forces
- Troop counts, unit types (infantry, cavalry, artillery, naval, etc.)
- Commander hierarchy and chain of command visualization
- Morale, supply lines, and logistics indicators

### 🏹 Weapon & Equipment Comparison
- Detailed weapon cards: range, firepower, reload time, effectiveness vs. unit type
- Era-appropriate equipment (swords, longbows, cannons, rifles, tanks, aircraft, etc.)
- Side-by-side stat comparison panels
- Technology advantage analysis

### 🎯 Forces & Strategies
- Annotated strategic maps showing flanking maneuvers, feints, and lines of advance
- Color-coded faction overlays for easy distinction
- Named formations and tactical doctrines (e.g., Cannae double envelopment, Blitzkrieg, etc.)
- Commander decision trees and key turning points

### ⏱️ Dynamic Battle Timeline
- Scrubable timeline to step through the battle phase by phase
- Animated unit movements, advances, retreats, and encirclements
- Event markers: decisive charges, artillery barrages, supply cuts, surrenders
- Speed control (pause, slow, normal, fast-forward)

### 📚 Knowledge & Insight Panel
- Contextual historical notes at every timeline step
- Lessons learned and tactical wisdom highlighted
- Links to primary sources, references, and further reading
- Quote overlays from commanders and eyewitnesses

---

## 🛠️ Tech Stack (Planned)

| Layer | Technology |
|---|---|
| **Map Engine** | [Leaflet.js](https://leafletjs.com/) / [MapLibre GL JS](https://maplibre.org/) |
| **Tile Source** | Custom historical tiles + [OpenHistoricalMap](https://www.openhistoricalmap.org/) |
| **Wargame Rendering** | Canvas/WebGL overlays (inspired by [MapChart Wargames](https://www.mapchart.net/wargames.html)) |
| **Frontend** | React + TypeScript |
| **State / Timeline** | Zustand + custom timeline engine |
| **Data Format** | GeoJSON + custom Battle JSON schema |
| **Backend / API** | Node.js / FastAPI (battle data serving) |
| **Database** | PostgreSQL + PostGIS (geospatial queries) |
| **Visualization** | D3.js (charts, graphs, stat comparisons) |
| **Animations** | Framer Motion / GSAP |

---

## 🗂️ Data Schema (Battle JSON)

Each battle is described by a structured JSON file:

```json
{
  "id": "battle-of-cannae-216bc",
  "name": "Battle of Cannae",
  "date": "-0216-08-02",
  "location": { "lat": 41.3066, "lng": 16.1329 },
  "terrain": "flat_plain",
  "factions": [
    {
      "id": "carthage",
      "name": "Carthaginian Republic",
      "commander": "Hannibal Barca",
      "strength": 50000,
      "units": [ ... ],
      "color": "#B5451B"
    },
    {
      "id": "rome",
      "name": "Roman Republic",
      "commander": "Lucius Aemilius Paullus",
      "strength": 86000,
      "units": [ ... ],
      "color": "#8B0000"
    }
  ],
  "phases": [
    {
      "id": "phase-1-initial-deployment",
      "timestamp_offset_minutes": 0,
      "label": "Initial Deployment",
      "unit_positions": [ ... ],
      "annotation": "Hannibal deliberately weakens his center...",
      "events": []
    }
  ],
  "outcome": "Carthaginian victory — Roman army encircled and destroyed",
  "casualties": { "carthage": 6000, "rome": 70000 },
  "wisdom": [
    "The double envelopment at Cannae became the model for encirclement doctrine studied by generals for 2,000 years."
  ]
}
```

---

## 🗺️ Planned Battle Library

| Battle | Year | Era | Region |
|---|---|---|---|
| Battle of Cannae | 216 BC | Ancient | Italy |
| Battle of Gaugamela | 331 BC | Ancient | Persia |
| Battle of Hastings | 1066 AD | Medieval | England |
| Battle of Agincourt | 1415 AD | Medieval | France |
| Battle of Waterloo | 1815 AD | Napoleonic | Belgium |
| Battle of Gettysburg | 1863 AD | Civil War | USA |
| Battle of the Somme | 1916 AD | WWI | France |
| Battle of Stalingrad | 1942–43 AD | WWII | Russia |
| Battle of Inchon | 1950 AD | Cold War | Korea |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- PostgreSQL with PostGIS extension (optional, for full backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/visual_battle.git
cd visual_battle

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Load a Battle

```bash
# Import a battle dataset
npm run import-battle -- --file data/battles/cannae.json
```

---

## 📁 Project Structure

```
visual_battle/
├── public/
│   └── tiles/                  # Custom historical map tiles
├── src/
│   ├── components/
│   │   ├── MapEngine/          # Core map + wargame rendering
│   │   ├── Timeline/           # Scrubable battle timeline
│   │   ├── ArmyPanel/          # Strength & order of battle
│   │   ├── WeaponComparison/   # Weapon stat cards & charts
│   │   ├── StrategyOverlay/    # Arrows, annotations, zones
│   │   └── InsightPanel/       # Historical notes & wisdom
│   ├── data/
│   │   └── battles/            # Battle JSON files
│   ├── store/                  # Zustand global state
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # GeoJSON helpers, math utils
│   └── types/                  # TypeScript schemas
├── server/                     # Optional backend API
├── scripts/                    # Data import & processing tools
└── docs/                       # Architecture & contribution docs
```

---

## 🤝 Contributing

Contributions are very welcome! You can help by:

- **Adding battles** — write or improve a battle JSON dataset
- **Improving the map engine** — terrain rendering, animation quality
- **Historical research** — verify facts, add sources, add wisdom notes
- **UI/UX** — design improvements, accessibility, mobile support
- **Translations** — make battles accessible in multiple languages

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) before submitting a PR.

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgements

- [MapChart Wargames](https://www.mapchart.net/wargames.html) — inspiration for the wargame map aesthetic
- [OpenHistoricalMap](https://www.openhistoricalmap.org/) — historical geographic data
- [Leaflet.js](https://leafletjs.com/) & [MapLibre GL JS](https://maplibre.org/) — open-source map engines
- Every historian, archaeologist, and writer who preserved these stories for us to learn from

---

> *"Those who cannot remember the past are condemned to repeat it."*
> — George Santayana
