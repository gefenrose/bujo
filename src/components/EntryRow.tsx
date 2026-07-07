import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Entry } from '../types'
import { nextEntryType } from '../lib/entries'
import { Bullet } from './Bullet'
import { GripIcon, StarIcon, ArrowRightIcon, CloseIcon } from './icons/Icons'

interface EntryRowProps {
  entry: Entry
  onToggle: () => void
  onEdit: (text: string) => void
  onDelete: () => void
  onMigrate: () => void
  onTogglePriority: () => void
  onCycleType: () => void
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: DraggableSyntheticListeners
  }
}

const SWIPE_THRESHOLD = 64
const SWIPE_MAX = 96

const TYPE_GLYPH: Record<Entry['type'], string> = { task: '•', event: '○', note: '–' }

export function EntryRow({
  entry,
  onToggle,
  onEdit,
  onDelete,
  onMigrate,
  onTogglePriority,
  onCycleType,
  dragHandleProps,
}: EntryRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragX, setDragX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const gestureRef = useRef<{ x: number; y: number; active: boolean } | null>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.text) onEdit(trimmed)
    else setDraft(entry.text)
  }

  const struck = entry.status === 'done' || entry.status === 'cancelled'
  const dimmed = entry.status === 'migrated' || entry.status === 'cancelled'

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (editing) return
    const target = e.target as HTMLElement
    if (target.closest('[data-drag-handle]') || target.closest('button')) return
    gestureRef.current = { x: e.clientX, y: e.clientY, active: false }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture) return
    const dx = e.clientX - gesture.x
    const dy = e.clientY - gesture.y

    if (!gesture.active) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dy) > Math.abs(dx)) {
        gestureRef.current = null
        return
      }
      gesture.active = true
      setSwiping(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    e.preventDefault()
    setDragX(Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx)))
  }

  const endGesture = () => {
    const gesture = gestureRef.current
    if (gesture?.active) {
      if (dragX > SWIPE_THRESHOLD) onTogglePriority()
      else if (dragX < -SWIPE_THRESHOLD) onCycleType()
    }
    gestureRef.current = null
    setSwiping(false)
    setDragX(0)
  }

  const priorityRevealOpacity = Math.max(0, Math.min(1, dragX / SWIPE_THRESHOLD))
  const typeRevealOpacity = Math.max(0, Math.min(1, -dragX / SWIPE_THRESHOLD))

  return (
    <div className="relative -mx-1.5 overflow-hidden rounded">
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <span
          className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500"
          style={{ opacity: priorityRevealOpacity }}
        >
          <StarIcon filled className="h-4 w-4" />
        </span>
        <span
          className="flex items-center gap-1.5 text-ink/50 dark:text-inkdark/50"
          style={{ opacity: typeRevealOpacity }}
        >
          <span className="text-base leading-none">{TYPE_GLYPH[nextEntryType(entry.type)]}</span>
        </span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        style={{
          transform: dragX ? `translateX(${dragX}px)` : undefined,
          transition: swiping ? 'none' : 'transform 200ms ease-out',
          touchAction: 'pan-y',
        }}
        className="group relative flex items-start gap-1.5 rounded bg-paper px-1.5 py-1 hover:bg-ink/[0.03] dark:bg-paperdark dark:hover:bg-inkdark/[0.04]"
      >
        {dragHandleProps && (
          <button
            type="button"
            data-drag-handle
            className="mt-[0.4em] shrink-0 cursor-grab touch-none text-ink/20 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100 dark:text-inkdark/20"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripIcon className="h-3.5 w-3.5" />
          </button>
        )}

        <Bullet entry={entry} onClick={onToggle} />

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(entry.text)
                setEditing(false)
              }
            }}
            className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none dark:text-inkdark"
          />
        ) : (
          <p
            onClick={() => {
              setDraft(entry.text)
              setEditing(true)
            }}
            className={`min-w-0 flex-1 cursor-text py-0.5 text-[0.95rem] leading-snug ${
              struck ? 'line-through decoration-1' : ''
            } ${dimmed ? 'text-ink/40 dark:text-inkdark/40' : 'text-ink dark:text-inkdark'}`}
          >
            {entry.text}
          </p>
        )}

        {entry.priority && (
          <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" title="priority">
            <StarIcon filled className="h-3.5 w-3.5" />
          </span>
        )}

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onTogglePriority}
            title="Toggle priority"
            className="rounded p-1 text-ink/40 hover:text-amber-600 dark:text-inkdark/40 dark:hover:text-amber-500"
          >
            <StarIcon className="h-3.5 w-3.5" />
          </button>
          {entry.status === 'open' && (
            <button
              type="button"
              onClick={onMigrate}
              title="Migrate"
              className="rounded p-1 text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
            >
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="rounded p-1 text-ink/40 hover:text-red-600 dark:text-inkdark/40 dark:hover:text-red-400"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
