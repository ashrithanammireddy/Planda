import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, Check, Download, ChevronDown } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { parseICS, buildICS } from '../lib/ics'
import { HOLIDAY_SETS } from '../lib/holidays'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const prettyDate = (iso) => {
  const [, m, d] = iso.split('-')
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`
}
const holidayItem = (h, category) => ({
  title: h.title,
  description: '',
  date: h.date,
  category,
  priority: 'Low',
  type: 'Event',
  customColor: '',
  checkable: false,
  timeBlock: { enabled: false, time: '09:00', durationMinutes: 60 },
})

const field = 'pl-field w-full rounded-xl border px-3.5 py-2.5 text-sm transition'

function eventsToItems(events) {
  return events.map((e) => ({
    title: e.title,
    description: e.description || '',
    date: e.date,
    category: 'School',
    priority: 'Medium',
    type: 'Task',
    customColor: '',
    checkable: true,
    timeBlock: {
      enabled: !!e.time,
      time: e.time || '09:00',
      durationMinutes: 60,
    },
  }))
}

export default function ImportModal({ open, onClose }) {
  const { importItems, deleteItem, assessments, sessions, items, settings } = useStore()

  const exportICS = () => {
    const entries = [
      ...assessments.map((a) => ({
        uid: `assess-${a.id}`,
        title: `${settings.assessmentEmojis?.[a.type] || ''} ${a.title}`.trim(),
        date: a.dueDate,
        time: null,
      })),
      ...items.map((it) => ({
        uid: `item-${it.id}`,
        title: it.title,
        date: it.date,
        time: it.timeBlock?.enabled ? it.timeBlock.time : null,
        durationMinutes: it.timeBlock?.durationMinutes,
      })),
      ...sessions.map((s) => ({
        uid: s.id,
        title: s.title,
        date: s.date,
        time: s.time,
        durationMinutes: s.durationMinutes,
      })),
    ]
    const blob = new Blob([buildICS(entries)], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planda.ics'
    a.click()
    URL.revokeObjectURL(url)
  }
  const fileRef = useRef(null)
  const [parsed, setParsed] = useState([])
  const [pasteText, setPasteText] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [done, setDone] = useState('')
  const [openSet, setOpenSet] = useState({ [Object.keys(HOLIDAY_SETS)[0]]: true })

  // A holiday is "on" if any item matches its date + title (regardless of which
  // category version it was added under). Unchecking removes every copy, which
  // also cleans up duplicates from earlier imports.
  const matches = (i, h) => i.title === h.title && i.date === h.date
  const isOn = (h) => items.some((i) => matches(i, h))
  const removeHoliday = (h) =>
    items.filter((i) => matches(i, h)).forEach((i) => deleteItem(i.id))

  const toggleHoliday = (h, cat) => {
    if (isOn(h)) removeHoliday(h)
    else importItems([holidayItem(h, cat)])
  }

  const toggleSet = (cat) => {
    const list = HOLIDAY_SETS[cat] || []
    const allOn = list.every((h) => isOn(h))
    if (allOn) list.forEach(removeHoliday)
    else importItems(list.filter((h) => !isOn(h)).map((h) => holidayItem(h, cat)))
  }

  const reset = () => {
    setParsed([])
    setNote('')
    setDone('')
  }

  const handleParse = (text) => {
    const events = parseICS(text)
    setParsed(events)
    setNote(
      events.length
        ? `Found ${events.length} item${events.length === 1 ? '' : 's'}.`
        : 'No calendar events found in that file. Make sure it is a .ics export.'
    )
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    reset()
    const reader = new FileReader()
    reader.onload = () => handleParse(String(reader.result))
    reader.readAsText(file)
  }

  const onFetchUrl = async () => {
    reset()
    setNote('Fetching…')
    try {
      const res = await fetch(url)
      const text = await res.text()
      handleParse(text)
    } catch {
      setNote(
        "Couldn't fetch that link directly (your school's server blocks it). Download the .ics and upload it, or paste its contents below."
      )
    }
  }

  const importParsed = () => {
    const items = eventsToItems(parsed)
    importItems(items)
    setDone(`Imported ${items.length} assignment${items.length === 1 ? '' : 's'} 🎉`)
    setParsed([])
    setPasteText('')
  }


  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title="Import &amp; Export"
        subtitle="Sync assignments, holidays, and your calendar"
        onClose={onClose}
      />

      <div className="flex flex-col gap-6">
        {/* Assignments from a calendar feed */}
        <section>
          <h3 className="mb-1 text-sm font-bold pl-text">
            Import from Google Calendar, Canvas, or Google Classroom
          </h3>
          <p className="mb-3 text-xs pl-text-muted">
            In Google Calendar (Settings → Import &amp; export), Canvas, or Google
            Classroom, download your <b>calendar (.ics)</b> file and upload it
            here. Your events, assignments, and due dates come in automatically,
            no typing.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl pl-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Upload size={16} />
              Upload .ics file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={onFile}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className={field}
              placeholder="…or paste a calendar (.ics) link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="button"
              onClick={onFetchUrl}
              disabled={!url}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border pl-border px-3 text-sm font-semibold pl-text transition hover:pl-surface-2 disabled:opacity-50"
            >
              <LinkIcon size={15} />
              Fetch
            </button>
          </div>

          <textarea
            rows={2}
            className={`${field} mt-2`}
            placeholder="…or paste the .ics contents here"
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value)
              if (e.target.value.includes('BEGIN:VCALENDAR')) handleParse(e.target.value)
            }}
          />

          {note && <p className="mt-2 text-sm pl-text-muted">{note}</p>}

          {parsed.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 max-h-32 overflow-y-auto rounded-xl border pl-border p-2 planda-scroll">
                {parsed.slice(0, 20).map((e, i) => (
                  <div key={i} className="flex justify-between gap-2 px-1 py-1 text-sm">
                    <span className="truncate pl-text">{e.title}</span>
                    <span className="shrink-0 pl-text-muted">{e.date}</span>
                  </div>
                ))}
                {parsed.length > 20 && (
                  <div className="px-1 py-1 text-xs pl-text-muted">
                    +{parsed.length - 20} more
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={importParsed}
                className="inline-flex items-center gap-2 rounded-xl pl-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Check size={16} />
                Import {parsed.length} into Planda
              </button>
            </div>
          )}
        </section>

        <div className="h-px pl-surface-2" />

        {/* Holidays: check the ones you want on your calendar */}
        <section>
          <h3 className="mb-1 text-sm font-bold pl-text">Holidays &amp; breaks</h3>
          <p className="mb-3 text-xs pl-text-muted">
            Check the holidays you want. They show up under &quot;Other&quot; in
            the sidebar, and unchecking removes them.
          </p>

          <div className="flex flex-col gap-2">
            {Object.keys(HOLIDAY_SETS).map((cat) => {
              const list = HOLIDAY_SETS[cat]
              const onCount = list.filter((h) => isOn(h)).length
              const allOn = onCount === list.length
              const open = openSet[cat]
              return (
                <div key={cat} className="overflow-hidden rounded-xl border pl-border">
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={allOn}
                      ref={(el) => {
                        if (el) el.indeterminate = onCount > 0 && !allOn
                      }}
                      onChange={() => toggleSet(cat)}
                      className="h-4 w-4 shrink-0 cursor-pointer"
                      style={{ accentColor: 'var(--planda-accent)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setOpenSet((s) => ({ ...s, [cat]: !s[cat] }))}
                      className="flex flex-1 items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold pl-text">{cat}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs pl-text-muted">
                          {onCount}/{list.length}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`pl-text-muted transition-transform ${open ? '' : '-rotate-90'}`}
                        />
                      </span>
                    </button>
                  </div>

                  {open && (
                    <div className="border-t pl-border">
                      {list.map((h) => (
                        <label
                          key={h.date}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm transition hover:pl-surface-2"
                        >
                          <input
                            type="checkbox"
                            checked={isOn(h)}
                            onChange={() => toggleHoliday(h, cat)}
                            className="h-4 w-4 shrink-0 cursor-pointer"
                            style={{ accentColor: 'var(--planda-accent)' }}
                          />
                          <span className="flex-1 truncate pl-text">{h.title}</span>
                          <span className="shrink-0 text-xs pl-text-muted">
                            {prettyDate(h.date)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <div className="h-px pl-surface-2" />

        {/* Export to Google Calendar / Apple / Outlook */}
        <section>
          <h3 className="mb-1 text-sm font-bold pl-text">Export to Google Calendar</h3>
          <p className="mb-3 text-xs pl-text-muted">
            Download your Planda schedule as a .ics file, then in Google Calendar
            choose <b>Settings → Import &amp; export → Import</b> to add it.
          </p>
          <button
            type="button"
            onClick={exportICS}
            className="inline-flex items-center gap-2 rounded-xl border pl-border px-4 py-2 text-sm font-semibold pl-text transition hover:pl-surface-2"
          >
            <Download size={16} />
            Download .ics
          </button>
        </section>

        {done && (
          <div className="rounded-xl pl-accent-soft px-4 py-3 text-sm font-semibold pl-accent-text">
            {done}
          </div>
        )}
      </div>
    </Modal>
  )
}
