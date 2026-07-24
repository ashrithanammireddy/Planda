import { useMemo, useState } from 'react'
import { Flame, Play, Send, Trophy } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { computeStats } from '../../lib/stats'
import { computeBadges, badgePointsFrom } from '../../lib/badges'
import { computePoints, rankFor } from '../../lib/ranks'
import { POD, FRIENDS, STATUS_LABEL, CHEERS } from '../../lib/friends'
import { useFocus } from '../../store/FocusContext'
import Avatar from '../Avatar'

const statusDot = {
  focusing: 'bg-emerald-500',
  break: 'bg-amber-400',
  offline: 'bg-slate-300',
}

export default function FriendsSection() {
  const { profile, assessments, sessions, items, focusLog } = useStore()
  const focus = useFocus()
  const [cheered, setCheered] = useState({})

  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )

  const myPoints = useMemo(
    () => computePoints({ stats, badgePoints: badgePointsFrom(computeBadges(stats)) }),
    [stats]
  )
  const me = {
    id: 'me',
    name: profile.name || 'You',
    avatar: profile.avatar || '🐼',
    glasses: profile.glasses,
    hat: profile.hat,
    streak: stats.streak,
    weeklyMinutes: stats.weeklyMinutes,
    points: myPoints,
    isMe: true,
  }

  const squadMinutes =
    FRIENDS.reduce((s, f) => s + f.weeklyMinutes, 0) + me.weeklyMinutes
  const goalPct = Math.min(
    100,
    Math.round((squadMinutes / POD.weeklyGoalMinutes) * 100)
  )

  const leaderboard = [...FRIENDS, me].sort(
    (a, b) => b.weeklyMinutes - a.weeklyMinutes
  )
  const focusingNow = FRIENDS.filter((f) => f.status === 'focusing')

  const cheer = (id) => {
    const msg = CHEERS[Math.floor((id.length + Date.now()) % CHEERS.length)]
    setCheered((c) => ({ ...c, [id]: msg }))
    setTimeout(() => setCheered((c) => ({ ...c, [id]: null })), 1800)
  }

  const medal = ['🥇', '🥈', '🥉']

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold pl-text">Study with friends</h1>
      </div>
      <p className="mb-6 text-sm pl-text-muted">
        Follow-through is easier together. Friends are simulated in this demo,
        real pods sync when you sign in.
      </p>

      {/* Focus Room hero — a light surface (lifted above the page background). */}
      <div className="mb-4 overflow-hidden rounded-3xl border pl-border pl-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold pl-text">Focus Room</div>
            <p className="mt-0.5 max-w-sm text-sm pl-text-muted">
              Start a timed session and study alongside your squad. Body-doubling
              makes it way easier to start.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm pl-text-muted">
              <div className="flex -space-x-2">
                {focusingNow.map((f) => (
                  <Avatar
                    key={f.id}
                    value={f.avatar}
                    size={28}
                    className="ring-2 ring-[var(--planda-surface)]"
                  />
                ))}
              </div>
              {focusingNow.length} focusing now
            </div>
          </div>
          <button
            type="button"
            onClick={() => focus.setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full pl-accent px-5 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110"
          >
            <Play size={16} />
            {focus.active ? 'Back to focus' : 'Start focus session'}
          </button>
        </div>
      </div>

      {/* Squad goal */}
      <div className="mb-4 rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-bold pl-text">{POD.name}</div>
            <div className="text-sm pl-text-muted">Weekly goal</div>
          </div>
          <div className="flex -space-x-2">
            <Avatar value={me.avatar} glasses={me.glasses} hat={me.hat} size={36} className="ring-2 ring-[var(--planda-surface)]" />
            {FRIENDS.map((f) => (
              <Avatar
                key={f.id}
                value={f.avatar}
                size={36}
                className="ring-2 ring-[var(--planda-surface)]"
              />
            ))}
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full pl-surface-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${goalPct}%`, backgroundColor: 'var(--planda-accent)' }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs pl-text-muted">
          <span>{squadMinutes} min this week</span>
          <span>{goalPct}% of {POD.weeklyGoalMinutes} min goal</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={18} className="pl-accent-text" />
          <h2 className="font-bold pl-text">This week's leaderboard</h2>
        </div>
        <div className="flex flex-col">
          {leaderboard.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                p.isMe ? 'pl-accent-soft' : ''
              }`}
            >
              <span className="w-6 text-center text-sm font-bold pl-text-muted">
                {medal[i] || i + 1}
              </span>
              <Avatar value={p.avatar} glasses={p.glasses} hat={p.hat} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold pl-text">
                  {p.name}
                  {p.isMe && (
                    <span className="rounded-full pl-accent-soft px-2 py-0.5 text-[10px] font-bold pl-accent-text">
                      YOU
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs pl-text-muted">
                  <span className="flex items-center gap-1 font-semibold">
                    {rankFor(p.points || 0).rank.emoji}
                    {rankFor(p.points || 0).rank.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={12} /> {p.streak}
                  </span>
                  {!p.isMe && (
                    <span className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${statusDot[p.status]}`} />
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="text-sm font-bold pl-text"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {p.weeklyMinutes}m
              </div>
              {!p.isMe &&
                (cheered[p.id] ? (
                  <span className="w-24 text-right text-xs font-semibold pl-accent-text">
                    {cheered[p.id]}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => cheer(p.id)}
                    title={`Nudge ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full pl-surface-2 pl-text-muted transition hover:pl-accent-text hover:brightness-95"
                  >
                    <Send size={15} />
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
