import { useState } from 'react'
import { X, Play, Pause, Check, Trash2, Minimize2 } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useFocus } from '../store/FocusContext'
import { FRIENDS } from '../lib/friends'
import { useSocial } from '../store/SocialContext'
import PandaLogo from './PandaLogo'
import Avatar from './Avatar'

const PRESETS = [25, 45, 50]
const R = 92
const CIRC = 2 * Math.PI * R

// The focus modal. The timer itself lives in FocusContext so it survives closing
// this modal and switching sections. Here you set it up (class + duration) and
// control it (pause, minimize, end & log, cancel).
export default function FocusRoom() {
  const { profile, classes } = useStore()
  const focus = useFocus()
  const { open, active, running, done, minutes, left } = focus

  const [setMin, setSetMin] = useState(25)
  const [setCls, setSetCls] = useState('')

  const social = useSocial()
  const signedIn = social.enabled && social.signedIn
  const usingReal = signedIn && !!social.myCode
  // A signed-in account uses its real friends (never the demo squad); the demo
  // squad only appears for the signed-out preview.
  const sourceFriends = usingReal ? social.friends : signedIn ? [] : FRIENDS
  const roomFriends = sourceFriends.filter((f) => f.status === 'focusing').slice(0, 3)

  if (!open) return null

  const total = active ? minutes * 60 : setMin * 60
  const shown = active ? left : setMin * 60
  const progress = active ? 1 - left / (minutes * 60) : 0
  const mm = String(Math.floor(shown / 60)).padStart(2, '0')
  const ss = String(shown % 60).padStart(2, '0')
  const roster = roomFriends.map((f) => f.name).join(' & ')
  const activeClass = classes.find((c) => c.id === focus.classId)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 planda-fade"
      onMouseDown={() => focus.setOpen(false)}
    >
      <div
        className="planda-pop relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl pl-surface p-8 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => focus.setOpen(false)}
          aria-label={active ? 'Minimize' : 'Close'}
          className="absolute right-4 top-4 rounded-full p-1 pl-text-muted transition hover:pl-surface-2"
        >
          {active ? <Minimize2 size={19} /> : <X size={20} />}
        </button>

        <div className="mb-1 text-lg font-bold pl-text">Focus Room</div>
        <div className="mb-5 text-sm pl-text-muted">
          {done
            ? 'Session complete'
            : active && activeClass
              ? activeClass.name
              : roster
                ? `Studying with ${roster}`
                : 'Focus session'}
        </div>

        {/* Timer ring with the panda in the middle */}
        <div className="relative mb-6 flex h-56 w-56 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={R} fill="none" stroke="var(--planda-surface-2)" strokeWidth="12" />
            <circle
              cx="110" cy="110" r={R} fill="none"
              stroke="var(--planda-accent)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            {done ? <div className="text-5xl">🎉</div> : <PandaLogo size={64} className={running ? 'planda-breathe' : ''} />}
            <div className="mt-2 text-4xl font-bold pl-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {mm}:{ss}
            </div>
          </div>
        </div>

        {done ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-center text-sm pl-text-muted">
              Nice work, you focused <b className="pl-text">{minutes} min</b>
              {activeClass ? ` on ${activeClass.name}` : ''}. That counts toward your streak.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => focus.start({ minutes, classId: focus.classId })}
                className="rounded-xl border pl-border px-4 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2"
              >
                Go again
              </button>
              <button
                type="button"
                onClick={focus.dismissDone}
                className="rounded-xl pl-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        ) : active ? (
          /* Running / paused controls */
          <div className="flex w-full flex-col items-center gap-4">
            <button
              type="button"
              onClick={focus.togglePause}
              className="flex h-16 w-16 items-center justify-center rounded-full pl-accent text-white shadow-lg transition hover:brightness-110"
            >
              {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
            </button>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => focus.setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border pl-border px-4 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2"
              >
                <Minimize2 size={15} /> Keep running
              </button>
              <button
                type="button"
                onClick={focus.endAndLog}
                className="inline-flex items-center gap-1.5 rounded-xl pl-accent-soft px-4 py-2 text-sm font-semibold pl-accent-text transition hover:brightness-95"
              >
                <Check size={15} /> End &amp; log ({focus.elapsedMin}m)
              </button>
              <button
                type="button"
                onClick={focus.cancel}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={15} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Setup: choose class + duration */
          <div className="flex w-full flex-col gap-4">
            {classes.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold pl-text">For a class (optional)</label>
                <select
                  value={setCls}
                  onChange={(e) => setSetCls(e.target.value)}
                  className="pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm"
                >
                  <option value="">No specific class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold pl-text">How long?</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSetMin(p)}
                    style={p === setMin ? { borderColor: 'var(--planda-accent)' } : undefined}
                    className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition ${
                      p === setMin ? 'pl-accent-soft pl-accent-text' : 'pl-border pl-text-muted hover:pl-surface-2'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={setMin}
                    onChange={(e) => setSetMin(Math.max(1, Math.min(240, Number(e.target.value) || 0)))}
                    className="pl-field w-20 rounded-xl border px-3 py-1.5 text-sm"
                    aria-label="Custom minutes"
                  />
                  <span className="text-sm pl-text-muted">min</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={setMin < 1}
              onClick={() => focus.start({ minutes: setMin, classId: setCls || null })}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl pl-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
            >
              <Play size={16} /> Start focus session
            </button>
          </div>
        )}

        {/* Who's in the room */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex -space-x-2">
            <Avatar value={profile.avatar} glasses={profile.glasses} hat={profile.hat} size={32} className="ring-2 ring-[var(--planda-surface)]" />
            {roomFriends.map((f) => (
              <Avatar
                key={f.id}
                value={f.avatar}
                glasses={f.glasses}
                hat={f.hat}
                size={32}
                className="ring-2 ring-[var(--planda-surface)]"
              />
            ))}
          </div>
          <span className="text-xs pl-text-muted">{roomFriends.length + 1} studying now</span>
        </div>
      </div>
    </div>
  )
}
