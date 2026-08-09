import { useMemo } from 'react'
import { Flame, Clock, CheckCircle2, BookOpen } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { computeStats } from '../../lib/stats'
import { format, parseKey } from '../../lib/dates'

function StatCard({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border pl-border pl-surface p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl pl-accent-soft pl-accent-text">
        {icon}
      </span>
      <div>
        <div className="text-2xl font-bold pl-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        <div className="text-xs pl-text-muted">{label}</div>
      </div>
    </div>
  )
}

export default function ProgressSection() {
  const { assessments, sessions, items, focusLog } = useStore()
  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )
  const hrs = Math.floor(stats.totalMinutes / 60)
  const mins = stats.totalMinutes % 60

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold pl-text">Your progress</h1>
      <p className="mb-6 text-sm pl-text-muted">
        Consistency beats cramming. Keep the streak alive.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Flame size={20} />} value={stats.streak} label="day streak" />
        <StatCard
          icon={<Clock size={20} />}
          value={hrs ? `${hrs}h ${mins}m` : `${mins}m`}
          label="studied"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={`${stats.sessionsDone}/${stats.sessionsTotal}`}
          label="sessions done"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          value={stats.upcomingCount}
          label="upcoming"
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold pl-text">Study plan progress</h2>
      {stats.readiness.length === 0 ? (
        <div className="rounded-2xl border pl-border pl-surface p-8 text-center text-sm pl-text-muted">
          No upcoming assessments yet. Add one and Planda will build a study plan
          you can work through here.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.readiness.map(({ assessment, pct, done, total, daysLeft }) => (
            <div key={assessment.id} className="rounded-2xl border pl-border pl-surface p-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div className="font-semibold pl-text">{assessment.title}</div>
                <div className="text-sm pl-text-muted">
                  {daysLeft <= 0 ? 'due today' : `${daysLeft} days left`} ·{' '}
                  {format(parseKey(assessment.dueDate), 'MMM d')}
                </div>
              </div>
              {total > 0 ? (
                <>
                  <div className="h-2.5 w-full overflow-hidden rounded-full pl-surface-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--planda-accent)' }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs pl-text-muted">
                    <span>{pct}% of study plan done</span>
                    <span>
                      {done}/{total} sessions
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs pl-text-muted">
                  {daysLeft <= 0
                    ? 'Due today, no study sessions were scheduled.'
                    : 'Due too soon for a lead-up study plan.'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
