import { dateKey, startOfDay, parseKey } from './dates'
import { categoryColor } from './constants'

// Normalizes assessments + generated study sessions + user items into a single
// list of calendar entries for a given day, sorted by time (assessments first).
export function itemsForDate(
  day,
  { assessments, sessions, classes, settings, items: userItems = [] }
) {
  const key = typeof day === 'string' ? day : dateKey(day)
  const items = []

  for (const a of assessments) {
    if (a.dueDate !== key) continue
    const cls = classes.find((c) => c.id === a.classId)
    items.push({
      id: `assess-${a.id}`,
      kind: 'assessment',
      title: a.title,
      emoji: settings.assessmentEmojis?.[a.type] || '📌',
      color: a.customColor || cls?.color || '#e2e8f0',
      time: null,
      completed: false,
      ref: a,
    })
  }

  for (const s of sessions) {
    if (s.date !== key) continue
    if (!settings.showCompletedTasks && s.completed) continue
    items.push({
      id: s.id,
      kind: 'study',
      title: s.title,
      emoji: s.emoji,
      color: s.color,
      time: s.time,
      completed: s.completed,
      ref: s,
    })
  }

  for (const it of userItems) {
    if (it.date !== key) continue
    if (!settings.showCompletedTasks && it.completed) continue
    const timed = it.timeBlock?.enabled ? it.timeBlock.time : null
    items.push({
      id: it.id,
      kind: 'item',
      title: it.title,
      emoji: it.type === 'Event' ? '📌' : '',
      color: it.customColor || categoryColor(it.category),
      time: timed,
      completed: it.checkable ? it.completed : false,
      ref: it,
    })
  }

  // Assessments (no time) first, then study sessions ordered by time.
  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'assessment' ? -1 : 1
    return (a.time || '').localeCompare(b.time || '')
  })
  return items
}

// Future (and today's) assessments, soonest first, with day counts.
export function upcomingAssessments(assessments, classes) {
  const todayKey = dateKey(startOfDay(new Date()))
  return assessments
    .filter((a) => a.dueDate >= todayKey)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((a) => ({
      ...a,
      className: classes.find((c) => c.id === a.classId)?.name || null,
      classColor: classes.find((c) => c.id === a.classId)?.color || null,
    }))
}

export function assessmentDate(a) {
  return startOfDay(parseKey(a.dueDate))
}
