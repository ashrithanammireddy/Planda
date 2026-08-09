import { useMemo } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
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

const isCheckable = (it) =>
  it.kind === 'study' || (it.kind === 'item' && it.ref.checkable)

export default function WeekView({ date, onSelectItem, onSelectDay }) {
  const {
    assessments,
    sessions,
    classes,
    settings,
    items: userItems,
    toggleSession,
    toggleItem,
  } = useStore()
  const wso = weekStartsOnIndex(settings.weekStartsOn)
  const days = useMemo(() => weekDays(date, wso), [date, wso])
  const labels = weekdayLabels(wso)
  const today = new Date()
  const accent = accentColor(settings.backgroundColor)
  const accentBorder = accentColor(settings.backgroundColor, { alpha: 0.4 })

  const toggle = (item) =>
    item.kind === 'study'
      ? toggleSession(item.ref.id)
      : toggleItem(item.ref.id)

  return (
    <div className="grid grid-cols-1 gap-3 lg:h-full lg:grid-cols-7">
      {days.map((day, i) => {
        const isToday = isSameDay(day, today)
        const items = itemsForDate(day, {
          assessments,
          sessions,
          classes,
          settings,
          items: userItems,
        })
        const checkables = items.filter(isCheckable)
        const doneCount = checkables.filter((it) => it.completed).length

        return (
          <div key={day.toISOString()} className="flex min-h-0 flex-col lg:h-full">
            <div className="mb-2 flex items-center gap-2 lg:block lg:text-center">
              <div className="text-xs font-semibold tracking-wide pl-text-muted">
                {labels[i]}
              </div>
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="mx-auto mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold transition hover:pl-surface-2"
                style={isToday ? { backgroundColor: accent, color: '#fff' } : undefined}
              >
                <span className={isToday ? '' : 'pl-text'}>{format(day, 'd')}</span>
              </button>
            </div>

            <div
              onClick={() => onSelectDay(day)}
              style={isToday ? { borderColor: accentBorder } : undefined}
              className={`flex min-h-[52px] cursor-pointer flex-col gap-1.5 rounded-2xl border p-2 planda-scroll lg:min-h-0 lg:flex-1 lg:overflow-y-auto ${
                isToday ? 'pl-surface' : 'pl-border pl-surface hover:border-black/10'
              }`}
            >
              {items.map((item) =>
                isCheckable(item) ? (
                  <div key={item.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(item)
                      }}
                      aria-label="Toggle complete"
                      className={
                        item.completed ? 'text-emerald-500' : 'pl-text-muted'
                      }
                    >
                      {item.completed ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>
                    <div
                      className="min-w-0 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EventPill
                        item={item}
                        timeFormat={settings.timeFormat}
                        onClick={onSelectItem}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EventPill
                      item={item}
                      timeFormat={settings.timeFormat}
                      onClick={onSelectItem}
                    />
                  </div>
                )
              )}

              {checkables.length > 0 && (
                <div className="mt-auto flex items-center gap-1 px-1 pt-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 size={13} />
                  {doneCount}/{checkables.length} done
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
