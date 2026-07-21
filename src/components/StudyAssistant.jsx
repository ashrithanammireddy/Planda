import { useEffect, useRef, useState } from 'react'
import { Send, X, User } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { upcomingAssessments } from '../lib/events'
import { buildContextMessage, assistantReply } from '../lib/aiStub'
import pandaUrl from '../assets/planda-panda.png'

function PandaAvatar({ size = 32 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full pl-surface-2"
      style={{ width: size, height: size }}
    >
      <img
        src={pandaUrl}
        alt="Planda"
        width={size - 6}
        height={size - 6}
        style={{ objectFit: 'contain' }}
      />
    </span>
  )
}

export default function StudyAssistant({ open, onClose }) {
  const { assessments, classes } = useStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  // Seed the conversation with the user's real assessment context on open.
  useEffect(() => {
    if (!open) return
    const upcoming = upcomingAssessments(assessments, classes)
    const ctx = buildContextMessage(upcoming, classes)
    setMessages([
      { role: 'user', text: ctx },
      { role: 'assistant', text: assistantReply(ctx, { assessments: upcoming, classes }) },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!open) return null

  const send = () => {
    const text = input.trim()
    if (!text) return
    const upcoming = upcomingAssessments(assessments, classes)
    setMessages((m) => [
      ...m,
      { role: 'user', text },
      { role: 'assistant', text: assistantReply(text, { assessments: upcoming, classes }) },
    ])
    setInput('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 planda-fade"
      onMouseDown={onClose}
    >
      <div
        className="planda-pop flex h-[80vh] max-h-[700px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl pl-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pl-border px-6 py-4">
          <div className="flex items-center gap-3">
            <PandaAvatar size={40} />
            <div>
              <h2 className="text-lg font-bold pl-text">Study Assistant</h2>
              <p className="text-sm pl-text-muted">Ask me anything about your studies</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 pl-text-muted transition hover:pl-surface-2 hover:pl-text-muted"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5 planda-scroll">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {m.role === 'user' ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 pl-text-muted">
                  <User size={16} />
                </div>
              ) : (
                <PandaAvatar size={32} />
              )}
              <div
                className={`max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'pl-accent text-white'
                    : 'pl-surface-2 pl-text'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t pl-border px-4 py-3">
          <input
            className="pl-field flex-1 rounded-full border px-4 py-2.5 text-sm transition"
            placeholder="Ask about a topic, assessment, or study plan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            type="button"
            onClick={send}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full pl-accent text-white transition hover:brightness-110"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
