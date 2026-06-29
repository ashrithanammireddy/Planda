import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { ASSESSMENT_TYPES, DIFFICULTIES } from '../lib/constants'
import { dateKey } from '../lib/dates'
import { isValidColor } from '../lib/colors'

const field =
  'w-full rounded-xl border pl-border pl-surface-2 px-3.5 py-2.5 text-sm pl-text outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
const label = 'mb-1.5 block text-sm font-semibold pl-text'

function emptyForm(initialDate) {
  return {
    classId: '',
    title: '',
    type: 'Test',
    dueDate: dateKey(initialDate || new Date()),
    difficulty: 'Medium',
    dailyStudyMinutes: 30,
    topics: [],
    notes: '',
    customColor: '',
  }
}

export default function AssessmentModal({ open, onClose, editing, initialDate }) {
  const { classes, addAssessment, updateAssessment, deleteAssessment } =
    useStore()
  const [form, setForm] = useState(emptyForm(initialDate))
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        classId: editing.classId || '',
        title: editing.title || '',
        type: editing.type || 'Test',
        dueDate: editing.dueDate,
        difficulty: editing.difficulty || 'Medium',
        dailyStudyMinutes: editing.dailyStudyMinutes || 30,
        topics: editing.topics || [],
        notes: editing.notes || '',
        customColor: editing.customColor || '',
      })
    } else {
      setForm(emptyForm(initialDate))
    }
    setTopicInput('')
  }, [open, editing, initialDate])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const addTopic = () => {
    const t = topicInput.trim()
    if (!t) return
    set('topics', [...form.topics, t])
    setTopicInput('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      ...form,
      title: form.title.trim(),
      classId: form.classId || null,
      dailyStudyMinutes: Number(form.dailyStudyMinutes) || 30,
      customColor: isValidColor(form.customColor) ? form.customColor : '',
    }
    if (editing) updateAssessment(editing.id, payload)
    else addAssessment(payload)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title={editing ? 'Edit Assessment' : 'New Assessment'}
        onClose={onClose}
      />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className={label}>Class (optional)</label>
          <select
            className={field}
            value={form.classId}
            onChange={(e) => set('classId', e.target.value)}
          >
            <option value="">No class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Title</label>
          <input
            autoFocus
            className={field}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. midterm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Type</label>
            <select
              className={field}
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Due Date</label>
            <input
              type="date"
              className={field}
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Difficulty</label>
            <select
              className={field}
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Daily Study (minutes)</label>
            <input
              type="number"
              min="5"
              step="5"
              className={field}
              value={form.dailyStudyMinutes}
              onChange={(e) => set('dailyStudyMinutes', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={label}>Topics to Study</label>
          <div className="flex gap-2">
            <input
              className={field}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTopic()
                }
              }}
              placeholder="Add a topic"
            />
            <button
              type="button"
              onClick={addTopic}
              className="shrink-0 rounded-xl border pl-border px-3 pl-text-muted transition hover:pl-surface-2"
            >
              <Plus size={18} />
            </button>
          </div>
          {form.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.topics.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full pl-surface-2 px-3 py-1 text-sm pl-text"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        'topics',
                        form.topics.filter((_, idx) => idx !== i)
                      )
                    }
                    className="pl-text-muted hover:pl-text-muted"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={label}>Notes</label>
          <textarea
            rows={2}
            className={field}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>

        <div>
          <label className={label}>Custom Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={isValidColor(form.customColor) ? form.customColor : '#ef4444'}
              onChange={(e) => set('customColor', e.target.value)}
              className="h-11 w-16 shrink-0 cursor-pointer rounded-xl border pl-border pl-surface p-1"
            />
            <input
              className={field}
              value={form.customColor}
              onChange={(e) => set('customColor', e.target.value)}
              placeholder="#ef4444 or color name"
            />
          </div>
          <p className="mt-1 text-xs pl-text-muted">
            Override default assessment color
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          {editing ? (
            <button
              type="button"
              onClick={() => {
                deleteAssessment(editing.id)
                onClose()
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border pl-border px-4 py-2 text-sm font-medium pl-text-muted transition hover:pl-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
