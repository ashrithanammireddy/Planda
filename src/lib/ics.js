// Minimal iCalendar (.ics) parser, enough to pull assignments/events out of a
// Canvas / Google Classroom / Google Calendar feed. No dependencies.

function unescapeText(s) {
  return s
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim()
}

function icsDate(val) {
  const m = val.match(/(\d{4})(\d{2})(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

function icsTime(val) {
  const m = val.match(/T(\d{2})(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : null
}

function esc(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function addDayStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`
}

// Builds a downloadable .ics from Planda entries so they can be imported into
// Google Calendar / Apple Calendar / Outlook.
// entries: [{ uid, title, date:'YYYY-MM-DD', time:'HH:mm'|null, durationMinutes }]
export function buildICS(entries) {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planda//Study Planner//EN',
    'CALSCALE:GREGORIAN',
  ]
  for (const e of entries) {
    if (!e.date) continue
    const ymd = e.date.replace(/-/g, '')
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.uid}@planda`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`SUMMARY:${esc(e.title)}`)
    if (e.time) {
      const [h, m] = e.time.split(':')
      const dur = Math.max(15, Number(e.durationMinutes) || 60)
      const start = new Date(`${e.date}T${h}:${m}:00`)
      const end = new Date(start.getTime() + dur * 60000)
      const fmt = (d) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
          d.getDate()
        ).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(
          d.getMinutes()
        ).padStart(2, '0')}00`
      lines.push(`DTSTART:${fmt(start)}`)
      lines.push(`DTEND:${fmt(end)}`)
    } else {
      lines.push(`DTSTART;VALUE=DATE:${ymd}`)
      lines.push(`DTEND;VALUE=DATE:${addDayStr(e.date)}`)
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

// Returns [{ title, date: 'YYYY-MM-DD', time: 'HH:mm'|null, description }]
export function parseICS(text) {
  if (!text) return []
  // Unfold folded lines (continuation lines start with a space or tab).
  const unfolded = text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
  const lines = unfolded.split('\n')
  const events = []
  let cur = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === 'BEGIN:VEVENT') {
      cur = {}
    } else if (trimmed === 'END:VEVENT') {
      if (cur && cur.date && cur.title) events.push(cur)
      cur = null
    } else if (cur) {
      const idx = line.indexOf(':')
      if (idx < 0) continue
      const name = line.slice(0, idx).split(';')[0].toUpperCase()
      const val = line.slice(idx + 1)
      if (name === 'SUMMARY') cur.title = unescapeText(val)
      else if (name === 'DESCRIPTION') cur.description = unescapeText(val)
      else if (name === 'DTSTART') {
        cur.date = icsDate(val)
        cur.time = line.includes('VALUE=DATE') ? null : icsTime(val)
      }
    }
  }
  return events
}
