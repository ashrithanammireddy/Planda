import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import {
  weekDays,
  weekdayLabels,
  weekStartsOnIndex,
  isSameDay,
  format,
} from '../lib/dates'
import EventPill from './EventPill'
import { accentColor } from '../lib/colors'

export default function WeekView({ date, onSelectItem, onSelectDay }) {
  const { assessments, sessions, classes, settings, items: userItems } = useStore()
  const wso = weekStartsOnIndex(settings.weekStartsOn)
  const days = useMemo(() => weekDays(date, wso), [date, wso])
  const labels = weekdayLabels(wso)
  const today = new Date()
  const accent = accentColor(settings.backgroundColor)
  const accentBorder = accentColor(settings.backgroundColor, { alpha: 0.4 })

  return (
    <div className="grid h-full grid-cols-7 gap-3">
      {days.map((day, i) => {
        const isToday = isSameDay(day, today)
        const items = itemsForDate(day, {
          assessments,
          sessions,
          classes,
          settings,
          items: userItems,
        })
        const studies = items.filter((it) => it.kind === 'study')
        const doneCount = studies.filter((s) => s.completed).length
        return (
          <div key={day.toISOString()} className="flex flex-col">
            <div className="mb-2 text-center">
              <div className="text-xs font-semibold tracking-wide pl-text-muted">
                {labels[i]}
              </div>
              <div className="flex justify-center">
                <span
                  style={isToday ? { backgroundColor: accent } : undefined}
                  className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold ${
                    isToday ? 'text-white' : 'pl-text'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              style={isToday ? { borderColor: accentBorder } : undefined}
              className={`flex min-h-[280px] flex-1 flex-col gap-1.5 rounded-2xl border p-2 text-left transition ${
                isToday
                  ? 'pl-surface'
                  : 'pl-border pl-surface hover:border-black/10'
              }`}
            >
              {items.map((item) => (
                <EventPill
                  key={item.id}
                  item={item}
                  timeFormat={settings.timeFormat}
                  onClick={onSelectItem}
                />
              ))}
              {studies.length > 0 && (
                <div className="mt-1 flex items-center gap-1 px-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 size={13} />
                  {doneCount}/{studies.length} tasks
                </div>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
