import { upcomingAssessments } from './events'
import { computeStats } from './stats'
import { dateKey } from './dates'

// Compact planner summary sent to Planda so its answers are personalized. This
// exact string is what the real backend will forward to Claude as context.
export function buildPlannerContext(store) {
  const {
    profile = {},
    classes = [],
    assessments = [],
    items = [],
    sessions = [],
    focusLog = [],
    settings = {},
  } = store
  const upcoming = upcomingAssessments(assessments, classes).slice(0, 8)
  const stats = computeStats({ assessments, sessions, items, focusLog })
  const today = dateKey(new Date())
  const todayTasks = items
    .filter((i) => i.date === today && i.checkable && !i.completed)
    .slice(0, 8)

  const lines = []
  lines.push(
    `Student: ${profile.name || 'the student'}${profile.school ? ` at ${profile.school}` : ''}.`
  )
  lines.push(
    `Study streak: ${stats.streak} school-day(s). This week: ${stats.weeklyMinutes}/${settings.weeklyGoal || 0} focus min.`
  )
  lines.push(`Classes: ${classes.map((c) => c.name).join(', ') || '(none added yet)'}.`)
  if (upcoming.length) {
    lines.push('Upcoming assessments:')
    upcoming.forEach((a) => {
      const cls = classes.find((c) => c.id === a.classId)
      lines.push(`- ${a.title}${cls ? ` (${cls.name})` : ''}: ${a.type} due ${a.dueDate}`)
    })
  } else {
    lines.push('No upcoming assessments on the calendar.')
  }
  if (todayTasks.length) {
    lines.push("Today's unfinished tasks:")
    todayTasks.forEach((t) => lines.push(`- ${t.title}`))
  }
  return { text: lines.join('\n'), upcoming, stats, todayTasks }
}

// When VITE_AI_ENDPOINT is set (the deployed serverless proxy that holds the
// Anthropic key and verifies the user), Planda calls it for real. Until then it
// falls back to the offline rule-based brain, so the UX is identical either way.
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT

export async function askPlanda({ message, context, history = [], authToken, localBrain }) {
  if (AI_ENDPOINT) {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ message, context, history }),
    })
    if (!res.ok) throw new Error('Planda is unavailable right now.')
    const data = await res.json()
    return data.reply
  }
  // Offline mock: small delay so the typing indicator reads naturally.
  await new Promise((r) => setTimeout(r, 420))
  return localBrain(message)
}

export const aiConfigured = Boolean(AI_ENDPOINT)
