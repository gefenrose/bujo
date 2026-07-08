import { CloseIcon } from './icons/Icons'

interface ImageLightboxProps {
  src: string
  onClose: () => void
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-4 text-paper/70 hover:text-paper"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
      <img src={src} alt="" className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}
