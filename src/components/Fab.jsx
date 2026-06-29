import { Plus } from 'lucide-react'

// Floating action button (bottom-right) — opens the New Assessment dialog.
export default function Fab({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="New assessment"
      style={{ backgroundColor: 'var(--planda-accent)' }}
      className="fixed bottom-7 right-7 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 hover:brightness-110 active:scale-95"
    >
      <Plus size={26} />
    </button>
  )
}
