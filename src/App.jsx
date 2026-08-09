import { useEffect, useRef, useState } from 'react'
import { StoreProvider, useStore } from './store/StoreContext'
import { FocusProvider } from './store/FocusContext'
import { SocialProvider } from './store/SocialContext'
import FocusRoom from './components/FocusRoom'
import FocusPill from './components/FocusPill'
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
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import PostLoginLoader from './components/PostLoginLoader'
import ImportModal from './components/ImportModal'
import Tutorial from './components/Tutorial'
import AppSkeleton from './components/Skeleton'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MobileNav from './components/MobileNav'
import ProgressSection from './components/sections/ProgressSection'
import FriendsSection from './components/sections/FriendsSection'
import ProfileSection from './components/sections/ProfileSection'
import AccountSection from './components/sections/AccountSection'
import GradesSection from './components/sections/GradesSection'
import { parseKey } from './lib/dates'
import { isColorDark, themeTokens, accentColor, isValidColor } from './lib/colors'
import { firebaseEnabled, auth, signOutFirebase } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Used when no background/accent color is selected: a clean neutral grey.
const NEUTRAL_BG = '#e8eaee'
// Dark mode uses one consistent neutral dark; the chosen color only drives the
// accent, not the darkness itself.
const DARK_BG = '#14161c'

function PlandaApp() {
  const { settings, profile, updateProfile, updateSettings } = useStore()

  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem('planda.authed')
  )
  const [onboarded, setOnboarded] = useState(
    () => !!localStorage.getItem('planda.onboarded')
  )
  const [section, setSection] = useState(
    () => localStorage.getItem('planda.section') || 'calendar'
  )
  const [collapsed, setCollapsed] = useState(false)
  const [entering, setEntering] = useState(false)
  const enteredRef = useRef(false)
  const [view, setView] = useState(settings.defaultView)
  const [date, setDate] = useState(() => new Date())
  const mainRef = useRef(null)

  // Remember the current screen across reloads.
  useEffect(() => {
    localStorage.setItem('planda.section', section)
  }, [section])

  // Show the branded loading screen the first time we enter the app this
  // session (covers Google/Apple/email sign-in, guest, and reloads).
  useEffect(() => {
    if (authed && onboarded && !enteredRef.current) {
      enteredRef.current = true
      setEntering(true)
    }
  }, [authed, onboarded])

  // Called when the loader's zoom-into-Ask-Planda transition finishes.
  const finishEntering = () => {
    setEntering(false)
    // Fresh sign-ins land on the calendar; plain reloads keep their screen.
    if (sessionStorage.getItem('planda.justLoggedIn')) {
      sessionStorage.removeItem('planda.justLoggedIn')
      setView(settings.defaultView)
      setDate(new Date())
      setSection('calendar')
    }
  }

  // With real Firebase auth on, the signed-in user drives whether we're authed;
  // a Google/Apple account also pre-fills the profile name on first sign-in.
  useEffect(() => {
    if (!firebaseEnabled || !auth) return
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('planda.authed', '1')
        setAuthed(true)
        if (!profile.name && user.displayName) {
          updateProfile({ name: user.displayName.split(' ')[0] })
        }
      } else {
        localStorage.removeItem('planda.authed')
        setAuthed(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nav clicks: switch section; re-tapping the current tab resets it to its
  // first page (calendar back to default view/today) and scrolls to top.
  const goTo = (id) => {
    if (id === section) {
      if (id === 'calendar') {
        setView(settings.defaultView)
        setDate(new Date())
      }
    }
    setSection(id)
    mainRef.current?.scrollTo({ top: 0 })
  }

  // Modal / panel state
  const [assessmentOpen, setAssessmentOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [initialDate, setInitialDate] = useState(null)
  const [itemOpen, setItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  // Brief skeleton while webfonts settle, so first paint is smooth (no spinner).
  const [booting, setBooting] = useState(true)
  const [detailDay, setDetailDay] = useState(null)
  const [tourOpen, setTourOpen] = useState(false)

  // First-run walkthrough: show it once the app is ready (after the loader),
  // only if it hasn't been seen. Closing it marks it seen so it won't return.
  useEffect(() => {
    if (authed && onboarded && !booting && !entering && !settings.tourSeen) {
      setTourOpen(true)
    }
  }, [authed, onboarded, booting, entering, settings.tourSeen])

  const closeTour = () => {
    setTourOpen(false)
    if (!settings.tourSeen) updateSettings({ tourSeen: true })
  }
  const startTour = () => setTourOpen(true)

  // Theme the whole app from the chosen background color. The color is ALWAYS
  // the real page background (never overridden); we only decide whether to use
  // light or dark text/surfaces, and derive tinted surfaces from the color.
  useEffect(() => {
    // Fall back to a neutral grey when no valid color is selected.
    const chosen = isValidColor(settings.backgroundColor)
      ? settings.backgroundColor
      : NEUTRAL_BG
    const wantDark =
      settings.appearance === 'Dark' ||
      (settings.appearance === 'Auto' && isColorDark(chosen))
    // In dark mode the page is a consistent neutral dark; the chosen color only
    // drives the accent. In light mode the chosen color IS the page background.
    const pageBg = wantDark ? DARK_BG : chosen
    // Decide light-vs-dark TEXT from the ACTUAL page background, not just the
    // appearance setting, so a dark theme color (e.g. black) picked under Light
    // still gets readable light text instead of black-on-black.
    const dark = isColorDark(pageBg)
    const t = themeTokens(pageBg, dark)
    const accentL = dark ? 70 : 57
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
    // In dark mode a low-opacity tint over the dark bg reads muddy, so use a
    // lighter, slightly stronger soft accent there.
    root.style.setProperty(
      '--planda-accent-soft',
      accentColor(chosen, { l: dark ? 72 : accentL, alpha: dark ? 0.26 : 0.16 })
    )
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

  // Clicking any calendar item opens the day's quick view (check / edit /
  // delete). Only the Edit button in there opens the full edit popup.
  const handleSelectItem = (item) => {
    const key = item.kind === 'assessment' ? item.ref.dueDate : item.ref.date
    setDetailDay(parseKey(key))
  }

  useEffect(() => {
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        setBooting(false)
      }
    }
    document.fonts?.ready.then(finish)
    const t = setTimeout(finish, 900) // safety cap
    return () => clearTimeout(t)
  }, [])

  const openAI = () => setAiOpen(true)
  const openSettings = () => setSettingsOpen(true)
  const [loggedOut, setLoggedOut] = useState(false)
  const logout = () => {
    if (
      window.confirm(
        'Log out of Planda? Your planner data stays on this device.'
      )
    ) {
      if (firebaseEnabled) signOutFirebase()
      localStorage.removeItem('planda.authed')
      setAuthed(false)
      setSection('calendar')
      setLoggedOut(true)
    }
  }

  if (!authed) {
    return (
      <Login
        notice={loggedOut ? 'Logged out successfully' : ''}
        onDone={(mode) => {
          sessionStorage.setItem('planda.justLoggedIn', '1')
          localStorage.setItem('planda.authed', '1')
          setAuthed(true)
          setLoggedOut(false)
          if (mode === 'guest') {
            localStorage.setItem('planda.onboarded', '1')
            setOnboarded(true)
          }
        }}
      />
    )
  }

  if (!onboarded) {
    return (
      <Onboarding
        onDone={() => {
          sessionStorage.setItem('planda.justLoggedIn', '1')
          localStorage.setItem('planda.onboarded', '1')
          setOnboarded(true)
        }}
      />
    )
  }

  return (
    <>
      {entering && <PostLoginLoader onDone={finishEntering} />}
      <div className="flex h-screen flex-col">
      <TopBar
        onToggleSidebar={() => setCollapsed((c) => !c)}
        onOpenAI={openAI}
        onOpenSettings={openSettings}
        iconHidden={entering}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          section={section}
          setSection={goTo}
          collapsed={collapsed}
          avatar={profile.avatar}
          name={profile.name}
          onProfile={() => setSection('profile')}
          onAccount={() => setSection('account')}
          onLogout={logout}
        />

        <main
          ref={mainRef}
          className="min-w-0 flex-1 overflow-y-auto pb-24 planda-scroll lg:pb-0"
        >
          <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
          {booting && <AppSkeleton />}
          {!booting && section === 'calendar' && (
            <div className="flex flex-col gap-4">
              <Header
                view={view}
                setView={setView}
                date={date}
                setDate={setDate}
                weekStartsOn={settings.weekStartsOn}
              />
              <div className="flex flex-col gap-5 lg:h-[calc(100vh-176px)] lg:flex-row">
                <div className="min-h-0 flex-1">
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
                  <UpcomingAssessments
                    onSelectAssessment={openEditAssessment}
                    onImport={() => setImportOpen(true)}
                  />
                )}
              </div>
            </div>
          )}

          {!booting && section === 'progress' && <ProgressSection />}
          {!booting && section === 'grades' && <GradesSection />}
          {!booting && section === 'friends' && <FriendsSection />}
          {!booting && section === 'profile' && <ProfileSection />}
          {!booting && section === 'account' && (
            <AccountSection
              onOpenSettings={openSettings}
              onOpenImport={() => setImportOpen(true)}
            />
          )}
        </div>
      </main>
      </div>

      <MobileNav
        section={section}
        setSection={goTo}
        onOpenAI={openAI}
        avatar={profile.avatar}
        glasses={profile.glasses}
        hat={profile.hat}
        iconHidden={entering}
      />

      {section === 'calendar' && (
        <Fab
          onAddItem={() => openNewItem(date)}
          onAddAssessment={() => openNewAssessment(date)}
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
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenImport={() => {
          setSettingsOpen(false)
          setImportOpen(true)
        }}
        onStartTour={() => {
          setSettingsOpen(false)
          startTour()
        }}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <StudyAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
      <Tutorial open={tourOpen} onClose={closeTour} />
      <FocusRoom />
      <FocusPill />
      <DayDetailModal
        open={!!detailDay}
        day={detailDay}
        onClose={() => setDetailDay(null)}
        onEditAssessment={openEditAssessment}
        onEditItem={openEditItem}
        onAddForDay={openNewItem}
      />
      </div>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <SocialProvider>
        <FocusProvider>
          <PlandaApp />
        </FocusProvider>
      </SocialProvider>
    </StoreProvider>
  )
}
