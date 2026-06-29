import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import {
  monthGrid,
  weekdayLabels,
  weekStartsOnIndex,
  isSameMonth,
  isSameDay,
  format,
} from '../lib/dates'
import EventPill from './EventPill'

const MAX_PILLS = 3

export default function MonthView({ date, onSelectItem, onSelectDay }) {
  const { assessments, sessions, classes, settings } = useStore()
  const wso = weekStartsOnIndex(settings.weekStartsOn)
  const days = useMemo(() => monthGrid(date, wso), [date, wso])
  const labels = weekdayLabels(wso)
  const today = new Date()

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7">
        {labels.map((l) => (
          <div
            key={l}
            className="pb-2 text-center text-xs font-semibold tracking-wide text-slate-500"
          >
            {l}
          </div>
        ))}
      </div>

      <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-2">
        {days.map((day) => {
          const inMonth = isSameMonth(day, date)
          const isToday = isSameDay(day, today)
          const items = itemsForDate(day, {
            assessments,
            sessions,
            classes,
            settings,
          })
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[96px] flex-col gap-1 rounded-2xl border p-2 text-left transition ${
                inMonth
                  ? 'border-black/5 bg-white hover:border-black/10'
                  : 'border-transparent bg-white/30 text-slate-400'
              } ${isToday ? 'ring-2 ring-rose-300/70' : ''}`}
            >
              <span
                className={`text-sm font-semibold ${
                  inMonth ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-1 overflow-hidden">
                {items.slice(0, MAX_PILLS).map((item) => (
                  <EventPill
                    key={item.id}
                    item={item}
                    timeFormat={settings.timeFormat}
                    onClick={onSelectItem}
                  />
                ))}
                {items.length > MAX_PILLS && (
                  <span className="px-1 text-[11px] font-medium text-slate-400">
                    +{items.length - MAX_PILLS} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
