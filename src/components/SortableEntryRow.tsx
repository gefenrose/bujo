import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Entry } from '../types'
import { EntryRow } from './EntryRow'

interface SortableEntryRowProps {
  entry: Entry
  onToggle: () => void
  onEdit: (text: string) => void
  onEditTime: (time: string | undefined) => void
  onRemoveTime: () => void
  onDelete: () => void
  onMigrate: () => void
  onTogglePriority: () => void
  onCycleType: () => void
}

export function SortableEntryRow(props: SortableEntryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.entry.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-10 opacity-90' : undefined}>
      <EntryRow {...props} dragHandleProps={{ attributes, listeners }} />
    </div>
  )
}
