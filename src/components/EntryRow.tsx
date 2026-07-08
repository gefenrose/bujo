import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Entry } from '../types'
import { nextEntryType } from '../lib/entries'
import { formatTime, parseTimeInput } from '../lib/date'
import { readAndResizeImage } from '../lib/images'
import { usePreferences } from '../hooks/usePreferences'
import { Bullet } from './Bullet'
import { ImageLightbox } from './ImageLightbox'
import { TimeField } from './TimeField'
import {
  GripIcon,
  StarIcon,
  ArrowRightIcon,
  CloseIcon,
  ClockIcon,
  ChevronIcon,
  EyeOffIcon,
  ImageIcon,
  TagIcon,
  SubtaskIcon,
  MoreIcon,
} from './icons/Icons'

interface EntryRowProps {
  entry: Entry
  onToggle: () => void
  onEdit: (text: string) => void
  onEditTime: (time: string | undefined) => void
  onRemoveTime: () => void
  onDelete: () => void
  onMigrate: () => void
  onTogglePriority: () => void
  onCycleType: () => void
  onAddSubtask: (text: string) => void
  onToggleSubtask: (subtaskId: string) => void
  onDeleteSubtask: (subtaskId: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTagClick: (tag: string) => void
  onAddImage: (dataUrl: string) => void
  onRemoveImage: (dataUrl: string) => void
  onSetImagesHidden: (hidden: boolean) => void
  /** Resolved collection color (per the "Entry Color Style" preference), applied to the icon and/or title. */
  colorClass?: string
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
  onEditTime,
  onRemoveTime,
  onDelete,
  onMigrate,
  onTogglePriority,
  onCycleType,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddTag,
  onRemoveTag,
  onTagClick,
  onAddImage,
  onRemoveImage,
  onSetImagesHidden,
  colorClass,
  dragHandleProps,
}: EntryRowProps) {
  const { preferences } = usePreferences()
  const [editing, setEditing] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(entry.text)
  const [timeDraft, setTimeDraft] = useState(entry.time ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragX, setDragX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const gestureRef = useRef<{ x: number; y: number; active: boolean } | null>(null)

  const [subtasksOpen, setSubtasksOpen] = useState(preferences.showSubtasksByDefault)
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)

  useEffect(() => {
    if (addingTag) tagInputRef.current?.focus()
  }, [addingTag])

  const subtasks = entry.subtasks ?? []
  const tags = entry.tags ?? []
  const images = entry.images ?? []
  const imagesHidden = entry.imagesHidden ?? preferences.imageLayout[entry.type] === 'hidden'
  const doneCount = subtasks.filter((s) => s.done).length

  const handleImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await readAndResizeImage(file)
      onAddImage(dataUrl)
    } catch {
      // ignore unreadable files
    }
  }

  const commitSubtask = () => {
    const trimmed = subtaskDraft.trim()
    if (trimmed) onAddSubtask(trimmed)
    setSubtaskDraft('')
  }

  const commitTag = () => {
    const trimmed = tagDraft.trim()
    if (trimmed) onAddTag(trimmed)
    setTagDraft('')
    setAddingTag(false)
  }

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const startEditing = () => {
    setDraft(entry.text)
    setTimeDraft(entry.time ?? '')
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.text) onEdit(trimmed)
    else setDraft(entry.text)
    const parsedTime = parseTimeInput(timeDraft)
    if (parsedTime !== (entry.time ?? '')) onEditTime(parsedTime || undefined)
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

  const actionButtons = (
    <>
      {entry.type === 'task' && (
        <button
          type="button"
          onClick={() => setSubtasksOpen((v) => !v)}
          title="תת-משימות"
          className="rounded p-1 text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
        >
          <SubtaskIcon className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setAddingTag(true)}
        title="הוספת תגית"
        className="rounded p-1 text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
      >
        <TagIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="הוספת תמונה"
        className="rounded p-1 text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
      >
        <ImageIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onTogglePriority}
        title="סימון עדיפות"
        className="rounded p-1 text-ink/40 hover:text-amber-600 dark:text-inkdark/40 dark:hover:text-amber-500"
      >
        <StarIcon className="h-3.5 w-3.5" />
      </button>
      {entry.status === 'open' && (
        <button
          type="button"
          onClick={onMigrate}
          title="העברה ליום הבא"
          className="rounded p-1 text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
        >
          <ArrowRightIcon className="h-3.5 w-3.5 -scale-x-100" />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        title="מחיקה"
        className="rounded p-1 text-ink/40 hover:text-red-600 dark:text-inkdark/40 dark:hover:text-red-400"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </>
  )

  return (
    <>
      <div className="relative -mx-1.5 overflow-hidden rounded">
        <div className="absolute inset-0">
          {/* Physical left/right (not logical start/end): these track the pointer's physical drag
              direction, which is independent of reading direction, so they must not flip under RTL. */}
          <span
            className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-amber-600 dark:text-amber-500"
            style={{ opacity: priorityRevealOpacity }}
          >
            <StarIcon filled className="h-4 w-4" />
          </span>
          <span
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-ink/50 dark:text-inkdark/50"
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

          <Bullet
            entry={entry}
            onClick={onToggle}
            colorClass={preferences.entryColorStyle !== 'none' ? colorClass : undefined}
          />

          {editing ? (
            <div
              className="flex min-w-0 flex-1 items-center gap-2"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commit()
              }}
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') {
                    setDraft(entry.text)
                    setTimeDraft(entry.time ?? '')
                    setEditing(false)
                  }
                }}
                className="min-w-0 flex-1 bg-transparent py-0.5 text-[0.95rem] leading-snug text-ink outline-none dark:text-inkdark"
              />
              <TimeField
                value={timeDraft}
                onChange={setTimeDraft}
                onEnter={commit}
                className="w-12 shrink-0 rounded border border-ink/15 bg-transparent px-1 py-0.5 text-xs text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
              />
            </div>
          ) : (
            <p
              onClick={startEditing}
              className="flex min-w-0 flex-1 flex-wrap cursor-text items-baseline gap-x-2 gap-y-1 py-0.5"
            >
              {entry.time && (
                <span className="group/time flex shrink-0 items-center gap-0.5 text-xs tabular-nums text-ink/40 dark:text-inkdark/40">
                  <ClockIcon className="h-3 w-3" />
                  {formatTime(entry.time, preferences.timeFormat)}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveTime()
                    }}
                    title="הסרת שעה"
                    className="opacity-0 hover:text-red-600 group-hover/time:opacity-100 dark:hover:text-red-400"
                  >
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              <span
                style={{ fontWeight: 'var(--content-font-weight)' }}
                className={`min-w-0 text-[0.95rem] leading-snug ${struck ? 'line-through decoration-1' : ''} ${
                  dimmed
                    ? 'text-ink/40 dark:text-inkdark/40'
                    : preferences.entryColorStyle === 'titleAndIcon' && colorClass
                      ? colorClass
                      : 'text-ink dark:text-inkdark'
                }`}
              >
                {entry.text}
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="group/tag flex shrink-0 items-center gap-1 rounded-full bg-ink/[0.06] ps-2 pe-1 py-0.5 text-xs text-ink/50 hover:bg-ink/10 hover:text-ink dark:bg-inkdark/[0.08] dark:text-inkdark/50 dark:hover:bg-inkdark/15 dark:hover:text-inkdark"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTagClick(tag)
                    }}
                  >
                    #{tag}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveTag(tag)
                    }}
                    className="opacity-0 hover:text-red-600 group-hover/tag:opacity-100 dark:hover:text-red-400"
                  >
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </p>
          )}

          {entry.type === 'task' && subtasks.length > 0 && (
            <button
              type="button"
              onClick={() => setSubtasksOpen((v) => !v)}
              title="תת-משימות"
              className="mt-0.5 flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-xs tabular-nums text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
            >
              {doneCount}/{subtasks.length}
              <ChevronIcon className={`h-3 w-3 transition-transform ${subtasksOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {entry.priority && (
            <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" title="עדיפות">
              <StarIcon filled className="h-3.5 w-3.5" />
            </span>
          )}

          {addingTag && (
            <input
              ref={tagInputRef}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onBlur={commitTag}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTag()
                if (e.key === 'Escape') {
                  setTagDraft('')
                  setAddingTag(false)
                }
              }}
              placeholder="תגית"
              className="w-20 shrink-0 rounded-full border border-ink/15 bg-transparent px-2 py-0.5 text-xs text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
            />
          )}

          {/* Hover-reveal actions: only worthwhile on hover-capable (desktop) pointers — on
              touch there's no hover, so this stays hidden there instead of permanently
              reserving row width and crushing the entry text. */}
          <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity sm:flex sm:group-hover:opacity-100">
            {actionButtons}
          </div>

          <button
            type="button"
            onClick={() => setMobileActionsOpen((v) => !v)}
            title="פעולות נוספות"
            className="rounded p-1 text-ink/30 dark:text-inkdark/30 sm:hidden"
          >
            <MoreIcon className="h-3.5 w-3.5" />
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
        </div>
      </div>

      {mobileActionsOpen && (
        <div className="me-10 flex items-center gap-3 py-1 sm:hidden">{actionButtons}</div>
      )}

      {images.length > 0 &&
        (imagesHidden ? (
          <button
            type="button"
            onClick={() => onSetImagesHidden(false)}
            className="ms-10 flex items-center gap-1 py-1 text-xs text-ink/40 hover:text-ink dark:text-inkdark/40 dark:hover:text-inkdark"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            {images.length} תמונות — הצגה
          </button>
        ) : (
          <div className="ms-10 flex flex-wrap items-center gap-1.5 py-1">
            {images.map((src) => (
              <div key={src} className="group/image relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                <button type="button" onClick={() => setLightboxSrc(src)} className="block h-full w-full">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveImage(src)}
                  className="absolute end-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white opacity-0 group-hover/image:opacity-100"
                >
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onSetImagesHidden(true)}
              title="הסתרת תמונות"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark"
            >
              <EyeOffIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {entry.type === 'task' && subtasksOpen && (
        <div className="ms-10 flex flex-col gap-0.5 py-1">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="group/subtask flex items-center gap-1.5 py-0.5">
              <button
                type="button"
                onClick={() => onToggleSubtask(subtask.id)}
                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                  subtask.done
                    ? 'border-ink/30 bg-ink/30 dark:border-inkdark/30 dark:bg-inkdark/30'
                    : 'border-ink/30 dark:border-inkdark/30'
                }`}
              />
              <span
                className={`min-w-0 flex-1 text-sm ${
                  subtask.done
                    ? 'text-ink/40 line-through decoration-1 dark:text-inkdark/40'
                    : 'text-ink/80 dark:text-inkdark/80'
                }`}
              >
                {subtask.text}
              </span>
              <button
                type="button"
                onClick={() => onDeleteSubtask(subtask.id)}
                className="shrink-0 text-ink/20 opacity-0 hover:text-red-600 group-hover/subtask:opacity-100 dark:text-inkdark/20 dark:hover:text-red-400"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          <input
            value={subtaskDraft}
            onChange={(e) => setSubtaskDraft(e.target.value)}
            onBlur={commitSubtask}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSubtask()
              if (e.key === 'Escape') setSubtaskDraft('')
            }}
            placeholder="תת-משימה חדשה"
            className="bg-transparent py-0.5 text-sm text-ink outline-none placeholder:text-ink/25 dark:text-inkdark dark:placeholder:text-inkdark/25"
          />
        </div>
      )}
    </>
  )
}
