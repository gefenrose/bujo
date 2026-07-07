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
import { SortableEntryRow } from './SortableEntryRow'
import { EntryInput } from './EntryInput'

interface EntryListProps {
  journal: Journal
  entries: Entry[]
  onMigrate: (entry: Entry) => void
  onAdd: (text: string, type: EntryType, time?: string) => void
  emptyMessage: string
}

export function EntryList({ journal, entries, onMigrate, onAdd, emptyMessage }: EntryListProps) {
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
            />
          ))}
        </SortableContext>
      </DndContext>
      <EntryInput onSubmit={onAdd} />
      {entries.length === 0 && (
        <p className="mt-2 text-sm text-ink/30 dark:text-inkdark/30">{emptyMessage}</p>
      )}
    </div>
  )
}
