/**
 * Reusable JSON text editor field.
 * Displays a textarea with JSON syntax validation.
 */

import { useState, useCallback, useEffect, useRef } from 'react'

interface JsonFieldProps {
  label: string
  value: unknown
  onChange: (value: unknown) => void
  rows?: number
  helpText?: string
}

export function JsonField({ label, value, onChange, rows = 6, helpText }: JsonFieldProps) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)

  // Track whether the user is actively editing to avoid clobbering their text
  const userEditingRef = useRef(false)

  // Sync textarea text when the value prop changes from the outside
  // (e.g., when activeBattle loads from the API)
  useEffect(() => {
    if (!userEditingRef.current) {
      const incoming = JSON.stringify(value, null, 2)
      setText(incoming)
      setParseError(null)
    }
  }, [value])

  const handleChange = useCallback(
    (raw: string) => {
      userEditingRef.current = true
      setText(raw)
      try {
        const parsed = JSON.parse(raw)
        setParseError(null)
        onChange(parsed)
      } catch (e) {
        setParseError((e as Error).message)
      }
    },
    [onChange],
  )

  // Reset editing flag when the parent swaps to a different field value
  // (navigating to a different battle/phase)
  const prevValueRef = useRef(value)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      userEditingRef.current = false
      prevValueRef.current = value
    }
  }, [value])

  return (
    <div>
      <label className="block text-[11px] font-semibold text-wiki-text mb-1">{label}</label>
      {helpText && <p className="text-[10px] text-wiki-textMuted mb-1">{helpText}</p>}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`w-full px-2 py-1.5 text-[11px] font-mono bg-white border rounded resize-y focus:outline-none focus:ring-1 ${
          parseError
            ? 'border-red-400 focus:ring-red-300'
            : 'border-wiki-border focus:ring-un/40'
        }`}
      />
      {parseError && (
        <p className="text-[10px] text-red-600 mt-0.5">Invalid JSON: {parseError}</p>
      )}
    </div>
  )
}
