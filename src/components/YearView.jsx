import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import {
  monthGrid,
  weekStartsOnIndex,
  weekdayLabels,
  isSameMonth,
  isSameDay,
  format,
} from '../lib/dates'
import { accentColor } from '../lib/colors'

function MiniMonth({ monthDate, wso, hasItems, onPick, accent }) {
  const days = monthGrid(monthDate, wso)
  const labels = weekdayLabels(wso).map((l) => l[0])
  const today = new Date()
  return (
    <button
      type="button"
      onClick={() => onPick(monthDate)}
      className="rounded-2xl border pl-border pl-surface p-3 text-left transition hover:border-black/10 hover:shadow-sm"
    >
      <div className="mb-2 text-sm font-bold pl-text">
        {format(monthDate, 'MMMM')}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10px] pl-text-muted">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center text-[11px]">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthDate)
          const isToday = isSameDay(day, today)
          const marked = inMonth && hasItems(day)
          return (
            <div
              key={day.toISOString()}
              style={isToday ? { backgroundColor: accent } : undefined}
              className={`relative mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
                isToday ? 'font-semibold text-white' : ''
              } ${
                inMonth
                  ? 'pl-text'
                  : 'text-slate-300'
              }`}
            >
              {format(day, 'd')}
              {marked && !isToday && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </div>
          )
        })}
      </div>
    </button>
  )
}

export default function YearView({ date, onPickMonth }) {
  const { assessments, sessions, classes, settings } = useStore()
  const wso = weekStartsOnIndex(settings.weekStartsOn)
  const accent = accentColor(settings.backgroundColor)

  const months = useMemo(
    () =>
      Array.from(
        { length: 12 },
        (_, i) => new Date(date.getFullYear(), i, 1)
      ),
    [date]
  )

  const hasItems = (day) =>
    itemsForDate(day, { assessments, sessions, classes, settings }).length > 0

  return (
    <div className="grid grid-cols-2 gap-3 overflow-y-auto planda-scroll md:grid-cols-3 lg:grid-cols-4">
      {months.map((m) => (
        <MiniMonth
          key={m.toISOString()}
          monthDate={m}
          wso={wso}
          hasItems={hasItems}
          onPick={onPickMonth}
          accent={accent}
        />
      ))}
    </div>
  )
}
