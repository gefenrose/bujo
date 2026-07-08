import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { Journal } from '../hooks/useJournal'
import type { Entry, EntryType } from '../types'
import { nextEntryType } from '../lib/entries'
import { rowColor } from '../lib/collectionColors'
import { usePreferences } from '../hooks/usePreferences'
import { SortableEntryRow } from './SortableEntryRow'
import { EntryInput } from './EntryInput'

interface EntryListProps {
  journal: Journal
  entries: Entry[]
  onMigrate: (entry: Entry) => void
  onAdd: (text: string, type: EntryType, time?: string) => void
  onTagClick: (tag: string) => void
  emptyMessage: string
  /** Hide the inline add-entry input on mobile viewports, where a floating quick-add button is used instead. */
  hideAddOnMobile?: boolean
}

export function EntryList({
  journal,
  entries,
  onMigrate,
  onAdd,
  onTagClick,
  emptyMessage,
  hideAddOnMobile,
}: EntryListProps) {
  const { preferences } = usePreferences()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = entries.findIndex((e) => e.id === active.id)
    const newIndex = entries.findIndex((e) => e.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    journal.reorderEntries(arrayMove(entries, oldIndex, newIndex).map((e) => e.id))
  }

  const colorClassFor = (entry: Entry): string | undefined => {
    if (preferences.entryColorStyle === 'none' || !entry.collectionId) return undefined
    const index = journal.collections.findIndex((c) => c.id === entry.collectionId)
    if (index === -1) return undefined
    return rowColor(index, preferences.autoAssignColors)
  }

  return (
    <div className="flex flex-col">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {entries.map((entry) => (
            <SortableEntryRow
              key={entry.id}
              entry={entry}
              onToggle={() => journal.cycleStatus(entry.id)}
              onEdit={(text) => journal.updateEntry(entry.id, { text })}
              onEditTime={(time) => journal.updateEntry(entry.id, { time })}
              onRemoveTime={() => journal.clearEntryTime(entry.id)}
              onDelete={() => journal.deleteEntry(entry.id)}
              onMigrate={() => onMigrate(entry)}
              onTogglePriority={() => journal.togglePriority(entry.id)}
              onCycleType={() => journal.updateEntry(entry.id, { type: nextEntryType(entry.type) })}
              onAddSubtask={(text) => journal.addSubtask(entry.id, text)}
              onToggleSubtask={(subtaskId) => journal.toggleSubtask(entry.id, subtaskId)}
              onDeleteSubtask={(subtaskId) => journal.deleteSubtask(entry.id, subtaskId)}
              onAddTag={(tag) => journal.addTag(entry.id, tag)}
              onRemoveTag={(tag) => journal.removeTag(entry.id, tag)}
              onTagClick={onTagClick}
              onAddImage={(dataUrl) => journal.addImage(entry.id, dataUrl)}
              onRemoveImage={(dataUrl) => journal.removeImage(entry.id, dataUrl)}
              onSetImagesHidden={(hidden) => journal.setImagesHidden(entry.id, hidden)}
              colorClass={colorClassFor(entry)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <div className={hideAddOnMobile ? 'hidden sm:block' : undefined}>
        <EntryInput onSubmit={onAdd} />
      </div>
      {entries.length === 0 && (
        <p className="mt-2 text-sm text-ink/50 dark:text-inkdark/50">{emptyMessage}</p>
      )}
    </div>
  )
}
