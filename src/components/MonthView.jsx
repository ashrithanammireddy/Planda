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
import { accentColor } from '../lib/colors'

const MAX_PILLS = 3

export default function MonthView({ date, onSelectItem, onSelectDay }) {
  const { assessments, sessions, classes, settings, items: userItems } = useStore()
  const wso = weekStartsOnIndex(settings.weekStartsOn)
  const days = useMemo(() => monthGrid(date, wso), [date, wso])
  const labels = weekdayLabels(wso)
  const today = new Date()
  const accent = accentColor(settings.backgroundColor)
  const accentRing = accentColor(settings.backgroundColor, { alpha: 0.55 })

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-7">
        {labels.map((l) => (
          <div
            key={l}
            className="pb-2 text-center text-xs font-semibold tracking-wide pl-text-muted"
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
            items: userItems,
          })
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              style={isToday ? { boxShadow: `0 0 0 2px ${accentRing}` } : undefined}
              className={`flex min-h-[96px] flex-col gap-1 rounded-2xl border p-2 text-left transition ${
                inMonth
                  ? 'pl-border pl-surface hover:border-black/10'
                  : 'border-transparent pl-surface opacity-50 pl-text-muted'
              }`}
            >
              <span
                style={isToday ? { backgroundColor: accent } : undefined}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday
                    ? 'text-white'
                    : inMonth
                      ? 'pl-text'
                      : 'pl-text-muted'
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
                  <span className="px-1 text-[11px] font-medium pl-text-muted">
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
