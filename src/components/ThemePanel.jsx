import { Sun, Moon, Monitor, Check, X, Palette } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { VIEWS, THEME_PRESETS } from '../lib/constants'

const fieldCls = 'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'
const sectionLabel = 'mb-2 block text-sm font-bold pl-text'

const APPEARANCES = [
  { id: 'Light', icon: Sun },
  { id: 'Dark', icon: Moon },
  { id: 'Auto', icon: Monitor },
]

// Theme / appearance panel (the palette stuff).
export default function ThemePanel({ open, onClose }) {
  const { settings, updateSettings } = useStore()
  if (!open) return null
  const set = (changes) => updateSettings(changes)

  return (
    <div className="fixed inset-0 z-50 flex justify-end planda-fade" onMouseDown={onClose}>
      <div
        className="planda-slide flex h-full w-full max-w-md flex-col overflow-y-auto pl-surface p-6 shadow-2xl planda-scroll"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={22} className="pl-text" />
            <h2 className="text-2xl font-bold pl-text">Theme</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border pl-accent-border p-1 pl-accent-text transition hover:pl-accent-soft"
            aria-label="Close"
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

        {/* Theme color */}
        <div className="mb-6">
          <span className={sectionLabel}>Theme Color</span>
          <div className="mb-3 flex flex-wrap gap-2">
            {THEME_PRESETS.map((p) => {
              const active =
                settings.backgroundColor.toLowerCase() === p.value.toLowerCase()
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => set({ backgroundColor: p.value })}
                  title={p.name}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 transition"
                  style={{
                    backgroundColor: p.value,
                    borderColor: active ? 'var(--planda-accent)' : 'var(--planda-border)',
                  }}
                >
                  {active && (
                    <Check
                      size={18}
                      className={p.name === 'Dark' ? 'text-white' : 'text-slate-700'}
                    />
                  )}
                </button>
              )
            })}
          </div>
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
              placeholder="Custom hex or color"
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
      </div>
    </div>
  )
}
