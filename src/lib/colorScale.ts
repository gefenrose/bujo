/** Shared amber sequential ramp (0 = no activity .. 4 = highest), used by the activity heatmap and habit grid. */
export function amberLevelClass(level: number): string {
  const clamped = Math.max(0, Math.min(4, Math.round(level)))
  switch (clamped) {
    case 0:
      return 'bg-ink/[0.06] dark:bg-inkdark/[0.06]'
    case 1:
      return 'bg-amber-200 dark:bg-amber-950'
    case 2:
      return 'bg-amber-400 dark:bg-amber-800'
    case 3:
      return 'bg-amber-500 dark:bg-amber-600'
    default:
      return 'bg-amber-700 dark:bg-amber-400'
  }
}

/** Buckets a 0..1+ ratio (value / target) into a 0-4 level for the amber ramp. */
export function levelForRatio(ratio: number): number {
  if (ratio <= 0) return 0
  if (ratio < 0.34) return 1
  if (ratio < 0.67) return 2
  if (ratio < 1) return 3
  return 4
}
