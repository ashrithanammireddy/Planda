import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, CalendarPlus, Check, Download } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { parseICS, buildICS } from '../lib/ics'
import { HOLIDAY_SETS } from '../lib/holidays'

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
  const { importItems, assessments, sessions, items, settings } = useStore()

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
  const [holidaySet, setHolidaySet] = useState(Object.keys(HOLIDAY_SETS)[0])

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

  const addHolidays = () => {
    const items = (HOLIDAY_SETS[holidaySet] || []).map((h) => ({
      title: h.title,
      description: '',
      date: h.date,
      category: 'Other',
      priority: 'Low',
      type: 'Event',
      customColor: '',
      checkable: false,
      timeBlock: { enabled: false, time: '09:00', durationMinutes: 60 },
    }))
    importItems(items)
    setDone(`Added ${holidaySet} holidays 🎉`)
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
            Assignments from Canvas / Google Classroom
          </h3>
          <p className="mb-3 text-xs pl-text-muted">
            In Canvas or Google Classroom, find your <b>calendar feed</b> and
            export/download the <b>.ics</b> file, then upload it here. Your
            assignments and due dates come in automatically, no typing.
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

        {/* Holidays */}
        <section>
          <h3 className="mb-1 text-sm font-bold pl-text">Holidays &amp; breaks</h3>
          <p className="mb-3 text-xs pl-text-muted">
            Add a set of holidays to your calendar in one tap.
          </p>
          <div className="flex gap-2">
            <select
              className={field}
              value={holidaySet}
              onChange={(e) => setHolidaySet(e.target.value)}
            >
              {Object.keys(HOLIDAY_SETS).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addHolidays}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border pl-border px-4 text-sm font-semibold pl-text transition hover:pl-surface-2"
            >
              <CalendarPlus size={15} />
              Add
            </button>
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
