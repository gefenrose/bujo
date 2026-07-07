interface MoodFaceIconProps {
  /** 1 (worst) .. 5 (best) */
  level: number
  className?: string
}

/** A single parametric line-art face: the mouth curve bends from a frown (1) to a smile (5). */
export function MoodFaceIcon({ level, className }: MoodFaceIconProps) {
  const curve = (level - 3) * 2.6

  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7" cy="8.5" r="1" fill="currentColor" />
      <circle cx="13" cy="8.5" r="1" fill="currentColor" />
      <path
        d={`M6.5,12.5 Q10,${(12.5 + curve).toFixed(2)} 13.5,12.5`}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
