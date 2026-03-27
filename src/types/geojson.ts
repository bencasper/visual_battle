// GeoJSON types extended with terrain-specific properties

import type { Feature, FeatureCollection, Geometry, Point, Polygon, LineString, MultiPolygon } from 'geojson'

export type TerrainType =
  | 'elevation'
  | 'river'
  | 'lake'
  | 'reservoir'
  | 'forest'
  | 'road'
  | 'settlement'
  | 'ridge'
  | 'pass'
  | 'marsh'

export interface TerrainProperties {
  type: TerrainType
  name?: string
  elevation_m?: number
  width_m?: number
  passable: boolean
  strategic_value?: 'critical' | 'high' | 'medium' | 'low'
  description?: string
}

export type TerrainFeature<G extends Geometry = Geometry> = Feature<G, TerrainProperties>
export type TerrainPoint = TerrainFeature<Point>
export type TerrainPolygon = TerrainFeature<Polygon | MultiPolygon>
export type TerrainLine = TerrainFeature<LineString>
export type TerrainCollection = FeatureCollection<Geometry, TerrainProperties>

// Unit position overlay on map
export interface UnitOverlayProperties {
  unit_id: string
  faction_id: string
  faction_color: string
  label: string
  posture: string
  strength_pct: number
}

export type UnitOverlayFeature = Feature<Point, UnitOverlayProperties>
