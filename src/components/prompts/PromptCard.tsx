import { useState } from 'react'
import type { Prompt } from '../../types'
import { CloseIcon } from '../icons/Icons'

interface PromptCardProps {
  prompt: Prompt
  answer: string
  onChangeAnswer: (text: string) => void
  onDelete: () => void
}

export function PromptCard({ prompt, answer, onChangeAnswer, onDelete }: PromptCardProps) {
  const [draft, setDraft] = useState(answer)

  return (
    <div className="relative rounded-lg bg-ink/[0.03] p-3 dark:bg-inkdark/[0.04]">
      <button
        type="button"
        onClick={onDelete}
        title="מחיקת השאלה"
        className="absolute end-1.5 top-1.5 text-ink/20 hover:text-red-600 dark:text-inkdark/20 dark:hover:text-red-400"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
      <p className="pe-4 text-xs text-ink/50 dark:text-inkdark/50">{prompt.text}</p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== answer) onChangeAnswer(draft)
        }}
        placeholder="כתיבת תשובה…"
        rows={2}
        className="mt-1 w-full resize-none bg-transparent text-sm leading-snug text-ink outline-none placeholder:text-ink/25 dark:text-inkdark dark:placeholder:text-inkdark/25"
      />
    </div>
  )
}
