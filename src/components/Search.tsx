import { useMemo, useState } from 'react'
import type { Journal } from '../hooks/useJournal'
import { formatShortDate } from '../lib/date'
import { Bullet } from './Bullet'
import { CloseIcon, SearchIcon } from './icons/Icons'

interface SearchProps {
  journal: Journal
  initialQuery?: string
  onClose: () => void
  onSelectDate: (date: string) => void
  onSelectCollection: (collectionId: string) => void
}

export function Search({ journal, initialQuery, onClose, onSelectDate, onSelectCollection }: SearchProps) {
  const [query, setQuery] = useState(initialQuery ?? '')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return journal.entries
      .filter(
        (e) =>
          e.text.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.includes(q)) ||
          (e.subtasks ?? []).some((s) => s.text.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50)
  }, [journal.entries, query])

  const contextLabel = (entryId: string) => {
    const entry = journal.entries.find((e) => e.id === entryId)
    if (!entry) return ''
    if (entry.date) return formatShortDate(entry.date)
    if (entry.collectionId) return journal.collections.find((c) => c.id === entry.collectionId)?.name ?? ''
    return ''
  }

  const select = (entry: (typeof results)[number]) => {
    if (entry.date) onSelectDate(entry.date)
    else if (entry.collectionId) onSelectCollection(entry.collectionId)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20 dark:bg-black/40"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl border border-ink/10 bg-paper shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3 dark:border-inkdark/10">
          <span className="text-ink/60 dark:text-inkdark/60">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="חיפוש ברשומות, תגיות ותת-משימות"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/50 dark:text-inkdark dark:placeholder:text-inkdark/50"
          />
          <button
            onClick={onClose}
            className="shrink-0 text-ink/50 hover:text-ink dark:text-inkdark/50 dark:hover:text-inkdark"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() && results.length === 0 && (
            <p className="px-2 py-3 text-sm text-ink/50 dark:text-inkdark/50">לא נמצאו תוצאות.</p>
          )}
          {results.map((entry) => (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => select(entry)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') select(entry)
              }}
              className="flex w-full cursor-pointer items-baseline gap-2 rounded-lg px-2 py-2 text-start hover:bg-ink/[0.04] dark:hover:bg-inkdark/[0.06]"
            >
              <span className="inline-flex -translate-y-px items-center">
                <Bullet entry={entry} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink/80 dark:text-inkdark/80">{entry.text}</span>
              <span className="shrink-0 text-xs text-ink/50 dark:text-inkdark/50">{contextLabel(entry.id)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
