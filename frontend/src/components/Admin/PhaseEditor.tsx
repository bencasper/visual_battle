/**
 * Phase editor — edit an individual battle phase's data.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { JsonField } from './JsonField'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'json'
  helpText?: string
  rows?: number
}

const PHASE_ARRAY_FIELDS = new Set(['unit_positions', 'events'])

const PHASE_FIELDS: FieldDef[] = [
  { key: 'id', label: 'Phase ID', type: 'text', helpText: 'Read-only identifier' },
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'timestamp_offset_hours', label: 'Timestamp Offset (hours)', type: 'number' },
  { key: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
  { key: 'tactical_situation', label: 'Tactical Situation', type: 'textarea', rows: 4 },
  { key: 'annotation', label: 'Annotation', type: 'textarea', rows: 2 },
  { key: 'date_range', label: 'Date Range', type: 'json', helpText: '{"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"}' },
  { key: 'weather', label: 'Weather', type: 'json', helpText: '{"temp_celsius": N, "conditions": string, "wind_kph": N}' },
  { key: 'unit_positions', label: 'Unit Positions', type: 'json', rows: 12 },
  { key: 'events', label: 'Events', type: 'json', rows: 12 },
]

export function PhaseEditor() {
  const {
    activePhase, activeBattle, editingBattleId, loading, saving, error,
    savePhase, goToEditBattle, removePhase,
    setDirty, dirty,
  } = useAdminStore()

  const [form, setForm] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (activePhase) {
      const data: Record<string, unknown> = {}
      for (const field of PHASE_FIELDS) {
        data[field.key] = (activePhase as unknown as Record<string, unknown>)[field.key]
      }
      setForm(data)
    }
  }, [activePhase])

  const updateField = useCallback(
    (key: string, value: unknown) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setDirty(true)
    },
    [setDirty],
  )

  const handleSave = async () => {
    const updates: Record<string, unknown> = {}
    for (const field of PHASE_FIELDS) {
      if (field.key === 'id') continue
      updates[field.key] = form[field.key]
    }
    await savePhase(updates)
  }

  if (loading && !activePhase) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading phase..." />
      </div>
    )
  }

  if (!activePhase) {
    return (
      <div className="text-center py-20 text-wiki-textMuted text-xs">
        <p>Phase not found.</p>
        {editingBattleId && (
          <button
            onClick={() => goToEditBattle(editingBattleId)}
            className="text-un hover:underline mt-2"
          >
            &larr; Back to battle
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => editingBattleId && goToEditBattle(editingBattleId)}
            className="text-xs text-un hover:underline"
          >
            &larr; Back to {activeBattle?.name ?? 'battle'}
          </button>
          <h2
            className="text-lg font-bold text-wiki-text"
            style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
          >
            Edit Phase: {activePhase.label}
          </h2>
          {dirty && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-1.5 py-0.5">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm(`Delete phase "${activePhase.label}"?`)) {
                removePhase(activePhase.id)
              }
            }}
            disabled={saving}
            className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Delete Phase
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs bg-un text-white rounded hover:bg-un-muted transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Phase'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="glass-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-wiki-text uppercase tracking-wider border-b border-wiki-border pb-1">
          Phase Data
        </h3>

        {/* Simple fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PHASE_FIELDS.filter((f) => f.type !== 'json').map((field) => {
            const disabled = field.key === 'id'
            return (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-wiki-text mb-1">
                  {field.label}
                </label>
                {field.helpText && (
                  <p className="text-[10px] text-wiki-textMuted mb-1">{field.helpText}</p>
                )}
                {field.type === 'textarea' ? (
                  <textarea
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={field.rows ?? 3}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-wiki-border rounded resize-y focus:outline-none focus:ring-1 focus:ring-un/40"
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={Number(form[field.key] ?? 0)}
                    onChange={(e) => updateField(field.key, Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-wiki-border rounded focus:outline-none focus:ring-1 focus:ring-un/40"
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
          {PHASE_FIELDS.filter((f) => f.type === 'json').map((field) => (
            <JsonField
              key={field.key}
              label={field.label}
              value={form[field.key] ?? (PHASE_ARRAY_FIELDS.has(field.key) ? [] : {})}
              onChange={(val) => updateField(field.key, val)}
              rows={field.rows}
              helpText={field.helpText}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
