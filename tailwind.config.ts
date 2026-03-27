import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        un: {
          DEFAULT: '#1a3a5c',
          light: '#3a6fa8',
          muted: '#2a4f78',
        },
        pva: {
          DEFAULT: '#8B1A1A',
          light: '#cc3333',
          muted: '#a82222',
        },
        terrain: {
          water: '#3b82f6',
          forest: '#166534',
          mountain: '#78716c',
          plain: '#d4c5a9',
          road: '#a8a29e',
          settlement: '#fbbf24',
        },
        map: {
          bg: '#1c1917',
          panel: '#0f172a',
          panelBorder: '#1e293b',
          overlay: 'rgba(15,23,42,0.85)',
        },
      },
      fontFamily: {
        map: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
