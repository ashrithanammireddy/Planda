import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store/StoreContext'
import Header from './components/Header'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import YearView from './components/YearView'
import UpcomingAssessments from './components/UpcomingAssessments'
import AssessmentModal from './components/AssessmentModal'
import ItemModal from './components/ItemModal'
import SettingsPanel from './components/SettingsPanel'
import StudyAssistant from './components/StudyAssistant'
import DayDetailModal from './components/DayDetailModal'
import Fab from './components/Fab'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MobileNav from './components/MobileNav'
import ProgressSection from './components/sections/ProgressSection'
import FriendsSection from './components/sections/FriendsSection'
import ProfileSection from './components/sections/ProfileSection'
import AccountSection from './components/sections/AccountSection'
import { parseKey } from './lib/dates'
import {
  isColorDark,
  themeTokens,
  accentColor,
  darkThemeBg,
  isValidColor,
} from './lib/colors'

// Used when no background/accent color is selected: a clean neutral grey.
const NEUTRAL_BG = '#eceef1'

function PlandaApp() {
  const { settings, profile, updateProfile } = useStore()

  const [section, setSection] = useState('calendar')
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState(settings.defaultView)
  const [date, setDate] = useState(() => new Date())

  // Modal / panel state
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [initialDate, setInitialDate] = useState(null)
  const [itemOpen, setItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [detailDay, setDetailDay] = useState(null)

  // Theme the whole app from the chosen background color. The color is ALWAYS
  // the real page background (never overridden); we only decide whether to use
  // light or dark text/surfaces, and derive tinted surfaces from the color.
  useEffect(() => {
    // Fall back to a neutral grey when no valid color is selected.
    const chosen = isValidColor(settings.backgroundColor)
      ? settings.backgroundColor
      : NEUTRAL_BG
    const dark =
      settings.appearance === 'Dark' ||
      (settings.appearance === 'Auto' && isColorDark(chosen))
    // In dark mode the page goes genuinely dark (theme-tinted near-black);
    // otherwise the chosen color IS the page background.
    const pageBg = dark ? darkThemeBg(chosen) : chosen
    const t = themeTokens(pageBg, dark)
    const accentL = dark ? 64 : 50
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.style.setProperty('--planda-bg', pageBg)
    root.style.setProperty('--planda-surface', t.surface)
    root.style.setProperty('--planda-surface-2', t.surface2)
    root.style.setProperty('--planda-border', t.border)
    root.style.setProperty('--planda-text', t.text)
    root.style.setProperty('--planda-text-muted', t.textMuted)
    // Accent keeps the CHOSEN color's hue (not the darkened page bg).
    root.style.setProperty('--planda-accent', accentColor(chosen, { l: accentL }))
    root.style.setProperty('--planda-accent-soft', accentColor(chosen, { l: accentL, alpha: 0.16 }))
    root.style.setProperty('--planda-on-accent', '#ffffff')
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

  const openNewItem = (forDay = null) => {
    setEditingItem(null)
    setInitialDate(forDay)
    setDetailDay(null)
    setItemOpen(true)
  }

  const openEditItem = (item) => {
    setEditingItem(item)
    setDetailDay(null)
    setItemOpen(true)
  }

  const handleSelectItem = (item) => {
    if (item.kind === 'assessment') openEditAssessment(item.ref)
    else if (item.kind === 'item') openEditItem(item.ref)
    else setDetailDay(parseKey(item.ref.date))
  }

  const openAI = () => setAiOpen(true)
  const openSettings = () => setSettingsOpen(true)
  const logout = () => {
    if (
      window.confirm(
        'Log out of this local profile? Your planner data stays on this device.'
      )
    ) {
      updateProfile({ name: '', school: '', avatar: '🐼' })
      setSection('calendar')
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        avatar={profile.avatar}
        onToggleSidebar={() => setCollapsed((c) => !c)}
        onOpenAI={openAI}
        onLogout={logout}
        setSection={setSection}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          section={section}
          setSection={setSection}
          collapsed={collapsed}
          onOpenSettings={openSettings}
        />

        <main className="min-w-0 flex-1 overflow-y-auto pb-24 planda-scroll lg:pb-0">
          <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
          {section === 'calendar' && (
            <div className="flex flex-col gap-5">
              <Header
                view={view}
                setView={setView}
                date={date}
                setDate={setDate}
                weekStartsOn={settings.weekStartsOn}
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
          )}

          {section === 'progress' && <ProgressSection />}
          {section === 'friends' && <FriendsSection />}
          {section === 'profile' && (
            <ProfileSection onOpenSettings={openSettings} />
          )}
          {section === 'account' && (
            <AccountSection onOpenSettings={openSettings} />
          )}
        </div>
      </main>
      </div>

      <MobileNav
        section={section}
        setSection={setSection}
        onOpenAI={openAI}
        avatar={profile.avatar}
      />

      {section === 'calendar' && (
        <Fab
          onAddItem={() => openNewItem()}
          onAddAssessment={() => openNewAssessment()}
        />
      )}

      <AssessmentModal
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        editing={editingAssessment}
        initialDate={initialDate}
      />
      <ItemModal
        open={itemOpen}
        onClose={() => setItemOpen(false)}
        editing={editingItem}
        initialDate={initialDate}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StudyAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
      <DayDetailModal
        open={!!detailDay}
        day={detailDay}
        onClose={() => setDetailDay(null)}
        onEditAssessment={openEditAssessment}
        onEditItem={openEditItem}
        onAddForDay={openNewItem}
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
