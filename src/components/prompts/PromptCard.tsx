import { useEffect, useRef, useState } from 'react'
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
  const [focused, setFocused] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(false)
  const [questionDraft, setQuestionDraft] = useState(prompt.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const active = focused || draft.length > 0

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft, active])

  const commitQuestion = () => {
    setEditingQuestion(false)
    const trimmed = questionDraft.trim()
    if (trimmed && trimmed !== prompt.text) onRenameQuestion(trimmed)
    else setQuestionDraft(prompt.text)
  }

  return (
    <div className="relative flex flex-col gap-1">
      <button
        type="button"
        onClick={onDelete}
        title="מחיקת השאלה"
        className="absolute end-0 top-0 text-ink/40 hover:text-red-600 dark:text-inkdark/40 dark:hover:text-red-400"
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
          className={`w-full pe-4 bg-transparent text-ink/75 outline-none transition-all dark:text-inkdark/75 ${
            active ? 'text-xs' : 'text-sm'
          }`}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingQuestion(true)}
          className={`w-full pe-4 text-start text-ink/65 transition-all hover:text-ink/75 dark:text-inkdark/65 dark:hover:text-inkdark/75 ${
            active ? 'text-xs' : 'text-sm'
          }`}
        >
          {prompt.text}
        </button>
      )}

      <div className={active ? 'rounded-lg bg-ink/[0.03] p-3 dark:bg-inkdark/[0.04]' : ''}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (draft !== answer) onChangeAnswer(draft)
          }}
          placeholder="כתיבת תשובה…"
          rows={1}
          style={{ fontWeight: 'var(--content-font-weight)' }}
          className="block w-full resize-none overflow-hidden bg-transparent text-sm leading-snug text-ink outline-none placeholder:text-ink/45 dark:text-inkdark dark:placeholder:text-inkdark/45"
        />
      </div>
    </div>
  )
}
