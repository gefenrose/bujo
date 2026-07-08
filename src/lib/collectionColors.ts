const ROW_COLORS = [
  'text-blue-500 dark:text-blue-400',
  'text-rose-500 dark:text-rose-400',
  'text-emerald-500 dark:text-emerald-400',
  'text-amber-500 dark:text-amber-400',
  'text-violet-500 dark:text-violet-400',
]

const NEUTRAL_COLOR = 'text-ink/40 dark:text-inkdark/40'

/** Cycles through a small palette by index, or a single neutral color when auto-assign is turned off. */
export function rowColor(index: number, autoAssignColors: boolean): string {
  return autoAssignColors ? ROW_COLORS[index % ROW_COLORS.length] : NEUTRAL_COLOR
}
