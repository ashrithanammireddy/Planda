import { LogIn, Download, Trash2, ShieldCheck, Settings, Sparkles, DownloadCloud } from 'lucide-react'
import { useStore } from '../../store/StoreContext'

function Row({ icon, title, desc, action }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border pl-border pl-surface p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl pl-surface-2 pl-text-muted">
          {icon}
        </span>
        <div>
          <div className="font-semibold pl-text">{title}</div>
          <div className="text-sm pl-text-muted">{desc}</div>
        </div>
      </div>
      {action}
    </div>
  )
}

export default function AccountSection({ onOpenSettings, onOpenImport }) {
  const store = useStore()
  const { profile, classes, assessments, sessions, items, settings, reset, loadSample } =
    store

  const exportData = () => {
    const data = { profile, classes, assessments, sessions, items, settings }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planda-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetData = () => {
    if (
      window.confirm(
        'Reset all Planda data on this device? This cannot be undone.'
      )
    ) {
      reset()
    }
  }

  const btn =
    'shrink-0 rounded-xl border pl-border px-3.5 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold pl-text">Account</h1>
      <p className="mb-6 text-sm pl-text-muted">
        Manage your sign-in, data, and privacy.
      </p>

      <div className="flex flex-col gap-3">
        <Row
          icon={<LogIn size={18} />}
          title="Sign in"
          desc="Sign in to sync your planner across devices."
          action={
            <span className="shrink-0 rounded-full pl-accent-soft px-3 py-1 text-xs font-semibold pl-accent-text">
              Coming soon
            </span>
          }
        />
        <Row
          icon={<ShieldCheck size={18} />}
          title="Data & privacy"
          desc="Your data is stored only in this browser. No account needed to use Planda."
        />
        <Row
          icon={<DownloadCloud size={18} />}
          title="Import from Canvas / Google Classroom"
          desc="Upload your class calendar (.ics) to auto-add assignments, plus holiday presets."
          action={
            <button type="button" onClick={onOpenImport} className={btn}>
              Import
            </button>
          }
        />
        <Row
          icon={<Sparkles size={18} />}
          title="Load sample data"
          desc="Fill Planda with example classes, assessments, and tasks to explore."
          action={
            <button type="button" onClick={loadSample} className={btn}>
              Load
            </button>
          }
        />
        <Row
          icon={<Download size={18} />}
          title="Export data"
          desc="Download a copy of your classes, assessments, and items as JSON."
          action={
            <button type="button" onClick={exportData} className={btn}>
              Export
            </button>
          }
        />
        <Row
          icon={<Settings size={18} />}
          title="Settings & theme"
          desc="Appearance, background color, classes, and more."
          action={
            <button type="button" onClick={onOpenSettings} className={btn}>
              Open
            </button>
          }
        />
        <Row
          icon={<Trash2 size={18} />}
          title="Reset data"
          desc="Clear everything and start fresh on this device."
          action={
            <button
              type="button"
              onClick={resetData}
              className="shrink-0 rounded-xl border border-red-300 px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              Reset
            </button>
          }
        />
      </div>
    </div>
  )
}
