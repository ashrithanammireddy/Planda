import { Plus, Circle, CheckCircle2 } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import { format, formatTime } from '../lib/dates'
import { readableText, tint } from '../lib/colors'

export default function DayDetailModal({
  open,
  day,
  onClose,
  onEditAssessment,
  onAddForDay,
}) {
  const { assessments, sessions, classes, settings, toggleSession, toggleTask } =
    useStore()

  if (!open || !day) return null

  const items = itemsForDate(day, { assessments, sessions, classes, settings })

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={format(day, 'EEEE, MMMM d')} onClose={onClose} />

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm pl-text-muted">
          Nothing scheduled for this day.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            if (item.kind === 'assessment') {
              const bg = tint(item.color, 0.4)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onEditAssessment(item.ref)}
                  style={{ backgroundColor: bg, color: readableText(bg) }}
                  className="rounded-2xl px-4 py-3 text-left font-medium transition hover:brightness-95"
                >
                  {item.emoji} {item.title}
                  <span className="ml-2 text-xs uppercase opacity-60">
                    {item.ref.type}
                  </span>
                </button>
              )
            }
            const s = item.ref
            return (
              <div
                key={item.id}
                className="rounded-2xl border pl-border p-3"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSession(s.id)}
                    className={s.completed ? 'text-emerald-500' : 'text-slate-300'}
                  >
                    {s.completed ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>
                  <div className="flex-1">
                    <div
                      className={`font-medium pl-text ${
                        s.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {s.emoji} {s.title}
                    </div>
                    <div className="text-xs pl-text-muted">
                      {formatTime(s.time, settings.timeFormat)} · {s.durationMinutes} min
                      {s.className ? ` · ${s.className}` : ''}
                    </div>
                    {s.tasks?.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {s.tasks.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTask(s.id, t.id)}
                            className="flex items-center gap-2 text-left text-sm pl-text-muted"
                          >
                            {t.done ? (
                              <CheckCircle2 size={15} className="text-emerald-500" />
                            ) : (
                              <Circle size={15} className="text-slate-300" />
                            )}
                            <span className={t.done ? 'line-through opacity-60' : ''}>
                              {t.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onAddForDay(day)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium pl-text-muted transition hover:border-blue-400 hover:text-blue-600"
      >
        <Plus size={16} />
        Add assessment for this day
      </button>
    </Modal>
  )
}
