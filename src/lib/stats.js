import { dateKey, startOfDay, addDays, differenceInCalendarDays } from './dates'
import { HOLIDAY_SETS } from './holidays'

const HOLIDAY_KEYS = new Set(Object.keys(HOLIDAY_SETS))

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

  // School-aware streak: weekends and holidays are skipped (they neither count
  // nor break the streak), and one missed school day is forgiven. So a Friday →
  // Monday run stays unbroken, which is realistic for students.
  const today = startOfDay(new Date())
  const holidayDates = new Set(
    items.filter((i) => HOLIDAY_KEYS.has(i.category)).map((i) => i.date)
  )
  const skippable = (d) => {
    const dow = d.getDay() // 0 Sun … 6 Sat
    return dow === 0 || dow === 6 || holidayDates.has(dateKey(d))
  }
  let streak = 0
  let grace = 1
  let cursor = today
  let isCurrentDay = true
  for (let guard = 0; guard < 800; guard++) {
    if (skippable(cursor)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (activeDays.has(dateKey(cursor))) {
      streak += 1
    } else if (isCurrentDay) {
      // Today isn't over yet, don't count it, but don't break the streak.
    } else if (grace > 0) {
      grace -= 1 // forgive one missed school day
    } else {
      break
    }
    isCurrentDay = false
    cursor = addDays(cursor, -1)
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
