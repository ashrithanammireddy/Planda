import { useEffect, useRef, useState } from 'react'
import { Send, X, User } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { buildPlannerContext, askPlanda } from '../lib/ai'
import { assistantReply } from '../lib/aiStub'
import { parseAction } from '../lib/assistantActions'
import { relativeDays } from '../lib/dates'
import pandaUrl from '../assets/planda-book.png'

const SUGGESTIONS = [
  'Plan my week',
  'What should I focus on today?',
  'Quiz me',
  "I'm feeling stressed",
]

function PandaAvatar({ size = 32 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <img src={pandaUrl} alt="Planda" width={size} height={size} style={{ objectFit: 'cover' }} />
    </span>
  )
}

export default function StudyAssistant({ open, onClose }) {
  const store = useStore()
  const { profile } = store
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  // Greet with a friendly intro (context is sent behind the scenes, not shown).
  useEffect(() => {
    if (!open) return
    const name = profile.name ? `, ${profile.name}` : ''
    setMessages([
      {
        role: 'assistant',
        text: `Hi${name}! I'm Planda 🐼 I can see your calendar, assignments, and grades. Ask me to plan your week, tell you what to focus on, quiz you, or explain something.`,
      },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  if (!open) return null

  const send = async (raw) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])

    // Actions first: if the user is asking to log a test/quiz/homework, actually
    // create it (works with or without the AI backend).
    const action = parseAction(text, { classes: store.classes })
    if (action) {
      let reply
      if (action.needDate) {
        reply = `Sure — when is that ${action.type.toLowerCase()} due? (e.g. "next Tuesday" or "Oct 3")`
      } else if (action.kind === 'assessment') {
        store.addAssessment({
          classId: action.classId,
          title: action.title,
          type: action.type,
          dueDate: action.date,
          difficulty: 'Medium',
          dailyStudyMinutes: 30,
          topics: [],
          notes: '',
          customColor: '',
        })
        const cls = store.classes.find((c) => c.id === action.classId)
        reply = `Done ✅ I logged a ${action.type.toLowerCase()}${cls ? ` for ${cls.name}` : action.category !== 'School' ? ` for ${action.category}` : ''} due ${relativeDays(action.date).toLowerCase()}: "${action.title}". It's on your calendar and I set up study blocks leading up to it. Tap it anytime to tweak the details.`
      } else {
        store.addItem({
          title: action.title,
          description: '',
          date: action.date,
          category: action.category,
          priority: 'Medium',
          type: 'Task',
          customColor: '',
          checkable: true,
          timeBlock: { enabled: false, time: '09:00', durationMinutes: 30 },
        })
        reply = `Done ✅ I added "${action.title}"${action.category !== 'School' ? ` under ${action.category}` : ''} for ${relativeDays(action.date).toLowerCase()}. Tap it on your calendar to edit.`
      }
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
      return
    }

    const ctx = buildPlannerContext(store)
    setTyping(true)
    try {
      const reply = await askPlanda({
        message: text,
        context: ctx.text,
        history: messages.slice(-8),
        localBrain: (msg) =>
          assistantReply(msg, {
            assessments: ctx.upcoming,
            classes: store.classes,
            todayTasks: ctx.todayTasks,
            stats: ctx.stats,
          }),
      })
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Sorry, I had trouble responding. Please try again.' },
      ])
    } finally {
      setTyping(false)
    }
  }

  const showSuggestions = messages.length <= 1 && !typing

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 planda-fade"
      onMouseDown={onClose}
    >
      <div
        className="planda-pop flex h-[80vh] max-h-[700px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl pl-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pl-border px-6 py-4">
          <div className="flex items-center gap-3">
            <PandaAvatar size={40} />
            <div>
              <h2 className="text-lg font-bold pl-text">Ask Planda</h2>
              <p className="text-sm pl-text-muted">Your study buddy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 pl-text-muted transition hover:pl-surface-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5 planda-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'user' ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <User size={16} />
                </div>
              ) : (
                <PandaAvatar size={32} />
              )}
              <div
                className={`max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user' ? 'pl-accent text-white' : 'pl-surface-2 pl-text'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-start gap-2.5">
              <PandaAvatar size={32} />
              <div className="flex items-center gap-1 rounded-2xl pl-surface-2 px-4 py-3">
                <span className="planda-typing-dot" />
                <span className="planda-typing-dot" style={{ animationDelay: '0.15s' }} />
                <span className="planda-typing-dot" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pl-[42px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border pl-border px-3.5 py-1.5 text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t pl-border px-4 py-3">
          <input
            className="pl-field flex-1 rounded-full border px-4 py-2.5 text-sm transition"
            placeholder="Ask about a topic, assignment, or study plan…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={typing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full pl-accent text-white transition hover:brightness-110 disabled:opacity-50"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
