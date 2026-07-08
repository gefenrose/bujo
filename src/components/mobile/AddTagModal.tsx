import { CloseIcon } from '../icons/Icons'

interface AddTagModalProps {
  availableTags: string[]
  onClose: () => void
  onPick: (tag: string) => void
}

export function AddTagModal({ availableTags, onClose, onPick }: AddTagModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-20 dark:bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-ink/10 bg-paper p-4 shadow-xl dark:border-inkdark/10 dark:bg-paperdark"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink dark:text-inkdark">הצמדת תגית</h2>
          <button type="button" onClick={onClose} className="text-ink/30 hover:text-ink dark:text-inkdark/30 dark:hover:text-inkdark">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {availableTags.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-inkdark/40">
            אין עדיין תגיות בשימוש — הוספת תגית לרשומה כלשהי תאפשר להצמיד אותה כאן לגישה מהירה.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onPick(tag)
                  onClose()
                }}
                className="rounded-full bg-ink/[0.05] px-2.5 py-1 text-sm text-ink/70 hover:bg-ink/10 hover:text-ink dark:bg-inkdark/[0.06] dark:text-inkdark/70 dark:hover:bg-inkdark/10 dark:hover:text-inkdark"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
