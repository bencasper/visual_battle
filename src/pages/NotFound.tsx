import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <p className="text-6xl">🗺️</p>
      <h1 className="text-xl font-semibold text-slate-200">Page Not Found</h1>
      <p className="text-sm text-slate-400">This territory is uncharted.</p>
      <Link to="/" className="text-un-light text-sm hover:underline">← Return to Battle List</Link>
    </div>
  )
}
