interface StatTileProps {
  label: string
  value: string
  caption?: string
}

export function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <div className="rounded-lg border border-ink/10 px-4 py-3 dark:border-inkdark/10">
      <p className="text-xs text-ink/50 dark:text-inkdark/50">{label}</p>
      <p className="mt-1 text-[1.75rem] font-semibold leading-none tracking-tight text-ink dark:text-inkdark">
        {value}
      </p>
      {caption && <p className="mt-1.5 text-xs text-ink/40 dark:text-inkdark/40">{caption}</p>}
    </div>
  )
}
