import { useState } from 'react'
import { LogIn, Download, Trash2, ShieldCheck, Settings, Sparkles, DownloadCloud, UserX } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { firebaseEnabled, deleteAccountFirebase } from '../../lib/firebase'
import PrivacyModal from '../PrivacyModal'

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
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Permanently delete the account + all local data (App Store requirement).
  const deleteAccount = async () => {
    if (
      !window.confirm(
        'Delete your account and all Planda data? This permanently removes your sign-in and clears everything on this device. This cannot be undone.'
      )
    )
      return
    try {
      if (firebaseEnabled) await deleteAccountFirebase()
    } catch {
      // If Firebase needs a fresh login it signs you out; we still wipe locally.
    }
    ;['planda.authed', 'planda.onboarded', 'planda.section', 'planda.state.v1'].forEach(
      (k) => localStorage.removeItem(k)
    )
    window.location.reload()
  }

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
          title="Privacy Policy"
          desc="How Planda handles your data. Your data is never sold."
          action={
            <button type="button" onClick={() => setPrivacyOpen(true)} className={btn}>
              View
            </button>
          }
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
        {!settings.sampleLoaded && (
          <Row
            icon={<Sparkles size={18} />}
            title="Load sample data"
            desc="Add a few example items to explore. You can do this once."
            action={
              <button type="button" onClick={loadSample} className={btn}>
                Load
              </button>
            }
          />
        )}
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
        <Row
          icon={<UserX size={18} />}
          title="Delete account"
          desc="Permanently delete your account and all data. This cannot be undone."
          action={
            <button
              type="button"
              onClick={deleteAccount}
              className="shrink-0 rounded-xl bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Delete
            </button>
          }
        />
      </div>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  )
}
