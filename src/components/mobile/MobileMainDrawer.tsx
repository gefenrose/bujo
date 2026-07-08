import { useState } from 'react'
import type { Journal } from '../../hooks/useJournal'
import type { Filter } from '../../types'
import { allUsedTags } from '../../lib/filters'
import { CollectionsShelf } from '../CollectionsShelf'
import {
  CloseIcon,
  FilterIcon,
  InboxIcon,
  ListIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  SettingsIcon,
  TagIcon,
} from '../icons/Icons'
import { AddFilterModal } from './AddFilterModal'
import { AddTagModal } from './AddTagModal'

interface MobileMainDrawerProps {
  journal: Journal
  selectedCollectionId: string | null
  onSelectCollection: (id: string) => void
  onSelectFilter: (filter: Filter) => void
  onInbox: () => void
  onHabits: () => void
  onSearch: () => void
  onSettings: () => void
  onClose: () => void
}

const FILTER_COLORS = [
  'text-blue-500 dark:text-blue-400',
  'text-rose-500 dark:text-rose-400',
  'text-emerald-500 dark:text-emerald-400',
  'text-amber-500 dark:text-amber-400',
  'text-violet-500 dark:text-violet-400',
]

/** Mobile-only slide-in drawer (opened via the header hamburger): app nav, collections, saved filters and pinned tags. */
export function MobileMainDrawer({
  journal,
  selectedCollectionId,
  onSelectCollection,
  onSelectFilter,
  onInbox,
  onHabits,
  onSearch,
  onSettings,
  onClose,
}: MobileMainDrawerProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [creatingList, setCreatingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [addFilterOpen, setAddFilterOpen] = useState(false)
  const [addTagOpen, setAddTagOpen] = useState(false)

  const commitNewList = () => {
    const name = newListName.trim()
    setCreatingList(false)
    setNewListName('')
    if (!name) return
    const id = journal.addCollection(name)
    if (id) {
      onSelectCollection(id)
      onClose()
    }
  }

  const availableTags = allUsedTags(journal.entries).filter((t) => !journal.pinnedTags.includes(t))

  return (
    <div className="fixed inset-0 z-50 flex bg-black/20 dark:bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-72 max-w-[85vw] flex-col border-e border-ink/10 bg-paper dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-base font-medium tracking-tight text-ink dark:text-inkdark">bujo</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onSearch()
                onClose()
              }}
              className="flex h-8 w-8 items-center justify-center text-ink/60 dark:text-inkdark/60"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onSettings()
                onClose()
              }}
              className="flex h-8 w-8 items-center justify-center text-ink/60 dark:text-inkdark/60"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-2 pt-3">
          <button
            type="button"
            onClick={() => {
              onInbox()
              onClose()
            }}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink/80 hover:bg-ink/[0.04] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.05]"
          >
            <InboxIcon className="h-4 w-4" />
            תיבת קלט
          </button>
          <button
            type="button"
            onClick={() => {
              onHabits()
              onClose()
            }}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink/80 hover:bg-ink/[0.04] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.05]"
          >
            <RepeatIcon className="h-4 w-4" />
            הרגלים
          </button>
        </div>

        <div className="mx-4 my-3 border-t border-ink/10 dark:border-inkdark/10" />

        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          <CollectionsShelf
            journal={journal}
            selectedId={selectedCollectionId}
            onSelect={(id) => {
              onSelectCollection(id)
              onClose()
            }}
            layout="list"
            showAddButton={false}
          />

          {creatingList && (
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={commitNewList}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitNewList()
                if (e.key === 'Escape') {
                  setCreatingList(false)
                  setNewListName('')
                }
              }}
              placeholder="שם האוסף"
              className="mt-1.5 w-full rounded-lg border border-ink/20 bg-transparent px-2.5 py-1.5 text-sm text-ink outline-none dark:border-inkdark/20 dark:text-inkdark"
            />
          )}

          {(journal.filters.length > 0 || journal.pinnedTags.length > 0) && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-ink/10 pt-3 dark:border-inkdark/10">
              {journal.filters.map((filter, i) => (
                <div
                  key={filter.id}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink/70 hover:bg-ink/[0.04] dark:text-inkdark/70 dark:hover:bg-inkdark/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFilter(filter)
                      onClose()
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-start"
                  >
                    <FilterIcon className={`h-4 w-4 shrink-0 ${FILTER_COLORS[i % FILTER_COLORS.length]}`} />
                    <span className="truncate">{filter.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => journal.deleteFilter(filter.id)}
                    className="shrink-0 text-ink/25 hover:text-red-600 dark:text-inkdark/25 dark:hover:text-red-400"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {journal.pinnedTags.map((tag) => (
                <div
                  key={tag}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink/70 hover:bg-ink/[0.04] dark:text-inkdark/70 dark:hover:bg-inkdark/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFilter({ id: `tag:${tag}`, name: `#${tag}`, tag, createdAt: 0 })
                      onClose()
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-start"
                  >
                    <TagIcon className="h-4 w-4 shrink-0 text-ink/40 dark:text-inkdark/40" />
                    <span className="truncate">#{tag}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => journal.unpinTag(tag)}
                    className="shrink-0 text-ink/25 hover:text-red-600 dark:text-inkdark/25 dark:hover:text-red-400"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative border-t border-ink/10 p-2 dark:border-inkdark/10">
          {addMenuOpen && (
            <div className="absolute bottom-full start-2 mb-1.5 w-44 rounded-xl border border-ink/10 bg-paper p-1 shadow-xl dark:border-inkdark/10 dark:bg-paperdark">
              <button
                type="button"
                onClick={() => {
                  setAddMenuOpen(false)
                  setCreatingList(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm text-ink/80 hover:bg-ink/[0.05] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.06]"
              >
                <ListIcon className="h-4 w-4" />
                רשימה חדשה
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMenuOpen(false)
                  setAddFilterOpen(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm text-ink/80 hover:bg-ink/[0.05] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.06]"
              >
                <FilterIcon className="h-4 w-4" />
                מסנן חדש
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMenuOpen(false)
                  setAddTagOpen(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm text-ink/80 hover:bg-ink/[0.05] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.06]"
              >
                <TagIcon className="h-4 w-4" />
                הצמדת תגית
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAddMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink/80 hover:bg-ink/[0.04] dark:text-inkdark/80 dark:hover:bg-inkdark/[0.05]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-paper dark:bg-inkdark dark:text-paperdark">
              <PlusIcon className="h-3.5 w-3.5" />
            </span>
            הוספה
          </button>
        </div>
      </div>

      {addFilterOpen && (
        <AddFilterModal
          onClose={() => setAddFilterOpen(false)}
          onCreate={(input) => journal.addFilter(input)}
        />
      )}

      {addTagOpen && (
        <AddTagModal availableTags={availableTags} onClose={() => setAddTagOpen(false)} onPick={journal.pinTag} />
      )}
    </div>
  )
}
