import { useEffect } from 'react'
import { X } from 'lucide-react'

// Centered modal dialog with a dimmed backdrop.
export default function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 planda-fade"
      onMouseDown={onClose}
    >
      <div
        className={`planda-pop max-h-[90vh] w-full overflow-y-auto rounded-3xl pl-surface p-6 shadow-2xl planda-scroll ${maxWidth}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, subtitle, icon, onClose }) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-xl font-bold pl-text">{title}</h2>
          {subtitle && <p className="text-sm pl-text-muted">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 pl-text-muted transition hover:pl-surface-2 hover:pl-text-muted"
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  )
}
