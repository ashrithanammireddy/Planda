import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { ITEM_CATEGORIES, ITEM_TYPES, PRIORITIES, categoryColor } from '../lib/constants'
import { dateKey } from '../lib/dates'
import { isValidColor } from '../lib/colors'

const field = 'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'
const label = 'mb-1.5 block text-sm font-semibold pl-text'

function emptyForm(initialDate) {
  return {
    title: '',
    description: '',
    date: dateKey(initialDate || new Date()),
    category: 'Personal',
    classId: '',
    priority: 'Medium',
    type: 'Task',
    customColor: '',
    checkable: true,
    timeBlock: { enabled: false, time: '09:00', durationMinutes: 60 },
  }
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'pl-accent' : 'bg-slate-300'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function ItemModal({ open, onClose, editing, initialDate }) {
  const { addItem, updateItem, deleteItem, classes } = useStore()
  const [form, setForm] = useState(emptyForm(initialDate))

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        title: editing.title || '',
        description: editing.description || '',
        date: editing.date,
        category: editing.category || 'Personal',
        classId: editing.classId || '',
        priority: editing.priority || 'Medium',
        type: editing.type || 'Task',
        customColor: editing.customColor || '',
        checkable: editing.checkable ?? true,
        timeBlock: {
          enabled: editing.timeBlock?.enabled ?? false,
          time: editing.timeBlock?.time || '09:00',
          durationMinutes: editing.timeBlock?.durationMinutes || 60,
        },
      })
    } else {
      setForm(emptyForm(initialDate))
    }
  }, [open, editing, initialDate])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setBlock = (key, value) =>
    setForm((f) => ({ ...f, timeBlock: { ...f.timeBlock, [key]: value } }))
  // Assigning a class colors the item to match that class.
  const setClass = (id) => {
    const c = classes.find((x) => x.id === id)
    setForm((f) => ({ ...f, classId: id, customColor: c ? c.color : '' }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      ...form,
      title: form.title.trim(),
      customColor: isValidColor(form.customColor) ? form.customColor : '',
      timeBlock: {
        ...form.timeBlock,
        durationMinutes: Number(form.timeBlock.durationMinutes) || 60,
      },
    }
    if (editing) updateItem(editing.id, payload)
    else addItem(payload)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={editing ? 'Edit Item' : 'New Item'} onClose={onClose} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className={label}>Title</label>
          <input
            autoFocus
            className={field}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="What do you need to do?"
          />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea
            rows={2}
            className={field}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Date</label>
            <input
              type="date"
              className={field}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Category</label>
            <select
              className={field}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {ITEM_CATEGORIES.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {form.category === 'School' && classes.length > 0 && (
          <div>
            <label className={label}>Class</label>
            <select
              className={field}
              value={form.classId}
              onChange={(e) => setClass(e.target.value)}
            >
              <option value="">No class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs pl-text-muted">Links this task to a class and uses its color.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Priority</label>
            <select
              className={field}
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Type</label>
            <select
              className={field}
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
            >
              {ITEM_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Custom Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={isValidColor(form.customColor) ? form.customColor : categoryColor(form.category)}
              onChange={(e) => set('customColor', e.target.value)}
              className="h-11 w-16 shrink-0 cursor-pointer rounded-xl border pl-border pl-surface p-1"
            />
            <input
              className={field}
              value={form.customColor}
              onChange={(e) => set('customColor', e.target.value)}
              placeholder="Uses category color"
            />
          </div>
          <p className="mt-1 text-xs pl-text-muted">Leave blank to use the category color</p>
        </div>

        <div className="flex items-center justify-between border-t pl-border pt-4">
          <div>
            <div className="text-sm font-semibold pl-text">Mark as checkable</div>
            <div className="text-xs pl-text-muted">Can be checked off when complete</div>
          </div>
          <Toggle checked={form.checkable} onChange={(v) => set('checkable', v)} />
        </div>

        <div className="flex items-center justify-between border-t pl-border pt-4">
          <div className="text-sm font-semibold pl-text">Add time block</div>
          <Toggle
            checked={form.timeBlock.enabled}
            onChange={(v) => setBlock('enabled', v)}
          />
        </div>

        {form.timeBlock.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Time</label>
              <input
                type="time"
                className={field}
                value={form.timeBlock.time}
                onChange={(e) => setBlock('time', e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Duration (minutes)</label>
              <input
                type="number"
                min="5"
                step="5"
                className={field}
                value={form.timeBlock.durationMinutes}
                onChange={(e) => setBlock('durationMinutes', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          {editing ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${editing.title || 'this'}"? This cannot be undone.`)) {
                  deleteItem(editing.id)
                  onClose()
                }
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
              className="rounded-xl pl-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              {editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
