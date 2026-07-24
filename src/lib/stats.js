import { dateKey, startOfDay, addDays, differenceInCalendarDays } from './dates'

// Derives progress metrics from the store for the Progress section.
export function computeStats({
  assessments = [],
  sessions = [],
  items = [],
  focusLog = [],
}) {
  const completedSessions = sessions.filter((s) => s.completed)
  const focusMinutes = focusLog.reduce((sum, f) => sum + (f.minutes || 0), 0)
  const longestFocus = focusLog.reduce((m, f) => Math.max(m, f.minutes || 0), 0)
  const totalMinutes =
    completedSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) +
    focusMinutes

  // Set of day-keys on which anything was completed (session, item, or focus).
  const activeDays = new Set()
  for (const s of completedSessions) activeDays.add(s.date)
  for (const it of items) if (it.completed && it.checkable) activeDays.add(it.date)
  for (const f of focusLog) activeDays.add(f.date)

  // Minutes in the last 7 days (for the squad leaderboard).
  const weekAgo = dateKey(addDays(startOfDay(new Date()), -6))
  const weeklyMinutes =
    completedSessions
      .filter((s) => s.date >= weekAgo)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0) +
    focusLog.filter((f) => f.date >= weekAgo).reduce((s, f) => s + (f.minutes || 0), 0)

  // Current streak: consecutive days (ending today or yesterday) with activity.
  const today = startOfDay(new Date())
  let streak = 0
  // Allow the streak to still count if today has no activity yet but yesterday did.
  let anchor = activeDays.has(dateKey(today)) ? today : addDays(today, -1)
  if (activeDays.has(dateKey(anchor))) {
    let cursor = anchor
    while (activeDays.has(dateKey(cursor))) {
      streak += 1
      cursor = addDays(cursor, -1)
    }
  }

  const todayKey = dateKey(today)
  const upcoming = assessments
    .filter((a) => a.dueDate >= todayKey)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  // Exam-readiness per upcoming assessment = completed / total study sessions.
  const readiness = upcoming.map((a) => {
    const own = sessions.filter((s) => s.assessmentId === a.id)
    const done = own.filter((s) => s.completed).length
    const pct = own.length ? Math.round((done / own.length) * 100) : 0
    const daysLeft = differenceInCalendarDays(
      startOfDay(new Date(a.dueDate)),
      today
    )
    return { assessment: a, done, total: own.length, pct, daysLeft }
  })

  return {
    streak,
    totalMinutes,
    focusMinutes,
    longestFocus,
    weeklyMinutes,
    sessionsDone: completedSessions.length,
    sessionsTotal: sessions.length,
    itemsDone: items.filter((i) => i.completed && i.checkable).length,
    upcomingCount: upcoming.length,
    readiness,
    activeDayCount: activeDays.size,
  }
}
