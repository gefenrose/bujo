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

export function SearchIcon({ className }: IconProps) {
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
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16.5 16.5l-4-4" />
    </svg>
  )
}

export function ChevronIcon({ className }: IconProps) {
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
      <path d="M6 8l4 4 4-4" />
    </svg>
  )
}

export function TagIcon({ className }: IconProps) {
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
      <path d="M10.5 3.5H5A1.5 1.5 0 0 0 3.5 5v5.5a1.5 1.5 0 0 0 .44 1.06l6 6a1.5 1.5 0 0 0 2.12 0l5.5-5.5a1.5 1.5 0 0 0 0-2.12l-6-6a1.5 1.5 0 0 0-1.06-.44Z" />
      <circle cx="7.25" cy="7.25" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SubtaskIcon({ className }: IconProps) {
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
      <path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9" />
      <path d="M3.8 5.5l.6.6 1-1.2M3.8 10l.6.6 1-1.2M3.8 14.5l.6.6 1-1.2" />
    </svg>
  )
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {[4, 10, 16].map((x) => (
        <circle key={x} cx={x} cy="10" r="1.3" />
      ))}
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}

export function InboxIcon({ className }: IconProps) {
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
      <path d="M4.2 11.5 5.6 4.8a1 1 0 0 1 1-.8h6.8a1 1 0 0 1 1 .8l1.4 6.7" />
      <path d="M3.3 11.5h3.9l1 1.7h3.6l1-1.7h3.9" />
      <rect x="3.3" y="11.5" width="13.4" height="4.2" rx="1" />
    </svg>
  )
}

export function ChartIcon({ className }: IconProps) {
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
      <path d="M4 16.5V9M10 16.5V3.5M16 16.5v-6" />
    </svg>
  )
}

export function RepeatIcon({ className }: IconProps) {
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
      <path d="M4.2 8a5.8 5.8 0 0 1 10.1-3.8M14.5 2.7v3.8h-3.8" />
      <path d="M15.8 12a5.8 5.8 0 0 1-10.1 3.8M5.5 17.3v-3.8h3.8" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
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
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
      <path d="M3.5 8.5h13M6.5 3v3M13.5 3v3" />
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
