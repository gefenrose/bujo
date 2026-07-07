import { useState } from 'react'
import type { Prompt } from '../../types'
import { CloseIcon } from '../icons/Icons'

interface PromptCardProps {
  prompt: Prompt
  answer: string
  onChangeAnswer: (text: string) => void
  onRenameQuestion: (text: string) => void
  onDelete: () => void
}

export function PromptCard({ prompt, answer, onChangeAnswer, onRenameQuestion, onDelete }: PromptCardProps) {
  const [draft, setDraft] = useState(answer)
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [questionDraft, setQuestionDraft] = useState(prompt.text)

  const commitQuestion = () => {
    setEditingQuestion(false)
    const trimmed = questionDraft.trim()
    if (trimmed && trimmed !== prompt.text) onRenameQuestion(trimmed)
    else setQuestionDraft(prompt.text)
  }

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

      {editingQuestion ? (
        <input
          autoFocus
          value={questionDraft}
          onChange={(e) => setQuestionDraft(e.target.value)}
          onBlur={commitQuestion}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitQuestion()
            if (e.key === 'Escape') {
              setQuestionDraft(prompt.text)
              setEditingQuestion(false)
            }
          }}
          className="w-full pe-4 bg-transparent text-xs text-ink/70 outline-none dark:text-inkdark/70"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingQuestion(true)}
          className="w-full pe-4 text-start text-xs text-ink/50 hover:text-ink/70 dark:text-inkdark/50 dark:hover:text-inkdark/70"
        >
          {prompt.text}
        </button>
      )}

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
