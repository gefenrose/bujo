interface MoodStickerIconProps {
  level: number
  className?: string
}

const COLORS = ['#586b88', '#639eb8', '#c9972f', '#d9794f', '#dda614']

export function MoodStickerIcon({ level, className }: MoodStickerIconProps) {
  const color = COLORS[Math.max(0, Math.min(4, level - 1))]
  const mouth =
    level === 1
      ? 'M13 24 Q20 18 27 24'
      : level === 2
        ? 'M14 24 Q20 20 26 24'
        : level === 3
          ? 'M15 23 H25'
          : level === 4
            ? 'M14 22 Q20 28 26 22'
            : 'M13 21 Q20 29 27 21'

  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-hidden="true">
      {level === 5 && (
        <g stroke={color} strokeWidth="1.7" strokeLinecap="round">
          <path d="M20 1.8v4" /><path d="M20 34.2v4" />
          <path d="M1.8 20h4" /><path d="M34.2 20h4" />
          <path d="m7.1 7.1 2.8 2.8" /><path d="m30.1 30.1 2.8 2.8" />
          <path d="m32.9 7.1-2.8 2.8" /><path d="m9.9 30.1-2.8 2.8" />
        </g>
      )}
      <path
        d="M20 4.1c8.8-.5 15.4 6.7 15.7 15.2.4 8.7-6.7 15.8-15.4 16.2C11.5 36 4.5 29 4.3 20.2 4 11.7 11.2 4.6 20 4.1Z"
        fill="#fff8ea"
        stroke="#d6cbb8"
        strokeWidth="1.2"
      />
      <path
        d="M20 7.2c7.2-.3 12.5 5.4 12.8 12.3.3 7.1-5.4 12.7-12.5 13-7.2.3-12.7-5.3-12.9-12.4C7.2 13.2 12.9 7.5 20 7.2Z"
        fill={color}
      />

      {level === 1 && (
        <g>
          <path d="M9 11.8c1.1-2.5 5.4-3.3 7.2-.9 1.6-2.3 6.1-1.7 6.8 1.2 2.9-.5 5.1 2.7 3.3 5H9.5c-2.1-1.3-1.8-4 .5-5.3Z" fill="#edf0f2" stroke="#68758a" />
          <path d="m19 17-2.8 5h3l-1.4 4.4 5-6h-3.1l2-3.4Z" fill="#f0c34d" />
        </g>
      )}

      <g fill="#fff8ea">
        <circle cx="15" cy="18.5" r="1.35" />
        <circle cx="25" cy="18.5" r="1.35" />
      </g>
      <path d={mouth} fill="none" stroke="#fff8ea" strokeWidth="1.7" strokeLinecap="round" />

      {level === 2 && <path d="M27.2 20.3c2.5 3.1 2.4 5.2.1 5.2-2.4 0-2.5-2.1-.1-5.2Z" fill="#d8edf4" />}
      {level === 3 && (
        <g stroke="#fff8ea" strokeWidth="1.2" strokeLinecap="round">
          <path d="M11.8 15.7h5.2" /><path d="M23 15.7h5.2" />
        </g>
      )}
      {level === 4 && (
        <g>
          <circle cx="12.4" cy="22.3" r="1.5" fill="#eeb18e" />
          <circle cx="27.6" cy="22.3" r="1.5" fill="#eeb18e" />
          <path d="M29.5 9.5c3.2-.9 4.5 1.1 2.4 3.2-2.5 1.1-4.3-.8-2.4-3.2Z" fill="#71885e" />
        </g>
      )}
      {level === 5 && (
        <g fill="#fff8ea">
          <circle cx="12.4" cy="22" r="1.6" opacity=".65" />
          <circle cx="27.6" cy="22" r="1.6" opacity=".65" />
        </g>
      )}
    </svg>
  )
}
