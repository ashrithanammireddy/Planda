import { Plus, Circle, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { itemsForDate } from '../lib/events'
import { format, formatTime } from '../lib/dates'
import { readableText, tint } from '../lib/colors'

// Small Edit + Delete action buttons shown on the right of each row.
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        aria-label="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-full pl-text-muted transition hover:pl-surface-2 hover:pl-text"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export default function DayDetailModal({
  open,
  day,
  onClose,
  onEditAssessment,
  onEditItem,
  onAddForDay,
}) {
  const {
    assessments,
    sessions,
    classes,
    settings,
    items: userItems,
    toggleSession,
    toggleTask,
    toggleItem,
    deleteItem,
    deleteAssessment,
  } = useStore()

  if (!open || !day) return null

  const items = itemsForDate(day, {
    assessments,
    sessions,
    classes,
    settings,
    items: userItems,
  })

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
                <div
                  key={item.id}
                  style={{ backgroundColor: bg, color: readableText(bg) }}
                  className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onEditAssessment(item.ref)}
                    className="flex-1 text-left font-medium"
                  >
                    {item.emoji} {item.title}
                    <span className="ml-2 text-xs uppercase opacity-60">{item.ref.type}</span>
                  </button>
                  <RowActions
                    onEdit={() => onEditAssessment(item.ref)}
                    onDelete={() =>
                      window.confirm(`Delete "${item.title}" and its study plan?`) &&
                      deleteAssessment(item.ref.id)
                    }
                  />
                </div>
              )
            }
            if (item.kind === 'item') {
              const it = item.ref
              return (
                <div key={item.id} className="flex items-start gap-2 rounded-2xl border pl-border p-3">
                  {it.checkable && (
                    <button
                      type="button"
                      onClick={() => toggleItem(it.id)}
                      className={it.completed ? 'text-emerald-500' : 'text-slate-300'}
                      aria-label="Toggle complete"
                    >
                      {it.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEditItem(it)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div
                      className={`font-medium pl-text ${
                        it.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {item.emoji} {it.title}
                    </div>
                    <div className="text-xs pl-text-muted">
                      {it.category}
                      {it.timeBlock?.enabled
                        ? ` · ${formatTime(it.timeBlock.time, settings.timeFormat)}`
                        : ''}
                      {it.priority ? ` · ${it.priority} priority` : ''}
                    </div>
                    {it.description && (
                      <div className="mt-1 text-sm pl-text-muted">{it.description}</div>
                    )}
                  </button>
                  <RowActions
                    onEdit={() => onEditItem(it)}
                    onDelete={() =>
                      window.confirm(`Delete "${it.title}"?`) && deleteItem(it.id)
                    }
                  />
                </div>
              )
            }
            const s = item.ref
            const parent = assessments.find((a) => a.id === s.assessmentId)
            return (
              <div key={item.id} className="flex items-start gap-2 rounded-2xl border pl-border p-3">
                <button
                  type="button"
                  onClick={() => toggleSession(s.id)}
                  className={s.completed ? 'text-emerald-500' : 'text-slate-300'}
                >
                  {s.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="min-w-0 flex-1">
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
                {parent && (
                  <RowActions
                    onEdit={() => onEditAssessment(parent)}
                    onDelete={() =>
                      window.confirm(`Delete "${parent.title}" and its study plan?`) &&
                      deleteAssessment(parent.id)
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onAddForDay(day)}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium pl-text-muted transition hover:pl-accent-border hover:pl-accent-text"
      >
        <Plus size={16} />
        Add item for this day
      </button>
    </Modal>
  )
}
