/**
 * Battle editor form — create or edit a battle's metadata.
 * Phases are edited separately via the phase list below.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { JsonField } from './JsonField'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'json'
  helpText?: string
  required?: boolean
  rows?: number
}

const BATTLE_FIELDS: FieldDef[] = [
  { key: 'id', label: 'Battle ID', type: 'text', required: true, helpText: 'e.g. "gettysburg-1863"' },
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true, helpText: 'URL-friendly, e.g. "gettysburg"' },
  { key: 'theater', label: 'Theater', type: 'text', required: true },
  { key: 'terrain_type', label: 'Terrain Type', type: 'text' },
  { key: 'outcome', label: 'Outcome', type: 'text' },
  { key: 'result_summary', label: 'Result Summary', type: 'textarea', rows: 3 },
  { key: 'date_range', label: 'Date Range', type: 'json', helpText: '{"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}' },
  { key: 'location', label: 'Location', type: 'json', helpText: '{"lat": number, "lng": number, "region": string}' },
  { key: 'map_bounds', label: 'Map Bounds', type: 'json', helpText: '{"north": N, "south": S, "east": E, "west": W}' },
  { key: 'factions', label: 'Factions', type: 'json', rows: 12 },
  { key: 'casualties', label: 'Casualties', type: 'json', rows: 8 },
  { key: 'key_figures', label: 'Key Figures', type: 'json', rows: 8 },
  { key: 'sources', label: 'Sources', type: 'json', rows: 6 },
  { key: 'wisdom', label: 'Wisdom Entries', type: 'json', rows: 8 },
]

const ARRAY_JSON_FIELDS = new Set(['factions', 'key_figures', 'sources', 'wisdom'])

function emptyBattle(): Record<string, unknown> {
  return {
    id: '',
    name: '',
    slug: '',
    theater: '',
    terrain_type: '',
    outcome: '',
    result_summary: '',
    date_range: { start: '', end: '' },
    location: { lat: 0, lng: 0, region: '' },
    map_bounds: { north: 0, south: 0, east: 0, west: 0 },
    factions: [],
    casualties: {},
    key_figures: [],
    sources: [],
    wisdom: [],
  }
}

export function BattleEditor() {
  const {
    activeBattle, editingBattleId, loading, saving, error,
    saveBattle, createBattle, goToList, goToEditPhase,
    createPhase, removePhase, exportBattle, removeBattle,
    setDirty, dirty,
  } = useAdminStore()

  const isNew = editingBattleId === null
  const [form, setForm] = useState<Record<string, unknown>>(emptyBattle)

  // Populate form when battle loads
  useEffect(() => {
    if (activeBattle && !isNew) {
      const data: Record<string, unknown> = {}
      for (const field of BATTLE_FIELDS) {
        data[field.key] = (activeBattle as Record<string, unknown>)[field.key]
      }
      setForm(data)
    } else if (isNew) {
      setForm(emptyBattle())
    }
  }, [activeBattle, isNew])

  const updateField = useCallback(
    (key: string, value: unknown) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setDirty(true)
    },
    [setDirty],
  )

  const handleSave = async () => {
    if (isNew) {
      await createBattle(form)
    } else {
      // Only send changed fields for update
      const updates: Record<string, unknown> = {}
      for (const field of BATTLE_FIELDS) {
        if (field.key === 'id') continue // can't change ID
        updates[field.key] = form[field.key]
      }
      await saveBattle(updates)
    }
  }

  const handleAddPhase = async () => {
    const phaseCount = activeBattle?.phases.length ?? 0
    const phaseId = `phase-${phaseCount + 1}`
    await createPhase({
      id: phaseId,
      label: `Phase ${phaseCount + 1}`,
      date_range: { start: '', end: '' },
      summary: '',
      tactical_situation: '',
      unit_positions: [],
      events: [],
      annotation: '',
      weather: { temp_celsius: 20, conditions: 'clear', wind_kph: 10 },
    })
  }

  if (loading && !activeBattle && !isNew) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading battle..." />
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goToList}
            className="text-xs text-un hover:underline"
          >
            &larr; Back to list
          </button>
          <h2
            className="text-lg font-bold text-wiki-text"
            style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
          >
            {isNew ? 'New Battle' : `Edit: ${activeBattle?.name ?? '...'}`}
          </h2>
          {dirty && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-1.5 py-0.5">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!isNew && editingBattleId && (
            <>
              <button
                onClick={() => exportBattle(editingBattleId)}
                disabled={saving}
                className="px-3 py-1.5 text-xs bg-wiki-parchmentDk border border-wiki-border rounded hover:bg-wiki-hillShade transition-colors disabled:opacity-50"
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${activeBattle?.name}"? This cannot be undone.`)) {
                    removeBattle(editingBattleId)
                  }
                }}
                disabled={saving}
                className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Delete Battle
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs bg-un text-white rounded hover:bg-un-muted transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Battle' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Form fields */}
      <div className="glass-panel p-4 space-y-4 mb-6">
        <h3 className="text-xs font-bold text-wiki-text uppercase tracking-wider border-b border-wiki-border pb-1">
          Battle Metadata
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BATTLE_FIELDS.map((field) => {
            if (field.type === 'json') return null // render below
            const disabled = !isNew && field.key === 'id'
            return (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-wiki-text mb-1">
                  {field.label}
                  {field.required && <span className="text-pva ml-0.5">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-[10px] text-wiki-textMuted mb-1">{field.helpText}</p>
                )}
                {field.type === 'textarea' ? (
                  <textarea
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={field.rows ?? 3}
                    disabled={disabled}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-wiki-border rounded resize-y focus:outline-none focus:ring-1 focus:ring-un/40 disabled:bg-wiki-parchmentDk disabled:text-wiki-textMuted"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    disabled={disabled}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-wiki-border rounded focus:outline-none focus:ring-1 focus:ring-un/40 disabled:bg-wiki-parchmentDk disabled:text-wiki-textMuted"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* JSON fields */}
        <div className="space-y-4 pt-2">
          {BATTLE_FIELDS.filter((f) => f.type === 'json').map((field) => (
            <JsonField
              key={field.key}
              label={field.label}
              value={form[field.key] ?? (ARRAY_JSON_FIELDS.has(field.key) ? [] : {})}
              onChange={(val) => updateField(field.key, val)}
              rows={field.rows}
              helpText={field.helpText}
            />
          ))}
        </div>
      </div>

      {/* Phases section (only for existing battles) */}
      {!isNew && activeBattle && (
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-wiki-text uppercase tracking-wider">
              Phases ({activeBattle.phases.length})
            </h3>
            <button
              onClick={handleAddPhase}
              disabled={saving}
              className="px-3 py-1 text-xs bg-un text-white rounded hover:bg-un-muted transition-colors disabled:opacity-50"
            >
              + Add Phase
            </button>
          </div>

          {activeBattle.phases.length === 0 ? (
            <p className="text-xs text-wiki-textMuted py-4 text-center">
              No phases yet. Add a phase to define the battle timeline.
            </p>
          ) : (
            <div className="space-y-1">
              {activeBattle.phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className="flex items-center justify-between px-3 py-2 bg-wiki-parchmentDk/40 border border-wiki-border/50 rounded hover:bg-wiki-parchmentDk/70 transition-colors"
                >
                  <div>
                    <span className="text-[10px] text-wiki-textMuted mr-2">#{idx + 1}</span>
                    <button
                      onClick={() => goToEditPhase(activeBattle.id, phase.id)}
                      className="text-xs font-semibold text-un hover:underline"
                    >
                      {phase.label}
                    </button>
                    <span className="text-[10px] text-wiki-textMuted ml-2">{phase.id}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => goToEditPhase(activeBattle.id, phase.id)}
                      className="px-2 py-0.5 text-[10px] bg-wiki-parchmentDk border border-wiki-border rounded hover:bg-wiki-hillShade transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete phase "${phase.label}"?`)) {
                          removePhase(phase.id)
                        }
                      }}
                      disabled={saving}
                      className="px-2 py-0.5 text-[10px] bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
