import { useState } from 'react'
import { Sun, Moon, Monitor, Plus, Pencil, Trash2, Check, X, Palette } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { VIEWS, ASSESSMENT_TYPES, CLASS_COLORS } from '../lib/constants'

const fieldCls =
  'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'
const sectionLabel = 'mb-2 block text-sm font-bold pl-text'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'pl-accent' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full pl-surface shadow transition ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

const APPEARANCES = [
  { id: 'Light', icon: Sun },
  { id: 'Dark', icon: Moon },
  { id: 'Auto', icon: Monitor },
]

export default function SettingsPanel({ open, onClose }) {
  const {
    settings,
    updateSettings,
    classes,
    addClass,
    updateClass,
    deleteClass,
  } = useStore()
  const [newClass, setNewClass] = useState('')
  const [newColor, setNewColor] = useState(CLASS_COLORS[2])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  if (!open) return null

  const set = (changes) => updateSettings(changes)

  const handleAddClass = () => {
    if (!newClass.trim()) return
    addClass(newClass.trim(), newColor)
    setNewClass('')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end planda-fade" onMouseDown={onClose}>
      <div
        className="planda-slide flex h-full w-full max-w-md flex-col overflow-y-auto pl-surface p-6 shadow-2xl planda-scroll"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={22} className="pl-text" />
            <h2 className="text-2xl font-bold pl-text">Settings &amp; Theme</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border pl-accent-border p-1 pl-accent-text transition hover:pl-accent-soft"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Appearance */}
        <div className="mb-6">
          <span className={sectionLabel}>Appearance</span>
          <div className="grid grid-cols-3 gap-3">
            {APPEARANCES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => set({ appearance: id })}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-4 text-sm font-medium transition ${
                  settings.appearance === id
                    ? 'pl-accent-border pl-accent-soft pl-accent-text'
                    : 'pl-border pl-text-muted hover:border-slate-300'
                }`}
              >
                <Icon size={20} />
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="mb-6">
          <span className={sectionLabel}>Background Color</span>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => set({ backgroundColor: e.target.value })}
              className="h-11 w-16 shrink-0 cursor-pointer rounded-xl border pl-border pl-surface p-1"
            />
            <input
              className={fieldCls}
              value={settings.backgroundColor}
              onChange={(e) => set({ backgroundColor: e.target.value })}
            />
          </div>
        </div>

        {/* Default view */}
        <div className="mb-5">
          <span className={sectionLabel}>Default View</span>
          <select
            className={fieldCls}
            value={settings.defaultView}
            onChange={(e) => set({ defaultView: e.target.value })}
          >
            {VIEWS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Time format */}
        <div className="mb-5">
          <span className={sectionLabel}>Time Format</span>
          <select
            className={fieldCls}
            value={settings.timeFormat}
            onChange={(e) => set({ timeFormat: e.target.value })}
          >
            <option value="12-hour">12-hour (AM/PM)</option>
            <option value="24-hour">24-hour</option>
          </select>
        </div>

        {/* Week starts on */}
        <div className="mb-5">
          <span className={sectionLabel}>Week Starts On</span>
          <select
            className={fieldCls}
            value={settings.weekStartsOn}
            onChange={(e) => set({ weekStartsOn: e.target.value })}
          >
            <option>Monday</option>
            <option>Sunday</option>
          </select>
        </div>

        {/* Show completed */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-bold pl-text">
            Show Completed Tasks
          </span>
          <Toggle
            checked={settings.showCompletedTasks}
            onChange={(v) => set({ showCompletedTasks: v })}
          />
        </div>

        {/* Manage classes */}
        <div className="mb-6 rounded-2xl border pl-border p-4">
          <span className={sectionLabel}>Manage Classes</span>
          <div className="mb-3 flex gap-2">
            <input
              className={fieldCls}
              placeholder="Class name"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border pl-border pl-surface p-1"
            />
            <button
              type="button"
              onClick={handleAddClass}
              className="shrink-0 rounded-xl pl-accent px-3 text-white transition hover:brightness-110"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {classes.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border pl-border px-3 py-2.5"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded"
                  style={{ backgroundColor: c.color }}
                />
                {editingId === c.id ? (
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border pl-border px-2 py-1 text-sm outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateClass(c.id, { name: editName.trim() || c.name })
                        setEditingId(null)
                      }
                    }}
                  />
                ) : (
                  <span className="flex-1 truncate text-sm font-medium pl-text">
                    {c.name}
                  </span>
                )}
                {editingId === c.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateClass(c.id, { name: editName.trim() || c.name })
                      setEditingId(null)
                    }}
                    className="text-emerald-500 hover:text-emerald-600"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c.id)
                      setEditName(c.name)
                    }}
                    className="pl-text-muted hover:pl-text-muted"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteClass(c.id)}
                  className="pl-text-muted hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment emojis */}
        <div className="mb-2">
          <span className={sectionLabel}>Assessment Emojis</span>
          <div className="grid grid-cols-2 gap-3">
            {ASSESSMENT_TYPES.map((type) => (
              <div key={type}>
                <label className="mb-1 block text-sm font-medium pl-text-muted">
                  {type}
                </label>
                <input
                  className={`${fieldCls} text-center text-lg`}
                  value={settings.assessmentEmojis?.[type] || ''}
                  onChange={(e) =>
                    set({
                      assessmentEmojis: {
                        ...settings.assessmentEmojis,
                        [type]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
