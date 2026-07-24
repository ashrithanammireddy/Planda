import { Play, Pause } from 'lucide-react'
import PandaLogo from './PandaLogo'
import { useFocus } from '../store/FocusContext'

// Floating mini-timer shown when a focus session is running but the modal is
// closed. Tap it to reopen; the little button pauses/resumes without opening.
export default function FocusPill() {
  const f = useFocus()
  if (!f.active || f.open || f.done) return null
  const mm = String(Math.floor(f.left / 60)).padStart(2, '0')
  const ss = String(f.left % 60).padStart(2, '0')

  return (
    <div className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border pl-border pl-surface py-1.5 pl-2 pr-1.5 shadow-lg lg:bottom-6">
      <button
        type="button"
        onClick={() => f.setOpen(true)}
        className="flex items-center gap-2"
        title="Open focus room"
      >
        <PandaLogo size={26} className={f.running ? 'planda-breathe' : ''} />
        <span className="text-sm font-bold pl-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {mm}:{ss}
        </span>
      </button>
      <button
        type="button"
        onClick={f.togglePause}
        aria-label={f.running ? 'Pause' : 'Resume'}
        className="flex h-8 w-8 items-center justify-center rounded-full pl-accent text-white transition hover:brightness-110"
      >
        {f.running ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>
    </div>
  )
}
