import { BookOpen } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { upcomingAssessments } from '../lib/events'
import { format, parseKey, relativeDays } from '../lib/dates'
import { readableText, tint } from '../lib/colors'

export default function UpcomingAssessments({ onSelectAssessment }) {
  const { assessments, classes, settings } = useStore()
  const list = upcomingAssessments(assessments, classes)

  return (
    <div className="w-full rounded-3xl pl-surface p-5 shadow-sm lg:w-80">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen size={18} className="pl-text" />
        <h2 className="text-base font-bold pl-text">
          Upcoming Assessments
        </h2>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full pl-surface-2 pl-text-muted">
            <BookOpen size={24} />
          </div>
          <div className="text-base font-semibold pl-text">
            No Upcoming Assessments
          </div>
          <div className="max-w-[200px] text-sm pl-text-muted">
            Add a test, quiz, or exam to get AI-powered study plans
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((a) => {
            const base = a.customColor || a.classColor || '#bbf7d0'
            const bg = tint(base, 0.35)
            const emoji = settings.assessmentEmojis?.[a.type] || '📌'
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectAssessment(a)}
                style={{ backgroundColor: bg, color: readableText(bg) }}
                className="rounded-2xl px-4 py-3 text-left transition hover:brightness-95"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span>{emoji}</span>
                  <span className="truncate">{a.title}</span>
                </div>
                {a.className && (
                  <div className="mt-0.5 truncate text-sm opacity-80">
                    {a.className}
                  </div>
                )}
                <div className="mt-1 text-sm opacity-70">
                  {format(parseKey(a.dueDate), 'MMM d')} ·{' '}
                  {relativeDays(a.dueDate)}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
