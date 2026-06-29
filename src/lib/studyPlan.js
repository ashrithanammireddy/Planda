import { addDays, startOfDay, differenceInCalendarDays } from 'date-fns'
import { dateKey, parseKey } from './dates'
import {
  DIFFICULTY_LEAD_DAYS,
  DEFAULT_STUDY_TIME,
  STUDY_SESSION_COLOR,
} from './constants'

// Builds the list of study sessions that lead up to an assessment's due date.
// Sessions start `leadDays` before the due date (or today, whichever is later)
// and run every day up to (but not including) the due date itself.
export function generateStudySessions(assessment, { classes = [] } = {}) {
  if (!assessment?.dueDate) return []

  const due = startOfDay(parseKey(assessment.dueDate))
  const today = startOfDay(new Date())
  const lead = DIFFICULTY_LEAD_DAYS[assessment.difficulty] ?? 10

  // Don't schedule in the past.
  let cursor = addDays(due, -lead)
  if (cursor < today) cursor = today

  const totalDays = differenceInCalendarDays(due, cursor)
  if (totalDays <= 0) return []

  const cls = classes.find((c) => c.id === assessment.classId)
  const color = assessment.customColor || STUDY_SESSION_COLOR
  const topics = assessment.topics?.length ? assessment.topics : []

  const sessions = []
  for (let i = 0; i < totalDays; i++) {
    const day = addDays(cursor, i)
    const key = dateKey(day)
    const topic = topics.length ? topics[i % topics.length] : null
    sessions.push({
      id: `study-${assessment.id}-${key}`,
      kind: 'study',
      assessmentId: assessment.id,
      classId: assessment.classId || null,
      className: cls?.name || null,
      title: topic ? `Study: ${topic}` : `Study: ${assessment.title}`,
      date: key,
      time: assessment.studyTime || DEFAULT_STUDY_TIME,
      durationMinutes: Number(assessment.dailyStudyMinutes) || 30,
      color,
      emoji: '📚',
      completed: false,
      tasks: topic ? [{ id: `${key}-t`, text: topic, done: false }] : [],
    })
  }
  return sessions
}
