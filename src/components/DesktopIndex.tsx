import type { Journal } from '../hooks/useJournal'
import { CollectionsShelf } from './CollectionsShelf'

interface DesktopIndexProps {
  journal: Journal
  view: string
  selectedCollectionId: string | null
  onDaily: () => void
  onWeekly: () => void
  onMonthly: () => void
  onYearly: () => void
  onInbox: () => void
  onSelectCollection: (id: string) => void
}

const indexItems = [
  { key: 'daily', label: 'יומן יומי', mark: '01' },
  { key: 'weekly', label: 'סקירה שבועית', mark: '07' },
  { key: 'monthly', label: 'יומן חודשי', mark: '31' },
  { key: 'yearly', label: 'יומן עתידי', mark: '12' },
] as const

export function DesktopIndex({
  journal,
  view,
  selectedCollectionId,
  onDaily,
  onWeekly,
  onMonthly,
  onYearly,
  onInbox,
  onSelectCollection,
}: DesktopIndexProps) {
  const actions = { daily: onDaily, weekly: onWeekly, monthly: onMonthly, yearly: onYearly }

  return (
    <aside className="method-index hidden sm:flex" aria-label="אינדקס המחברת">
      <section>
        <div className="rail-heading">
          <h2>אינדקס</h2>
          <span>{journal.entries.length}</span>
        </div>
        <nav className="index-nav">
          {indexItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={actions[item.key]}
              className={view === item.key ? 'is-active' : undefined}
            >
              <span className="index-mark">{item.mark}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button type="button" onClick={onInbox} className={view === 'inbox' ? 'is-active' : undefined}>
            <span className="index-mark">→</span>
            <span>תיבת מעבר</span>
          </button>
        </nav>
      </section>

      <section className="index-collections">
        <div className="rail-heading">
          <h2>אוספים</h2>
          <span>{journal.collections.length}</span>
        </div>
        <CollectionsShelf
          journal={journal}
          selectedId={selectedCollectionId}
          onSelect={onSelectCollection}
          layout="list"
        />
      </section>

      <div className="method-key">
        <span>• משימה</span>
        <span>× הושלמה</span>
        <span>&gt; הועברה</span>
        <span>– הערה</span>
        <span>○ אירוע</span>
      </div>
    </aside>
  )
}
