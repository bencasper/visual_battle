import type { SourceLinkProps } from './InsightPanel.types'

const TYPE_ICONS: Record<string, string> = {
  book: '📚',
  official: '📄',
  article: '📰',
  documentary: '🎥',
  map: '🗺️',
}

export function SourceLink({ source }: SourceLinkProps) {
  const icon = TYPE_ICONS[source.type] ?? '🔗'
  return (
    <div className="flex items-start gap-1.5 text-[10px]">
      <span>{icon}</span>
      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-un-light hover:underline leading-snug">
          {source.title}
        </a>
      ) : (
        <span className="text-slate-400 leading-snug">{source.title}</span>
      )}
    </div>
  )
}
