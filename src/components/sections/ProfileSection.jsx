import { useEffect, useMemo, useState } from 'react'
import { Flame, Clock, ChevronRight, Pin } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { computeStats } from '../../lib/stats'
import { computeBadges, badgePointsFrom } from '../../lib/badges'
import { computePoints, rankFor } from '../../lib/ranks'
import { AVATARS, GLASSES, HATS } from '../../lib/avatars'
import Avatar from '../Avatar'
import AnimalAvatar, { AccessoryIcon } from '../AnimalAvatar'
import MilestonesModal from '../MilestonesModal'
import RanksModal from '../RanksModal'
import BadgeMedal from '../Badge'

const HAT_LABEL = { none: 'None', beanie: 'Beanie', cap: 'Cap', bow: 'Bow', party: 'Party', crown: 'Crown' }
const GLASSES_LABEL = { none: 'None', round: 'Round', square: 'Square', sun: 'Shades' }

const field = 'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'
const label = 'mb-1.5 block text-sm font-semibold pl-text'

export default function ProfileSection() {
  const { profile, updateProfile, settings, assessments, sessions, items, focusLog } =
    useStore()
  const [milestonesOpen, setMilestonesOpen] = useState(false)
  const [ranksOpen, setRanksOpen] = useState(false)
  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )
  const badges = useMemo(() => computeBadges(stats), [stats])
  const points = useMemo(
    () => computePoints({ stats, badgePoints: badgePointsFrom(badges) }),
    [stats, badges]
  )
  const rankInfo = useMemo(() => rankFor(points), [points])
  const pinned = settings.pinnedBadges || []
  const pinnedBadges = pinned
    .map((id) => badges.find((b) => b.id === id))
    .filter(Boolean)
  const earnedCount = badges.filter((b) => b.earned).length
  const hrs = Math.floor(stats.totalMinutes / 60)
  const mins = stats.totalMinutes % 60

  // Edits are a draft — nothing is saved until "Update profile" is clicked.
  const [draft, setDraft] = useState({
    name: profile.name || '',
    school: profile.school || '',
    avatar: profile.avatar,
    glasses: profile.glasses || 'none',
    hat: profile.hat || 'none',
  })
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const dirty =
    draft.name !== (profile.name || '') ||
    draft.school !== (profile.school || '') ||
    draft.avatar !== profile.avatar ||
    draft.glasses !== (profile.glasses || 'none') ||
    draft.hat !== (profile.hat || 'none')
  const save = () => updateProfile(draft)
  const discard = () =>
    setDraft({
      name: profile.name || '',
      school: profile.school || '',
      avatar: profile.avatar,
      glasses: profile.glasses || 'none',
      hat: profile.hat || 'none',
    })

  // Warn before a hard reload / tab close if there are unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold pl-text">Profile</h1>

      <div className="mb-4 flex items-center gap-4 rounded-3xl border pl-border pl-surface p-5">
        <Avatar
          value={draft.avatar}
          glasses={draft.glasses}
          hat={draft.hat}
          size={80}
        />
        <div>
          <div className="text-xl font-bold pl-text">
            {draft.name || 'Your name'}
          </div>
          <div className="text-sm pl-text-muted">
            {draft.school || 'Add your school'}
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

      {/* Rank — tap to see the whole ladder */}
      <button
        type="button"
        onClick={() => setRanksOpen(true)}
        className="mb-4 w-full rounded-3xl border pl-border pl-surface p-5 text-left transition hover:pl-surface-2"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl pl-accent-soft text-2xl">
            {rankInfo.rank.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold pl-text">
                {rankInfo.rank.name}
                <ChevronRight size={16} className="pl-text-muted" />
              </span>
              <span className="text-sm font-semibold pl-text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {points.toLocaleString()} pts
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full pl-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${rankInfo.pct}%`, backgroundColor: 'var(--planda-accent)' }}
              />
            </div>
            <div className="mt-1 text-xs pl-text-muted">
              {rankInfo.next
                ? `${rankInfo.toNext} pts to ${rankInfo.next.emoji} ${rankInfo.next.name}`
                : 'Top rank reached 👑'}
            </div>
          </div>
        </div>
      </button>

      {/* Milestones trophy shelf */}
      <button
        type="button"
        onClick={() => setMilestonesOpen(true)}
        className="mb-4 w-full rounded-3xl border pl-border pl-surface p-5 text-left transition hover:pl-surface-2"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-bold pl-text">Milestones</span>
          <span className="flex items-center gap-1 text-sm pl-text-muted">
            {earnedCount} unlocked <ChevronRight size={16} />
          </span>
        </div>
        {pinnedBadges.length > 0 ? (
          <div className="flex gap-3">
            {pinnedBadges.map((b) => (
              <div
                key={b.id}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl pl-surface-2 p-3"
              >
                <BadgeMedal badge={b} size={46} />
                <span className="text-center text-xs font-semibold pl-text">{b.name}</span>
                <span className="text-[10px] pl-text-muted">{b.tierLabel}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm pl-text-muted">
            <Pin size={15} />
            {earnedCount > 0
              ? 'Pin your favorite badges here.'
              : 'Plan and study to unlock your first badge.'}
          </div>
        )}
      </button>

      <div className="rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-4">
          <span className={label}>Animal</span>
          <div className="grid grid-cols-6 gap-3 place-items-center sm:grid-cols-9">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => set({ avatar: a.id })}
                style={
                  draft.avatar === a.id
                    ? { outline: '2.5px solid var(--planda-accent)', outlineOffset: 2 }
                    : undefined
                }
                className="h-11 w-11 overflow-hidden rounded-full transition hover:-translate-y-0.5"
                aria-label={a.id}
              >
                <AnimalAvatar id={a.id} size={44} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className={label}>Glasses</span>
          <div className="flex flex-wrap gap-3">
            {GLASSES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set({ glasses: g })}
                title={GLASSES_LABEL[g]}
                style={
                  draft.glasses === g
                    ? { outline: '2.5px solid var(--planda-accent)', outlineOffset: 2 }
                    : undefined
                }
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full pl-surface-2 transition hover:-translate-y-0.5"
              >
                <AccessoryIcon kind="glasses" value={g} size={40} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className={label}>Headwear</span>
          <div className="flex flex-wrap gap-3">
            {HATS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => set({ hat: h })}
                title={HAT_LABEL[h]}
                style={
                  draft.hat === h
                    ? { outline: '2.5px solid var(--planda-accent)', outlineOffset: 2 }
                    : undefined
                }
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full pl-surface-2 transition hover:-translate-y-0.5"
              >
                <AccessoryIcon kind="hat" value={h} size={40} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={label}>Name</label>
          <input
            className={field}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="What should we call you?"
          />
        </div>

        <div className="mb-4">
          <label className={label}>School</label>
          <input
            className={field}
            value={draft.school}
            onChange={(e) => set({ school: e.target.value })}
            placeholder="e.g. Lincoln High School"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t pl-border pt-4">
          {dirty && (
            <>
              <span className="mr-auto text-xs pl-text-muted">Unsaved changes</span>
              <button
                type="button"
                onClick={discard}
                className="rounded-xl border pl-border px-4 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2"
              >
                Discard
              </button>
            </>
          )}
          <button
            type="button"
            disabled={!dirty}
            onClick={save}
            className="rounded-xl pl-accent px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
          >
            Update profile
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs pl-text-muted">
        Your profile and data are stored privately in this browser.
      </p>

      <MilestonesModal
        open={milestonesOpen}
        onClose={() => setMilestonesOpen(false)}
        badges={badges}
      />
      <RanksModal
        open={ranksOpen}
        onClose={() => setRanksOpen(false)}
        points={points}
        currentIndex={rankInfo.index}
      />
    </div>
  )
}
