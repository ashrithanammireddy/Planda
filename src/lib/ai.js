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

// Routing priority for Ask Planda:
//  1. VITE_AI_ENDPOINT  — deployed serverless proxy (holds the key, verifies the
//     user). This is the production path once the app is deployed.
//  2. VITE_GEMINI_API_KEY — calls Google Gemini's free tier directly from the
//     browser. LOCAL/DEMO ONLY: the key is bundled into the client, so only use
//     this while running on your own machine (never ship a public build with it).
//  3. otherwise — the offline rule-based brain (no network, no key).
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.0-flash'

const PERSONA =
  'You are Planda, a warm, encouraging study assistant (a friendly panda) inside a student planner app. ' +
  'Keep replies short and practical — a few sentences or a tight list. Use the student\'s planner context to ' +
  'personalize advice, but never invent assignments, grades, or dates that are not in the context. When asked ' +
  'to plan, give concrete, doable steps. Be supportive, never preachy.'

async function callGemini({ message, context, history }) {
  const contents = [
    ...history
      .filter((h) => h.role === 'user' || h.role === 'assistant')
      .map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ]
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PERSONA}\n\nStudent's current planner:\n${context}` }] },
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`)
  }
  const data = await res.json()
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "I'm not sure how to answer that yet — try rephrasing?"
  )
}

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
  if (GEMINI_KEY) {
    try {
      return await callGemini({ message, context, history })
    } catch (err) {
      // Never break the chat — fall back to the offline brain, but log why so
      // we can diagnose the real-AI path.
      console.warn('[Planda] Gemini call failed, using offline brain:', err?.message || err)
      return localBrain(message)
    }
  }
  // Offline mock: small delay so the typing indicator reads naturally.
  await new Promise((r) => setTimeout(r, 420))
  return localBrain(message)
}

export const aiConfigured = Boolean(AI_ENDPOINT || GEMINI_KEY)
