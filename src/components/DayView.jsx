import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import { formatTime, format, isSameDay } from '../lib/dates'
import { readableText } from '../lib/colors'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM – 10 PM

export default function DayView({ date, onSelectItem }) {
  const { assessments, sessions, classes, settings } = useStore()
  const items = useMemo(
    () => itemsForDate(date, { assessments, sessions, classes, settings }),
    [date, assessments, sessions, classes, settings]
  )
  const allDay = items.filter((it) => !it.time)
  const timed = items.filter((it) => it.time)
  const isToday = isSameDay(date, new Date())

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-3">
      {allDay.length > 0 && (
        <div className="rounded-2xl border border-black/5 bg-white p-3">
          <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
            ALL DAY
          </div>
          <div className="flex flex-wrap gap-2">
            {allDay.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                style={{ backgroundColor: item.color, color: readableText(item.color) }}
                className="rounded-lg px-2.5 py-1 text-sm font-medium"
              >
                {item.emoji} {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto rounded-2xl border border-black/5 bg-white planda-scroll">
        {HOURS.map((h) => {
          const hourItems = timed.filter(
            (it) => Number(it.time.split(':')[0]) === h
          )
          return (
            <div key={h} className="flex gap-3 border-b border-black/5 px-4 py-2 last:border-b-0">
              <div className="w-16 shrink-0 pt-0.5 text-right text-xs font-medium text-slate-400">
                {formatTime(`${String(h).padStart(2, '0')}:00`, settings.timeFormat)}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {hourItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item)}
                    style={{
                      backgroundColor: item.color,
                      color: readableText(item.color),
                    }}
                    className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:brightness-95 ${
                      item.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {formatTime(item.time, settings.timeFormat)} · {item.emoji}{' '}
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center text-xs text-slate-500">
        {format(date, 'EEEE, MMMM d')} {isToday && '· Today'}
      </div>
    </div>
  )
}
