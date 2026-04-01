/**
 * Toast notification overlay for the admin UI.
 */

import { useAdminStore } from '@/store/useAdminStore'

const bgMap = {
  success: 'bg-green-800/90 border-green-600',
  error: 'bg-red-900/90 border-red-700',
  info: 'bg-un/90 border-un-light',
} as const

export function Toasts() {
  const toasts = useAdminStore((s) => s.toasts)
  const dismiss = useAdminStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded border text-white text-xs shadow-lg ${bgMap[t.type]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-white/60 hover:text-white ml-2 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
