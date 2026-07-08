import { useState } from 'react'
import type { EntryType } from '../../types'
import { CloseIcon } from '../icons/Icons'

interface AddFilterModalProps {
  onClose: () => void
  onCreate: (input: { name: string; type?: EntryType; priorityOnly?: boolean; tag?: string }) => void
}

const TYPE_OPTIONS: { type: EntryType | undefined; label: string }[] = [
  { type: undefined, label: 'הכל' },
  { type: 'task', label: 'משימה' },
  { type: 'event', label: 'אירוע' },
  { type: 'note', label: 'הערה' },
]

export function AddFilterModal({ onClose, onCreate }: AddFilterModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<EntryType | undefined>(undefined)
  const [priorityOnly, setPriorityOnly] = useState(false)
  const [tag, setTag] = useState('')

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate({ name: trimmed, type, priorityOnly, tag: tag.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20 dark:bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-ink/10 bg-paper p-4 shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink dark:text-inkdark">מסנן חדש</h2>
          <button type="button" onClick={onClose} className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="שם המסנן (למשל דחוף)"
            className="w-full rounded-lg border border-ink/15 bg-transparent px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-ink/30 dark:border-inkdark/15 dark:text-inkdark dark:placeholder:text-inkdark/30"
          />

          <div className="flex flex-wrap items-center gap-1 rounded-full border border-ink/10 p-0.5 text-xs dark:border-inkdark/10">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setType(opt.type)}
                className={`rounded-full px-2.5 py-1 ${
                  type === opt.type
                    ? 'bg-ink/[0.08] text-ink dark:bg-inkdark/[0.1] dark:text-inkdark'
                    : 'text-ink/50 dark:text-inkdark/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/80 dark:text-inkdark/80">
            <input
              type="checkbox"
              checked={priorityOnly}
              onChange={(e) => setPriorityOnly(e.target.checked)}
              className="h-4 w-4 accent-ink dark:accent-inkdark"
            />
            רק רשומות בעדיפות
          </label>

          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="תגית (לא חובה)"
            className="w-full rounded-lg border border-ink/15 bg-transparent px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-ink/30 dark:border-inkdark/15 dark:text-inkdark dark:placeholder:text-inkdark/30"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:opacity-90 disabled:opacity-50 dark:bg-inkdark dark:text-paperdark"
          >
            יצירה
          </button>
        </div>
      </div>
    </div>
  )
}
