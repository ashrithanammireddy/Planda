import { useMemo } from 'react'
import { CheckCircle2, Circle, Clock, ListChecks } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import { formatTime, format, isSameDay } from '../lib/dates'
import { readableText, accentColor } from '../lib/colors'

const HOURS = Array.from({ length: 24 }, (_, i) => i) // full day, scrollable

export default function DayView({ date, onSelectItem }) {
  const { assessments, sessions, classes, settings, toggleSession } = useStore()
  const items = useMemo(
    () => itemsForDate(date, { assessments, sessions, classes, settings }),
    [date, assessments, sessions, classes, settings]
  )
  const allDay = items.filter((it) => !it.time)
  const timed = items.filter((it) => it.time)
  const isToday = isSameDay(date, new Date())

  // Summary stats for the header card.
  const studyItems = timed.filter((it) => it.kind === 'study')
  const totalMinutes = studyItems.reduce(
    (sum, it) => sum + (it.ref.durationMinutes || 0),
    0
  )
  const doneCount = studyItems.filter((it) => it.completed).length

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const accent = accentColor(settings.backgroundColor)

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4">
      {/* Header / summary */}
      <div className="flex items-center justify-between gap-4 rounded-3xl pl-surface p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            style={isToday ? { backgroundColor: accent } : undefined}
            className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${
              isToday
                ? 'text-white'
                : 'pl-surface-2 pl-text'
            }`}
          >
            <span className="text-2xl font-bold leading-none">
              {format(date, 'd')}
            </span>
            <span className="text-[11px] font-medium uppercase opacity-80">
              {format(date, 'MMM')}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-lg font-bold pl-text">
              {format(date, 'EEEE')}
              {isToday && (
                <span
                  style={{
                    color: accent,
                    backgroundColor: accentColor(settings.backgroundColor, {
                      alpha: 0.18,
                    }),
                  }}
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                >
                  Today
                </span>
              )}
            </div>
            <div className="text-sm pl-text-muted">
              {format(date, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Stat icon={<Clock size={14} />} label="study" value={`${totalMinutes}m`} />
          <Stat
            icon={<ListChecks size={14} />}
            label="done"
            value={`${doneCount}/${studyItems.length}`}
          />
        </div>
      </div>

      {/* All-day assessments */}
      {allDay.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allDay.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              style={{ backgroundColor: item.color, color: readableText(item.color) }}
              className="rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:brightness-95"
            >
              {item.emoji} {item.title}
            </button>
          ))}
        </div>
      )}

      {/* Hourly agenda — full day, scrolls inside the card */}
      <div className="max-h-[calc(100vh-220px)] flex-1 overflow-y-auto rounded-3xl pl-surface shadow-sm planda-scroll">
        {HOURS.map((h) => {
            const hourItems = timed.filter(
              (it) => Number(it.time.split(':')[0]) === h
            )
            const showNow = isToday && now.getHours() === h
            return (
              <div
                key={h}
                className="relative flex min-h-[56px] gap-3 border-b pl-border px-4 py-2 last:border-b-0"
              >
                <div className="w-16 shrink-0 pt-0.5 text-right text-xs font-medium pl-text-muted">
                  {formatTime(`${String(h).padStart(2, '0')}:00`, settings.timeFormat)}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  {hourItems.map((item) => {
                    const s = item.ref
                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: item.color,
                          color: readableText(item.color),
                        }}
                        className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                          item.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSession(s.id)}
                          className="mt-0.5 shrink-0"
                          aria-label="Toggle complete"
                        >
                          {item.completed ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <Circle size={17} className="opacity-60" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectItem(item)}
                          className="flex-1 text-left"
                        >
                          <div className={`font-semibold ${item.completed ? 'line-through' : ''}`}>
                            {item.emoji} {item.title}
                          </div>
                          <div className="text-xs opacity-80">
                            {formatTime(item.time, settings.timeFormat)} ·{' '}
                            {s.durationMinutes} min
                            {s.className ? ` · ${s.className}` : ''}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Current-time indicator */}
                {showNow && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 flex items-center"
                    style={{ top: `${((nowMinutes - h * 60) / 60) * 100}%` }}
                  >
                    <span
                      className="ml-[72px] h-2 w-2 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: accentColor(settings.backgroundColor, { alpha: 0.7 }) }}
                    />
                  </div>
                )}
              </div>
            )
        })}
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center rounded-2xl pl-surface-2 px-4 py-2">
      <span className="flex items-center gap-1 text-sm font-bold pl-text">
        {icon}
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wide pl-text-muted">
        {label}
      </span>
    </div>
  )
}
