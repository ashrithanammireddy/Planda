import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { FRIENDS } from '../lib/friends'
import PandaLogo from './PandaLogo'

const PRESETS = [25, 45, 50]
const R = 92
const CIRC = 2 * Math.PI * R

// A body-doubling "study together" room: a real focus timer with your panda
// and a couple of friends present. Completing a session logs focus minutes.
export default function FocusRoom({ open, onClose }) {
  const { profile, logFocus } = useStore()
  const [minutes, setMinutes] = useState(25)
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const tick = useRef(null)

  const roomFriends = FRIENDS.filter((f) => f.status === 'focusing').slice(0, 3)

  // Reset when opened or duration changes (while idle).
  useEffect(() => {
    if (!open) return
    setDone(false)
    setRunning(false)
    setLeft(minutes * 60)
  }, [open, minutes])

  useEffect(() => {
    if (!running) return
    tick.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(tick.current)
          setRunning(false)
          setDone(true)
          logFocus(minutes)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  if (!open) return null

  const total = minutes * 60
  const progress = 1 - left / total
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  const reset = () => {
    setRunning(false)
    setDone(false)
    setLeft(minutes * 60)
  }

  const roster = roomFriends.map((f) => f.name).join(' & ')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 planda-fade"
      onMouseDown={onClose}
    >
      <div
        className="planda-pop relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl pl-surface p-8 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 pl-text-muted transition hover:pl-surface-2"
        >
          <X size={20} />
        </button>

        <div className="mb-1 text-lg font-bold pl-text">Focus Room</div>
        <div className="mb-5 text-sm pl-text-muted">
          {done ? 'Session complete' : `Studying with ${roster || 'the squad'}`}
        </div>

        {/* Timer ring with the panda in the middle */}
        <div className="relative mb-6 flex h-56 w-56 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r={R}
              fill="none"
              stroke="var(--planda-surface-2)"
              strokeWidth="12"
            />
            <circle
              cx="110"
              cy="110"
              r={R}
              fill="none"
              stroke="var(--planda-accent)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            {done ? (
              <div className="text-5xl">🎉</div>
            ) : (
              <PandaLogo size={64} className={running ? 'planda-breathe' : ''} />
            )}
            <div
              className="mt-2 text-4xl font-bold pl-text"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {mm}:{ss}
            </div>
          </div>
        </div>

        {done ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-center text-sm pl-text-muted">
              Nice work, you focused <b className="pl-text">{minutes} min</b>
              {roster ? ` with ${roster}` : ''}. That counts toward your streak.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border pl-border px-4 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2"
              >
                Go again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl pl-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Duration presets (only while idle) */}
            {!running && left === total && (
              <div className="mb-5 flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMinutes(p)}
                    style={p === minutes ? { borderColor: 'var(--planda-accent)' } : undefined}
                    className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition ${
                      p === minutes
                        ? 'pl-accent-soft pl-accent-text'
                        : 'pl-border pl-text-muted hover:pl-surface-2'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="flex h-11 w-11 items-center justify-center rounded-full pl-surface-2 pl-text-muted transition hover:brightness-95"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="flex h-14 w-14 items-center justify-center rounded-full pl-accent text-white shadow-lg transition hover:brightness-110"
              >
                {running ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>
              <div className="h-11 w-11" />
            </div>
          </>
        )}

        {/* Who's in the room */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex -space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full pl-surface-2 ring-2 ring-[var(--planda-surface)] text-lg">
              {profile.avatar || '🐼'}
            </span>
            {roomFriends.map((f) => (
              <span
                key={f.id}
                title={f.name}
                className="flex h-8 w-8 items-center justify-center rounded-full pl-surface-2 text-lg ring-2 ring-[var(--planda-surface)]"
              >
                {f.avatar}
              </span>
            ))}
          </div>
          <span className="text-xs pl-text-muted">
            {roomFriends.length + 1} studying now
          </span>
        </div>
      </div>
    </div>
  )
}
