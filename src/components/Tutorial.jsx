import { useEffect, useState } from 'react'
import {
  X, ChevronLeft, CalendarDays, Plus, BookOpen, GraduationCap,
  Users, Palette, Timer, Sparkles,
} from 'lucide-react'
import pandaBook from '../assets/planda-book.png'

// Flip-through feature walkthrough. Shown once on first launch (gated by
// settings.tourSeen) and replayable from Settings. Each page is a single,
// in-depth feature card. If a screenshot exists at public/tour/<img>.png it is
// shown; otherwise the page gracefully falls back to an icon (or the panda).
const PAGES = [
  {
    panda: true,
    title: 'Welcome to Planda',
    body: 'Your calmest semester starts here. Here is a quick tour of what Planda can do. You can skip anytime.',
  },
  {
    icon: CalendarDays,
    img: 'calendar',
    title: 'Your whole schedule, one place',
    body: 'Assignments, study sessions, and tasks all live on your calendar. Switch between Day, Week, Month, and Year from the top bar.',
  },
  {
    icon: Plus,
    img: 'add',
    title: 'Add anything with +',
    body: 'Tap the + button to add a test, quiz, homework, or a personal task. Give it a class and a due date and it lands on your calendar.',
  },
  {
    icon: BookOpen,
    img: 'study',
    title: 'Study plans, built for you',
    body: 'Add a test and Planda automatically spreads short study sessions across the days before it, so you review a little at a time instead of cramming. Check each one off as you go and your streak grows.',
  },
  {
    panda: true,
    img: 'ask-planda',
    title: 'Ask Planda anything',
    body: 'Tap the panda to chat. Ask things like "make a study plan for my bio test" or "what is due this week", and it helps right inside your planner.',
  },
  {
    icon: GraduationCap,
    img: 'grades',
    title: 'Track your grades',
    body: 'See your GPA and every class at a glance. Tap a class to add assignments, set category weights, try what-if scores, and find out exactly what you need on the final.',
  },
  {
    icon: Users,
    img: 'friends',
    title: 'Study with friends',
    body: 'Add friends with your friend code or invite link, then share a weekly goal, climb the leaderboard, and cheer each other on. You choose what you share: turn on "Keep my stats private" and friends see only your name and avatar.',
  },
  {
    icon: Palette,
    img: 'classes',
    title: 'Classes and calendars',
    body: 'Add your classes in Settings and give each one a color so your week is easy to read. You can add extra calendars too, like holiday sets, and show or hide any of them from the sidebar.',
  },
  {
    icon: Timer,
    img: 'focus',
    title: 'Focus Room, badges, and ranks',
    body: 'Start a focus session to study alongside friends, and earn badges and climb ranks as you build steady habits.',
  },
  {
    icon: Sparkles,
    title: 'You are all set',
    body: 'That is the tour. You can replay it anytime from Settings. You got this!',
  },
]

// Shows the best media that exists for a page, trying in order:
// looping video (.mp4) -> animated gif -> static screenshot (.png) -> icon.
// Each failed load falls through to the next, so slides upgrade as you add
// animations and never break when a file is missing.
function Illustration({ page }) {
  const [idx, setIdx] = useState(0)
  const Icon = page.icon
  const base = page.img ? `${import.meta.env.BASE_URL}tour/${page.img}` : null
  const sources = base
    ? [
        { type: 'video', src: `${base}.mp4` },
        { type: 'video', src: `${base}.mov` }, // Mac screen recordings, no convert
        { type: 'img', src: `${base}.gif` },
        { type: 'img', src: `${base}.png` },
      ]
    : []
  const cur = sources[idx]
  const onErr = () => setIdx((n) => n + 1)

  if (cur) {
    return (
      <div className="mb-1 w-full overflow-hidden rounded-2xl border pl-border pl-surface-2 shadow-sm">
        {cur.type === 'video' ? (
          <video
            src={cur.src}
            autoPlay
            loop
            muted
            playsInline
            className="mx-auto block max-h-[260px] w-full object-contain"
            onError={onErr}
          />
        ) : (
          <img
            src={cur.src}
            alt=""
            className="mx-auto block max-h-[260px] w-full object-contain"
            onError={onErr}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="mt-3 flex h-24 w-24 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--planda-accent-soft)' }}
    >
      {page.panda ? (
        <img src={pandaBook} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <Icon size={38} className="pl-accent-text" strokeWidth={1.8} />
      )}
    </div>
  )
}

export default function Tutorial({ open, onClose }) {
  const [i, setI] = useState(0)

  // Always start from the beginning each time it opens.
  useEffect(() => {
    if (open) setI(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(PAGES.length - 1, n + 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const page = PAGES[i]
  const first = i === 0
  const last = i === PAGES.length - 1
  const next = () => (last ? onClose() : setI(i + 1))

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 planda-fade"
      style={{ background: 'rgba(15, 23, 21, 0.5)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Planda tour"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl pl-surface p-7 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold pl-text-muted transition hover:pl-surface-2"
        >
          Skip <X size={13} />
        </button>

        <div key={i} className="flex flex-col items-center text-center planda-fade">
          <Illustration page={page} />

          <h2 className="mt-5 text-xl font-extrabold pl-text" style={{ textWrap: 'balance' }}>
            {page.title}
          </h2>
          <p className="mt-2 min-h-[96px] text-sm leading-relaxed pl-text-muted">
            {page.body}
          </p>
        </div>

        {/* Progress dots */}
        <div className="mt-2 flex justify-center gap-1.5">
          {PAGES.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Go to step ${n + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: n === i ? 20 : 6,
                backgroundColor: n === i ? 'var(--planda-accent)' : 'var(--planda-border)',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setI(Math.max(0, i - 1))}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold pl-text-muted transition hover:pl-surface-2 ${
              first ? 'pointer-events-none opacity-0' : ''
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <span className="text-xs font-medium pl-text-muted">
            {i + 1} of {PAGES.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-xl pl-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
          >
            {last ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
