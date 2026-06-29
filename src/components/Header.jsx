import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
} from 'lucide-react'
import { VIEWS } from '../lib/constants'
import { periodLabel, navigate, weekStartsOnIndex } from '../lib/dates'

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
      {/* View switcher */}
      <div className="inline-flex rounded-xl bg-black/5 p-1 backdrop-blur">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              view === v
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Today */}
        <button
          type="button"
          onClick={() => setDate(new Date())}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white/90"
        >
          <CalendarIcon size={16} />
          Today
        </button>

        {/* Period navigation */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-black/5 px-1 py-1">
          <button
            type="button"
            onClick={() => setDate(navigate(date, view, -1))}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[150px] px-2 text-center text-sm font-semibold text-slate-800">
            {periodLabel(date, view, wso)}
          </span>
          <button
            type="button"
            onClick={() => setDate(navigate(date, view, 1))}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* AI Study Helper */}
        <button
          type="button"
          onClick={onOpenAI}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-white/90"
        >
          <Sparkles size={16} />
          AI Study Helper
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-white hover:text-slate-900"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  )
}
