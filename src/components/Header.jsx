import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { VIEWS } from '../lib/constants'
import { periodLabel, navigate, weekStartsOnIndex } from '../lib/dates'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

export default function Header({
  view,
  setView,
  date,
  setDate,
  weekStartsOn,
  onOpenAI,
  onOpenSettings,
}) {
  const wso = weekStartsOnIndex(weekStartsOn)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Brand (wordmark only) + View switcher */}
      <div className="flex items-center gap-4">
        <span
          role="img"
          aria-label="planda"
          style={{
            WebkitMaskImage: `url(${wordmarkUrl})`,
            maskImage: `url(${wordmarkUrl})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'left center',
            maskPosition: 'left center',
            backgroundColor: 'var(--planda-text)',
            width: '104px',
            height: '40px',
            display: 'inline-block',
          }}
        />
        <div className="inline-flex rounded-xl bg-black/5 p-1 backdrop-blur">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              view === v
                ? 'pl-surface pl-text shadow-sm'
                : 'pl-text-muted hover:pl-text'
            }`}
          >
            {v}
          </button>
        ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Today */}
        <button
          type="button"
          onClick={() => setDate(new Date())}
          className="inline-flex items-center gap-2 rounded-xl pl-surface px-3.5 py-2 text-sm font-medium pl-text shadow-sm transition hover:brightness-95"
        >
          <CalendarIcon size={16} />
          Today
        </button>

        {/* Period navigation */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-black/5 px-1 py-1">
          <button
            type="button"
            onClick={() => setDate(navigate(date, view, -1))}
            className="rounded-lg p-1.5 pl-text-muted transition hover:pl-surface hover:pl-text"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[150px] px-2 text-center text-sm font-semibold pl-text">
            {periodLabel(date, view, wso)}
          </span>
          <button
            type="button"
            onClick={() => setDate(navigate(date, view, 1))}
            className="rounded-lg p-1.5 pl-text-muted transition hover:pl-surface hover:pl-text"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Panda = the AI study assistant. Tap the panda to chat. */}
        <button
          type="button"
          onClick={onOpenAI}
          title="Ask Planda"
          className="group inline-flex items-center gap-2 rounded-full pl-surface py-1 pl-1 pr-3.5 shadow-sm transition hover:brightness-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full pl-surface-2 transition group-hover:scale-105">
            <PandaLogo size={30} />
          </span>
          <span className="text-sm font-semibold pl-accent-text">Ask Planda</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-xl p-2 pl-text-muted transition hover:pl-surface hover:pl-text"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
