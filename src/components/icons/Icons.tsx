interface IconProps {
  className?: string
}

export function GripIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {[6, 10, 14].map((y) =>
        [7, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />),
      )}
    </svg>
  )
}

export function StarIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 2.5l2.26 4.58 5.05.74-3.66 3.57.86 5.03L10 14l-4.51 2.42.86-5.03-3.66-3.57 5.05-.74z" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.75V10l3 2" />
    </svg>
  )
}

export function BellIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.7 1.2 4.7H3.8S5 11.5 5 8Z" />
      <path d="M8.2 15.5a1.9 1.9 0 0 0 3.6 0" />
    </svg>
  )
}
