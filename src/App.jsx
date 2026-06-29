import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store/StoreContext'
import Header from './components/Header'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import YearView from './components/YearView'
import UpcomingAssessments from './components/UpcomingAssessments'
import AssessmentModal from './components/AssessmentModal'
import SettingsPanel from './components/SettingsPanel'
import StudyAssistant from './components/StudyAssistant'
import DayDetailModal from './components/DayDetailModal'
import Fab from './components/Fab'
import { parseKey } from './lib/dates'

function PlandaApp() {
  const { settings } = useStore()

  const [view, setView] = useState(settings.defaultView)
  const [date, setDate] = useState(() => new Date())

  // Modal / panel state
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [initialDate, setInitialDate] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [detailDay, setDetailDay] = useState(null)

  // Apply background color + light/dark appearance to the document.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark =
        settings.appearance === 'Dark' ||
        (settings.appearance === 'Auto' && mql.matches)
      const root = document.documentElement
      root.classList.toggle('dark', dark)
      root.style.setProperty(
        '--planda-bg',
        dark ? '#1b1f2a' : settings.backgroundColor
      )
    }
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [settings.appearance, settings.backgroundColor])

  const openNewAssessment = (forDay = null) => {
    setEditingAssessment(null)
    setInitialDate(forDay)
    setDetailDay(null)
    setAssessmentOpen(true)
  }

  const openEditAssessment = (assessment) => {
    setEditingAssessment(assessment)
    setDetailDay(null)
    setAssessmentOpen(true)
  }

  const handleSelectItem = (item) => {
    if (item.kind === 'assessment') openEditAssessment(item.ref)
    else setDetailDay(parseKey(item.ref.date))
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 p-4 sm:p-6">
        <Header
          view={view}
          setView={setView}
          date={date}
          setDate={setDate}
          weekStartsOn={settings.weekStartsOn}
          onOpenAI={() => setAiOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="min-h-[70vh] flex-1">
            {view === 'Month' && (
              <MonthView
                date={date}
                onSelectItem={handleSelectItem}
                onSelectDay={setDetailDay}
              />
            )}
            {view === 'Week' && (
              <WeekView
                date={date}
                onSelectItem={handleSelectItem}
                onSelectDay={setDetailDay}
              />
            )}
            {view === 'Day' && (
              <DayView date={date} onSelectItem={handleSelectItem} />
            )}
            {view === 'Year' && (
              <YearView
                date={date}
                onPickMonth={(m) => {
                  setDate(m)
                  setView('Month')
                }}
              />
            )}
          </div>

          {view !== 'Year' && (
            <UpcomingAssessments onSelectAssessment={openEditAssessment} />
          )}
        </div>
      </div>

      <Fab onClick={() => openNewAssessment()} />

      <AssessmentModal
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        editing={editingAssessment}
        initialDate={initialDate}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StudyAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
      <DayDetailModal
        open={!!detailDay}
        day={detailDay}
        onClose={() => setDetailDay(null)}
        onEditAssessment={openEditAssessment}
        onAddForDay={openNewAssessment}
      />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <PlandaApp />
    </StoreProvider>
  )
}
