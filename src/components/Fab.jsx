import { useState } from 'react'
import { Plus, CheckSquare, BookOpen } from 'lucide-react'

// Floating action button (bottom-right). Tapping the + expands a small menu:
// "Add Item" and "Assessment".
export default function Fab({ onAddItem, onAddAssessment }) {
  const [open, setOpen] = useState(false)

  const choose = (fn) => {
    setOpen(false)
    fn()
  }

  const action = (label, Icon, onClick, delay) => (
    <div className="flex items-center justify-end gap-3">
      <span
        className="planda-pop rounded-full pl-surface px-4 py-2 text-sm font-semibold pl-text shadow-lg"
        style={{ animationDelay: delay }}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => choose(onClick)}
        aria-label={label}
        className="planda-pop flex h-12 w-12 items-center justify-center rounded-full pl-accent text-white shadow-lg transition hover:brightness-110 active:scale-95"
        style={{ animationDelay: delay }}
      >
        <Icon size={20} />
      </button>
    </div>
  )

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default"
        />
      )}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3 lg:bottom-10 lg:right-8">
        {open && (
          <>
            {action('Task / Homework', CheckSquare, onAddItem, '0ms')}
            {action('Test / Quiz', BookOpen, onAddAssessment, '40ms')}
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'New'}
          aria-expanded={open}
          style={{ backgroundColor: 'var(--planda-accent)' }}
          className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 hover:brightness-110 active:scale-95"
        >
          <Plus
            size={26}
            className="transition-transform duration-200"
            style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          />
        </button>
      </div>
    </>
  )
}
