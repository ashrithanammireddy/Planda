import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  addMonths,
  addWeeks,
  addDays,
  addYears,
  isSameDay,
  isSameMonth,
  differenceInCalendarDays,
} from 'date-fns'

// A YYYY-MM-DD key used everywhere we store / compare dates.
export function dateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

export function parseKey(key) {
  return parseISO(key)
}

export function weekStartsOnIndex(setting) {
  return setting === 'Sunday' ? 0 : 1
}

// Returns the 6-week (42 cell) grid for a month, padded with leading/trailing days.
export function monthGrid(date, weekStartsOn) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function weekDays(date, weekStartsOn) {
  const start = startOfWeek(date, { weekStartsOn })
  return eachDayOfInterval({ start, end: endOfWeek(date, { weekStartsOn }) })
}

export function weekdayLabels(weekStartsOn) {
  const base = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return [...base.slice(weekStartsOn), ...base.slice(0, weekStartsOn)]
}

export function navigate(date, view, dir) {
  switch (view) {
    case 'Day':
      return addDays(date, dir)
    case 'Week':
      return addWeeks(date, dir)
    case 'Year':
      return addYears(date, dir)
    case 'Month':
    default:
      return addMonths(date, dir)
  }
}

export function periodLabel(date, view, weekStartsOn) {
  switch (view) {
    case 'Day':
      return format(date, 'EEEE, MMMM d, yyyy')
    case 'Week': {
      const days = weekDays(date, weekStartsOn)
      const a = days[0]
      const b = days[6]
      const sameYear = a.getFullYear() === b.getFullYear()
      return `${format(a, 'MMM d')} - ${format(b, sameYear ? 'MMM d, yyyy' : 'MMM d, yyyy')}`
    }
    case 'Year':
      return format(date, 'yyyy')
    case 'Month':
    default:
      return format(date, 'MMMM yyyy')
  }
}

// Formats a HH:mm string honoring the user's time-format preference.
export function formatTime(hhmm, timeFormat) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  if (timeFormat === '24-hour') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// "in 3 days", "Today", "Tomorrow", "2 days ago"
export function relativeDays(targetKey) {
  const diff = differenceInCalendarDays(parseKey(targetKey), startOfDay(new Date()))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0) return `${diff} days`
  return `${Math.abs(diff)} days ago`
}

export {
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
}
