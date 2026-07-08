import type { Journal } from '../../hooks/useJournal'
import { CollectionsShelf } from '../CollectionsShelf'
import { CloseIcon } from '../icons/Icons'

interface MobileCollectionsDrawerProps {
  journal: Journal
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

/** Mobile-only slide-in drawer (opened via the header hamburger) listing collections. */
export function MobileCollectionsDrawer({ journal, selectedId, onSelect, onClose }: MobileCollectionsDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex bg-black/20 dark:bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-64 max-w-[80vw] flex-col gap-4 border-e border-ink/10 bg-paper p-4 dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink dark:text-inkdark">אוספים</span>
          <button type="button" onClick={onClose} className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <CollectionsShelf
          journal={journal}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelect(id)
            onClose()
          }}
          layout="list"
        />
      </div>
    </div>
  )
}
