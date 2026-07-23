import { useMemo } from 'react'
import { Flame, Clock } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { computeStats } from '../../lib/stats'

const field = 'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'
const label = 'mb-1.5 block text-sm font-semibold pl-text'
const AVATARS = ['🐼', '🐨', '🦊', '🐱', '🐧', '🦉', '🐢', '🌱', '⭐', '🔥']

export default function ProfileSection() {
  const { profile, updateProfile, assessments, sessions, items, focusLog } =
    useStore()
  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )
  const hrs = Math.floor(stats.totalMinutes / 60)
  const mins = stats.totalMinutes % 60

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold pl-text">Profile</h1>

      <div className="mb-4 flex items-center gap-4 rounded-3xl border pl-border pl-surface p-5">
        <span className="flex h-20 w-20 items-center justify-center rounded-full pl-surface-2 text-5xl leading-none">
          {profile.avatar || '🐼'}
        </span>
        <div>
          <div className="text-xl font-bold pl-text">
            {profile.name || 'Your name'}
          </div>
          <div className="text-sm pl-text-muted">
            {profile.school || 'Add your school'}
          </div>
          <div className="mt-2 flex gap-4 text-sm pl-text-muted">
            <span className="inline-flex items-center gap-1">
              <Flame size={15} /> {stats.streak} day streak
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={15} /> {hrs ? `${hrs}h ${mins}m` : `${mins}m`} studied
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-4">
          <span className={label}>Avatar</span>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateProfile({ avatar: a })}
                style={
                  profile.avatar === a
                    ? { borderColor: 'var(--planda-accent)' }
                    : undefined
                }
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-2xl transition hover:pl-surface-2 ${
                  profile.avatar === a ? 'pl-accent-soft' : 'pl-border'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={label}>Name</label>
          <input
            className={field}
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            placeholder="What should we call you?"
          />
        </div>

        <div className="mb-2">
          <label className={label}>School</label>
          <input
            className={field}
            value={profile.school}
            onChange={(e) => updateProfile({ school: e.target.value })}
            placeholder="e.g. Lincoln High School"
          />
        </div>
      </div>

      <p className="mt-4 text-center text-xs pl-text-muted">
        Your profile and data are stored privately in this browser.
      </p>
    </div>
  )
}
