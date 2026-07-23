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
  onReflection: () => void
  onHabits: () => void
  onAnalytics: () => void
  onSelectCollection: (id: string) => void
}

const indexItems = [
  { key: 'daily', label: 'יומן יומי', mark: '•' },
  { key: 'monthly', label: 'יומן חודשי', mark: '31' },
  { key: 'yearly', label: 'יומן עתידי', mark: '12' },
  { key: 'weekly', label: 'סקירה שבועית', mark: '07' },
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
  onReflection,
  onHabits,
  onAnalytics,
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
            <span>תיבת קלט</span>
          </button>
          <button type="button" onClick={onReflection} className={view === 'reflection' ? 'is-active' : undefined}>
            <span className="index-mark">&gt;</span>
            <span>סקירה והעברה</span>
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

      <section className="index-reflection">
        <div className="rail-heading">
          <h2>השתקפות</h2>
        </div>
        <nav className="index-nav">
          <button type="button" onClick={onHabits} className={view === 'habits' ? 'is-active' : undefined}>
            <span className="index-mark">✓</span>
            <span>הרגלים</span>
          </button>
          <button type="button" onClick={onAnalytics} className={view === 'analytics' ? 'is-active' : undefined}>
            <span className="index-mark">↗</span>
            <span>תובנות</span>
          </button>
        </nav>
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
