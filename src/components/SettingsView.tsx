import { useState, type ReactNode } from 'react'
import type { EntryType } from '../types'
import type {
  EntryColorStyle,
  FontWeight,
  IconShape,
  ImageLayoutMode,
  TextSize,
  ThemeMode,
  TimeFormat,
} from '../lib/preferences'
import { parseTimeInput } from '../lib/date'
import { usePreferences } from '../hooks/usePreferences'
import { TimeField } from './TimeField'
import { ArrowRightIcon, CalendarIcon, TriangleIcon } from './icons/Icons'

interface SettingsViewProps {
  onClose: () => void
}

const TYPE_LABELS: Record<EntryType, string> = { task: 'משימה', note: 'הערה', event: 'אירוע' }
const SHAPE_OPTIONS: { shape: IconShape; label: string }[] = [
  { shape: 'square', label: 'ריבוע' },
  { shape: 'circle', label: 'עיגול' },
  { shape: 'triangle', label: 'משולש' },
  { shape: 'dot', label: 'נקודה' },
  { shape: 'dash', label: 'קו' },
  { shape: 'calendar', label: 'לוח שנה' },
]

function ShapePreview({ shape }: { shape: IconShape }) {
  const cls = 'h-3 w-3 text-ink dark:text-inkdark'
  switch (shape) {
    case 'square':
      return <span className={`block h-2.5 w-2.5 rounded-[2px] border border-current ${cls}`} />
    case 'circle':
      return <span className={`block h-2 w-2 rounded-full border border-current ${cls}`} />
    case 'triangle':
      return <TriangleIcon className={cls} />
    case 'dash':
      return <span className={`text-sm leading-none ${cls}`}>–</span>
    case 'calendar':
      return <CalendarIcon className={cls} />
    case 'dot':
    default:
      return <span className={`block h-2 w-2 rounded-full bg-current ${cls}`} />
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 py-5 first:pt-0 dark:border-inkdark/10">
      <h2 className="text-xs font-medium uppercase tracking-wide text-ink/40 dark:text-inkdark/40">{title}</h2>
      {children}
    </div>
  )
}

function SelectRow<T extends string>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-ink dark:text-inkdark">{label}</span>
        {description && <span className="text-xs text-ink/40 dark:text-inkdark/40">{description}</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="shrink-0 rounded-lg border border-ink/15 bg-transparent px-2 py-1 text-sm text-ink outline-none dark:border-inkdark/15 dark:text-inkdark [&>option]:bg-paper [&>option]:dark:bg-paperdark"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-ink dark:text-inkdark">{label}</span>
        {description && <span className="text-xs text-ink/40 dark:text-inkdark/40">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-amber-500 dark:bg-amber-400' : 'bg-ink/15 dark:bg-inkdark/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform dark:bg-paperdark ${
            checked ? 'translate-x-[-1.125rem] rtl:translate-x-[1.125rem]' : 'translate-x-[-0.125rem] rtl:translate-x-[0.125rem]'
          }`}
        />
      </button>
    </label>
  )
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const { preferences, updatePreferences } = usePreferences()
  const [dailyReminderDraft, setDailyReminderDraft] = useState(preferences.dailyReminderTime ?? '')
  const [minutesBeforeDraft, setMinutesBeforeDraft] = useState(
    preferences.reminderMinutesBefore != null ? String(preferences.reminderMinutesBefore) : '',
  )

  const commitDailyReminder = () => {
    const parsed = parseTimeInput(dailyReminderDraft)
    updatePreferences({ dailyReminderTime: parsed || null })
    setDailyReminderDraft(parsed)
  }

  const commitMinutesBefore = () => {
    const trimmed = minutesBeforeDraft.trim()
    const n = trimmed ? Math.max(0, Number(trimmed)) : NaN
    updatePreferences({ reminderMinutesBefore: Number.isFinite(n) ? n : null })
    setMinutesBeforeDraft(Number.isFinite(n) ? String(n) : '')
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3 sm:hidden">
        <button type="button" onClick={onClose} title="חזרה" className="text-ink/60 dark:text-inkdark/60">
          <ArrowRightIcon className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-medium tracking-tight text-ink dark:text-inkdark">העדפות</h1>
      </div>

      <Section title="תצוגה">
        <SelectRow<ThemeMode>
          label="מצב תצוגה"
          description="מצב מערכת עוקב אחרי הגדרות המכשיר"
          value={preferences.themeMode}
          onChange={(themeMode) => updatePreferences({ themeMode })}
          options={[
            { value: 'system', label: 'מערכת' },
            { value: 'light', label: 'בהיר' },
            { value: 'dark', label: 'כהה' },
          ]}
        />
        <SelectRow<TextSize>
          label="גודל טקסט"
          value={preferences.textSize}
          onChange={(textSize) => updatePreferences({ textSize })}
          options={[
            { value: 'small', label: 'קטן' },
            { value: 'medium', label: 'בינוני' },
            { value: 'large', label: 'גדול' },
          ]}
        />
        <SelectRow<FontWeight>
          label="עובי גופן"
          value={preferences.fontWeight}
          onChange={(fontWeight) => updatePreferences({ fontWeight })}
          options={[
            { value: 'light', label: 'קליל' },
            { value: 'regular', label: 'רגיל' },
            { value: 'bold', label: 'מודגש' },
          ]}
        />
        <SelectRow<EntryColorStyle>
          label="צבע רשומות"
          description="צבע מוקצה בהתאם לאוסף שהרשומה שייכת אליו"
          value={preferences.entryColorStyle}
          onChange={(entryColorStyle) => updatePreferences({ entryColorStyle })}
          options={[
            { value: 'none', label: 'ללא' },
            { value: 'icon', label: 'סמל בלבד' },
            { value: 'titleAndIcon', label: 'כותרת וסמל' },
          ]}
        />
      </Section>

      <Section title="סמל לפי סוג רשומה">
        {(['task', 'event', 'note'] as EntryType[]).map((type) => (
          <div key={type} className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink dark:text-inkdark">{TYPE_LABELS[type]}</span>
            <div className="flex items-center gap-1 rounded-full border border-ink/10 p-0.5 dark:border-inkdark/10">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.shape}
                  type="button"
                  title={opt.label}
                  onClick={() =>
                    updatePreferences({ entryIcons: { ...preferences.entryIcons, [type]: opt.shape } })
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    preferences.entryIcons[type] === opt.shape
                      ? 'bg-ink/[0.08] dark:bg-inkdark/[0.1]'
                      : ''
                  }`}
                >
                  <ShapePreview shape={opt.shape} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="ברירות מחדל">
        <SelectRow<EntryType>
          label="סוג רשומה ברירת מחדל"
          value={preferences.defaultEntryType}
          onChange={(defaultEntryType) => updatePreferences({ defaultEntryType })}
          options={[
            { value: 'task', label: 'משימה' },
            { value: 'event', label: 'אירוע' },
            { value: 'note', label: 'הערה' },
          ]}
        />
        <SelectRow<'0' | '1'>
          label="תחילת השבוע"
          value={String(preferences.startOfWeek) as '0' | '1'}
          onChange={(v) => updatePreferences({ startOfWeek: Number(v) as 0 | 1 })}
          options={[
            { value: '0', label: 'ראשון' },
            { value: '1', label: 'שני' },
          ]}
        />
        <SelectRow<TimeFormat>
          label="פורמט שעה"
          value={preferences.timeFormat}
          onChange={(timeFormat) => updatePreferences({ timeFormat })}
          options={[
            { value: '24h', label: '24 שעות' },
            { value: '12h', label: '12 שעות' },
          ]}
        />
        <ToggleRow
          label="הצגת מספר משימות פתוחות"
          description="תג מספר בכרטיסיית 'יום'"
          checked={preferences.showIncompleteCount}
          onChange={(showIncompleteCount) => updatePreferences({ showIncompleteCount })}
        />
        <ToggleRow
          label="הקצאת צבעים אוטומטית"
          description="צבע יוקצה אוטומטית לאוספים, מסננים ותגיות מוצמדות"
          checked={preferences.autoAssignColors}
          onChange={(autoAssignColors) => updatePreferences({ autoAssignColors })}
        />
        <ToggleRow
          label="הצגת תת-משימות כברירת מחדל"
          checked={preferences.showSubtasksByDefault}
          onChange={(showSubtasksByDefault) => updatePreferences({ showSubtasksByDefault })}
        />
      </Section>

      <Section title="הצגת תמונות">
        {(['task', 'event', 'note'] as EntryType[]).map((type) => (
          <SelectRow<ImageLayoutMode>
            key={type}
            label={TYPE_LABELS[type]}
            value={preferences.imageLayout[type]}
            onChange={(mode) => updatePreferences({ imageLayout: { ...preferences.imageLayout, [type]: mode } })}
            options={[
              { value: 'hidden', label: 'מוסתר' },
              { value: 'thumbnails', label: 'תמונות ממוזערות' },
            ]}
          />
        ))}
      </Section>

      <Section title="תזכורות">
        <div className="flex items-center justify-between gap-4">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-ink dark:text-inkdark">תזכורת יומית</span>
            <span className="text-xs text-ink/40 dark:text-inkdark/40">להשאיר ריק כדי לכבות</span>
          </span>
          <TimeField
            value={dailyReminderDraft}
            onChange={setDailyReminderDraft}
            onEnter={commitDailyReminder}
            className="w-16 shrink-0 rounded-lg border border-ink/15 bg-transparent px-2 py-1 text-sm text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-ink dark:text-inkdark">דקות לפני מועד</span>
            <span className="text-xs text-ink/40 dark:text-inkdark/40">להשאיר ריק כדי לקבל תזכורת בשעה המדויקת</span>
          </span>
          <input
            type="number"
            min={0}
            value={minutesBeforeDraft}
            onChange={(e) => setMinutesBeforeDraft(e.target.value)}
            onBlur={commitMinutesBefore}
            onKeyDown={(e) => e.key === 'Enter' && commitMinutesBefore()}
            className="w-16 shrink-0 rounded-lg border border-ink/15 bg-transparent px-2 py-1 text-sm text-ink outline-none dark:border-inkdark/15 dark:text-inkdark"
          />
        </div>
      </Section>
    </div>
  )
}
