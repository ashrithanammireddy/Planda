import { readableText } from '../lib/colors'
import { formatTime } from '../lib/dates'

// A compact colored chip shown inside calendar day cells.
export default function EventPill({ item, timeFormat, onClick, showTime = true }) {
  const text = readableText(item.color)
  const time = showTime && item.time ? `${formatTime(item.time, timeFormat)} ` : ''
  const label = `${time}${item.emoji ? item.emoji + ' ' : ''}${item.title}`

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(item)
      }}
      title={label}
      style={{ backgroundColor: item.color, color: text }}
      className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight transition hover:brightness-95 ${
        item.completed ? 'line-through opacity-60' : ''
      }`}
    >
      {label}
    </button>
  )
}
