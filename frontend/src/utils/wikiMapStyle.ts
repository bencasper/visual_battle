import type { StyleSpecification } from 'maplibre-gl'

export const WIKI_COLOURS = {
  parchment:   '#f0e6cc',
  parchmentDk: '#e2d4b0',
  hillShade:   '#c8b49a',
  mountain:    '#a89070',
  mountainDk:  '#8a7258',
  water:       '#aad3df',
  waterDk:     '#7ab8cf',
  forest:      '#add19e',
  road:        '#c88a00',
  pass:        '#c88a00',
  ridge:       '#a89070',
  settlement:  '#000000',
  unBlue:      '#003f87',
  unBlueLight: '#4a7fc1',
  pvaRed:      '#aa0000',
  pvaRedLight: '#dd3333',
  frontline:   '#333333',
  panelBg:     'rgba(240,230,204,0.93)',
  panelBorder: '#c8b49a',
  panelText:   '#1a1008',
} as const

export const wikiMapStyle: StyleSpecification = {
  version: 8,
  name: 'Wikipedia Battle Map',
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    // Carto Voyager — English labels, clean cartographic style, no API key needed
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': WIKI_COLOURS.parchment },
    },
    {
      id: 'carto-tiles',
      type: 'raster',
      source: 'carto',
      paint: { 'raster-opacity': 1 },
    },
  ],
}
