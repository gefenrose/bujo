import { useState } from 'react'
import type { Journal } from '../../hooks/useJournal'
import { SUGGESTED_PROMPTS } from '../../lib/prompts'
import { PromptCard } from './PromptCard'

interface DailyPromptsProps {
  journal: Journal
  date: string
}

export function DailyPrompts({ journal, date }: DailyPromptsProps) {
  const [addingPrompt, setAddingPrompt] = useState(false)
  const [promptDraft, setPromptDraft] = useState('')

  const sortedPrompts = [...journal.prompts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const existingTexts = new Set(journal.prompts.map((p) => p.text))
  const suggestions = SUGGESTED_PROMPTS.filter((s) => !existingTexts.has(s))

  const commitPrompt = () => {
    const trimmed = promptDraft.trim()
    setAddingPrompt(false)
    setPromptDraft('')
    if (trimmed) journal.addPrompt(trimmed)
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        {sortedPrompts.map((prompt) => (
          <PromptCard
            key={`${prompt.id}:${date}`}
            prompt={prompt}
            answer={journal.promptResponses.find((r) => r.promptId === prompt.id && r.date === date)?.answer ?? ''}
            onChangeAnswer={(text) => journal.setPromptAnswer(prompt.id, date, text)}
            onRenameQuestion={(text) => journal.renamePrompt(prompt.id, text)}
            onDelete={() => journal.deletePrompt(prompt.id)}
          />
        ))}

        {addingPrompt ? (
          <div className="rounded-lg border border-dashed border-ink/20 p-3 sm:col-span-2 dark:border-inkdark/20">
            <input
              autoFocus
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              onBlur={commitPrompt}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitPrompt()
                if (e.key === 'Escape') {
                  setPromptDraft('')
                  setAddingPrompt(false)
                }
              }}
              placeholder="שאלה חדשה, או בחירה מההצעות למטה"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/30 dark:text-inkdark dark:placeholder:text-inkdark/30"
            />
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink/10 pt-3 dark:border-inkdark/10">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => journal.addPrompt(suggestion)}
                    className="rounded-full bg-ink/[0.05] px-2.5 py-1 text-xs text-ink/60 hover:bg-ink/10 hover:text-ink dark:bg-inkdark/[0.06] dark:text-inkdark/60 dark:hover:bg-inkdark/10 dark:hover:text-inkdark"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingPrompt(true)}
            className="rounded-lg border border-dashed border-ink/20 p-3 text-start text-sm text-ink/40 hover:border-ink/40 hover:text-ink dark:border-inkdark/20 dark:text-inkdark/40 dark:hover:border-inkdark/40 dark:hover:text-inkdark"
          >
            + שאלה חדשה
          </button>
        )}
      </div>
    </div>
  )
}
