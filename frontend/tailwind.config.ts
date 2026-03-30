import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Wikipedia Military Map palette ──────────────────────────
        wiki: {
          parchment:   '#f0e6cc',
          parchmentDk: '#e2d4b0',
          hillShade:   '#c8b49a',
          mountain:    '#a89070',
          water:       '#aad3df',
          waterDk:     '#7ab8cf',
          forest:      '#add19e',
          road:        '#c88a00',
          panel:       'rgba(240,230,204,0.93)',
          border:      '#c8b49a',
          text:        '#1a1008',
          textMuted:   '#5c4a2a',
        },
        // ── Faction colours (Wikipedia-accurate) ────────────────────
        un: {
          DEFAULT: '#003f87',
          light:   '#4a7fc1',
          muted:   '#1a5298',
        },
        pva: {
          DEFAULT: '#aa0000',
          light:   '#dd3333',
          muted:   '#880000',
        },
        // ── Terrain tokens (used by TerrainLayer) ───────────────────
        terrain: {
          water:      '#aad3df',
          forest:     '#add19e',
          mountain:   '#a89070',
          plain:      '#e8d9b5',
          road:       '#c88a00',
          settlement: '#000000',
          ridge:      '#a89070',
        },
        // ── UI surface colours ───────────────────────────────────────
        map: {
          bg:          '#f0e6cc',
          panel:       '#f5ead5',
          panelBorder: '#c8b49a',
          overlay:     'rgba(240,230,204,0.92)',
        },
      },
      fontFamily: {
        map:  ['"Linux Libertine"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow':  'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
