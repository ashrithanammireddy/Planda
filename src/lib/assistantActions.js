import { dateKey } from './dates'

// Lightweight natural-language parser so Ask Planda can actually DO things
// (log a test/quiz/homework) offline, no API needed. Returns a structured
// action or null if the message isn't an add-command.

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const SUBJECTS = [
  'english', 'literature', 'math', 'calculus', 'algebra', 'geometry', 'statistics',
  'biology', 'chemistry', 'physics', 'science', 'history', 'government', 'economics',
  'psychology', 'spanish', 'french', 'latin', 'computer science', 'cs', 'art', 'music',
]
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

function parseDate(t) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const mk = (d) => dateKey(d)

  if (/\btoday\b/.test(t)) return mk(today)
  if (/\btomorrow\b/.test(t)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return mk(d)
  }
  const inN = t.match(/\bin (\d+)\s*days?\b/)
  if (inN) {
    const d = new Date(today)
    d.setDate(d.getDate() + Number(inN[1]))
    return mk(d)
  }
  // weekday, optionally "next"/"this"/"on"
  for (let i = 0; i < 7; i++) {
    const m = t.match(new RegExp(`\\b(next\\s+|this\\s+|on\\s+)?${WEEKDAYS[i]}\\b`))
    if (m) {
      const d = new Date(today)
      let delta = (i - d.getDay() + 7) % 7
      if (delta === 0) delta = 7 // upcoming, never today
      if (/next/.test(m[1] || '') && delta < 7) delta += 7 // "next" = the following week
      d.setDate(d.getDate() + delta)
      return mk(d)
    }
  }
  // explicit "jul 29" / "july 29" / "29th"
  const md = t.match(new RegExp(`\\b(${MONTHS.join('|')})[a-z]*\\s+(\\d{1,2})\\b`))
  if (md) {
    const mo = MONTHS.indexOf(md[1])
    const day = Number(md[2])
    const d = new Date(today.getFullYear(), mo, day)
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return mk(d)
  }
  // numeric 7/29 (slash only: hyphens like "ch 2-6" are chapter ranges)
  const num = t.match(/\b(\d{1,2})\/(\d{1,2})\b/)
  if (num) {
    const d = new Date(today.getFullYear(), Number(num[1]) - 1, Number(num[2]))
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return mk(d)
  }
  return null
}

function extractTitle(raw, { type, subject }) {
  let s = ` ${raw} `
    .replace(/\b(hey|hi|can you|can u|could you|would you|please|pls|for me)\b/gi, ' ')
    .replace(/\b(add|log|create|schedule|put|set up|set|make|new|remind me to|remind me)\b/gi, ' ')
    .replace(/\bit'?s? for [a-z]+\b/gi, ' ')
    .replace(/\bfor (my )?[a-z ]+? class\b/gi, ' ')
    .replace(/\bi have (an?|the)?\b/gi, ' ')
    .replace(/\bdue\b/gi, ' ')
    .replace(/\b(next|this|on)?\s*(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, ' ')
    .replace(new RegExp(`\\bin \\d+\\s*days?\\b`, 'gi'), ' ')
    .replace(new RegExp(`\\b(${MONTHS.join('|')})[a-z]*\\s+\\d{1,2}(st|nd|rd|th)?\\b`, 'gi'), ' ')
    .replace(/\b\d{1,2}\/\d{1,2}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Drop ONE leading command-object noun (e.g. "a test", "my quiz"), the thing
  // being created, but keep later mentions that are part of the real title.
  s = s.replace(/^(a|an|the|my)?\s*(assessments?|tests?|quiz(z?es)?|exams?|midterms?|finals?|homework|assignments?|essays?|projects?|papers?|readings?|tasks?|to-?dos?)\b/i, '').trim()
  s = s.replace(/^(for|my|a|an|the)\s+/i, '').trim()
  // Trim dangling prepositions/articles left at either end after date removal.
  s = s.replace(/\s+(on|for|due|by|at|to|of|the|a|an|my)$/i, '').trim()
  s = s.replace(/\s+(on|for|due|by|at|to|of|the|a|an|my)$/i, '').trim()
  if (!s || s.length < 3) {
    const noun = type === 'Task' ? 'homework' : type.toLowerCase()
    s = `${subject ? cap(subject) + ' ' : ''}${noun}`
  }
  return cap(s)
}

// Returns { kind, type, date, classId, category, title } | { needDate, ... } | null
export function parseAction(raw, { classes = [] } = {}) {
  const t = raw.toLowerCase()
  if (!/\b(add|log|create|schedule|put|set|make|new|remind)\b/.test(t)) return null

  let kind = null
  let type = null
  if (/\bquiz(z?es)?\b/.test(t)) { kind = 'assessment'; type = 'Quiz' }
  else if (/\b(test|midterm)\b/.test(t)) { kind = 'assessment'; type = 'Test' }
  else if (/\b(exam|final)\b/.test(t)) { kind = 'assessment'; type = 'Exam' }
  else if (/\bassessment\b/.test(t)) { kind = 'assessment'; type = 'Test' }
  else if (/\b(homework|assignment|essay|project|paper|reading|hw|task|to-?do)\b/.test(t)) {
    kind = 'item'
    type = 'Task'
  } else return null

  // Which class / subject?
  let classId = ''
  let category = 'School'
  for (const c of classes) {
    if (c.name && t.includes(c.name.toLowerCase())) {
      classId = c.id
      category = c.name
      break
    }
  }
  let subject = ''
  if (!classId) {
    subject = SUBJECTS.find((s) => new RegExp(`\\b${s}\\b`).test(t)) || ''
    if (subject) category = cap(subject === 'cs' ? 'Computer Science' : subject)
  }

  const date = parseDate(t)
  const title = extractTitle(raw, { type, subject })
  if (!date) return { needDate: true, kind, type, classId, category, title }
  return { kind, type, date, classId, category, title }
}
