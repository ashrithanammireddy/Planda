import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import {
  STORAGE_KEY,
  SEED_CLASSES,
  CLASS_COLORS,
  DEFAULT_ASSESSMENT_EMOJIS,
  DEFAULT_THEME_COLOR,
} from '../lib/constants'
import { generateStudySessions } from '../lib/studyPlan'

const StoreContext = createContext(null)

const uid = () =>
  (crypto?.randomUUID?.() ??
    `id-${Math.random().toString(36).slice(2)}${Date.now()}`)

const DEFAULT_PROFILE = { name: '', school: '', avatar: '🐼' }

const DEFAULT_SETTINGS = {
  appearance: 'Auto', // Light | Dark | Auto (Auto follows the theme color)
  backgroundColor: DEFAULT_THEME_COLOR, // neutral grey by default
  defaultView: 'Month',
  timeFormat: '12-hour', // 12-hour | 24-hour
  weekStartsOn: 'Monday', // Monday | Sunday
  showCompletedTasks: true,
  assessmentEmojis: { ...DEFAULT_ASSESSMENT_EMOJIS },
}

function seedState() {
  const classes = SEED_CLASSES.map((c, i) => ({
    id: uid(),
    name: c.name,
    color: c.color || CLASS_COLORS[i % CLASS_COLORS.length],
  }))
  return {
    classes,
    assessments: [],
    sessions: [],
    items: [],
    focusLog: [],
    profile: { ...DEFAULT_PROFILE },
    settings: { ...DEFAULT_SETTINGS },
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw)
    return {
      classes: parsed.classes ?? [],
      assessments: parsed.assessments ?? [],
      sessions: parsed.sessions ?? [],
      items: parsed.items ?? [],
      focusLog: parsed.focusLog ?? [],
      profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    }
  } catch {
    return seedState()
  }
}

// Rebuild generated study sessions from the current assessments, preserving
// per-session completion / task state by stable id.
function rebuildSessions(assessments, classes, prevSessions = []) {
  const prevById = new Map(prevSessions.map((s) => [s.id, s]))
  return assessments.flatMap((a) =>
    generateStudySessions(a, { classes }).map((s) => {
      const prev = prevById.get(s.id)
      if (!prev) return s
      return {
        ...s,
        completed: prev.completed,
        tasks: s.tasks.map((t) => {
          const pt = prev.tasks?.find((p) => p.text === t.text)
          return pt ? { ...t, done: pt.done } : t
        }),
      }
    })
  )
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CLASS': {
      const cls = {
        id: uid(),
        name: action.name,
        color: action.color || CLASS_COLORS[0],
      }
      return { ...state, classes: [...state.classes, cls] }
    }
    case 'UPDATE_CLASS': {
      const classes = state.classes.map((c) =>
        c.id === action.id ? { ...c, ...action.changes } : c
      )
      return {
        ...state,
        classes,
        sessions: rebuildSessions(state.assessments, classes, state.sessions),
      }
    }
    case 'DELETE_CLASS': {
      const classes = state.classes.filter((c) => c.id !== action.id)
      const assessments = state.assessments.map((a) =>
        a.classId === action.id ? { ...a, classId: null } : a
      )
      return {
        ...state,
        classes,
        assessments,
        sessions: rebuildSessions(assessments, classes, state.sessions),
      }
    }
    case 'ADD_ASSESSMENT': {
      const assessment = { id: uid(), ...action.assessment }
      const assessments = [...state.assessments, assessment]
      return {
        ...state,
        assessments,
        sessions: rebuildSessions(assessments, state.classes, state.sessions),
      }
    }
    case 'UPDATE_ASSESSMENT': {
      const assessments = state.assessments.map((a) =>
        a.id === action.id ? { ...a, ...action.changes } : a
      )
      return {
        ...state,
        assessments,
        sessions: rebuildSessions(assessments, state.classes, state.sessions),
      }
    }
    case 'DELETE_ASSESSMENT': {
      const assessments = state.assessments.filter((a) => a.id !== action.id)
      return {
        ...state,
        assessments,
        sessions: rebuildSessions(assessments, state.classes, state.sessions),
      }
    }
    case 'ADD_ITEM': {
      const item = { id: uid(), completed: false, ...action.item }
      return { ...state, items: [...state.items, item] }
    }
    case 'IMPORT_ITEMS': {
      // De-dupe against existing items by title + date so re-imports are safe.
      const seen = new Set(state.items.map((i) => `${i.title}|${i.date}`))
      const fresh = action.items
        .filter((i) => i.title && i.date && !seen.has(`${i.title}|${i.date}`))
        .map((i) => ({ id: uid(), completed: false, ...i }))
      return { ...state, items: [...state.items, ...fresh], lastImportCount: fresh.length }
    }
    case 'UPDATE_ITEM': {
      const items = state.items.map((i) =>
        i.id === action.id ? { ...i, ...action.changes } : i
      )
      return { ...state, items }
    }
    case 'DELETE_ITEM': {
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    }
    case 'TOGGLE_ITEM': {
      const items = state.items.map((i) =>
        i.id === action.id ? { ...i, completed: !i.completed } : i
      )
      return { ...state, items }
    }
    case 'TOGGLE_SESSION': {
      const sessions = state.sessions.map((s) =>
        s.id === action.id ? { ...s, completed: !s.completed } : s
      )
      return { ...state, sessions }
    }
    case 'TOGGLE_TASK': {
      const sessions = state.sessions.map((s) =>
        s.id === action.sessionId
          ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === action.taskId ? { ...t, done: !t.done } : t
              ),
            }
          : s
      )
      return { ...state, sessions }
    }
    case 'LOAD_SAMPLE': {
      const key = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`
      const addDays = (n) => {
        const d = new Date()
        d.setDate(d.getDate() + n)
        return key(d)
      }
      const todayKey = key(new Date())
      const classes = state.classes.length
        ? state.classes
        : SEED_CLASSES.map((c) => ({ id: uid(), name: c.name, color: c.color }))
      const cid = (i) => classes[i % classes.length]?.id || null

      const assessments = [
        { id: uid(), classId: cid(3), title: 'Vocab Quiz', type: 'Quiz', dueDate: addDays(2), difficulty: 'Easy', dailyStudyMinutes: 20, topics: ['Ch. 4 words'], notes: '', customColor: '' },
        { id: uid(), classId: cid(0), title: 'Unit 3 Test', type: 'Test', dueDate: addDays(3), difficulty: 'Medium', dailyStudyMinutes: 30, topics: ['Quadratics', 'Factoring'], notes: '', customColor: '' },
        { id: uid(), classId: cid(2), title: 'Essay Draft', type: 'Project', dueDate: addDays(5), difficulty: 'Medium', dailyStudyMinutes: 40, topics: ['Thesis', 'Sources'], notes: '', customColor: '' },
        { id: uid(), classId: cid(1), title: 'Biology Midterm', type: 'Exam', dueDate: addDays(8), difficulty: 'Hard', dailyStudyMinutes: 45, topics: ['Cells', 'Genetics', 'Ecology'], notes: '', customColor: '' },
      ]
      const sessions = rebuildSessions(assessments, classes, []).map((s) =>
        s.date === todayKey ? { ...s, completed: true } : s
      )
      const items = [
        { id: uid(), kind: 'item', title: 'Read chapter 4', description: '', date: addDays(0), category: 'School', priority: 'Medium', type: 'Task', customColor: '', checkable: true, completed: false, timeBlock: { enabled: false, time: '09:00', durationMinutes: 60 } },
        { id: uid(), kind: 'item', title: 'Soccer practice', description: '', date: addDays(1), category: 'Personal', priority: 'Low', type: 'Event', customColor: '', checkable: false, completed: false, timeBlock: { enabled: true, time: '16:00', durationMinutes: 90 } },
        { id: uid(), kind: 'item', title: 'Dentist appointment', description: '', date: addDays(4), category: 'Health', priority: 'Medium', type: 'Event', customColor: '', checkable: false, completed: false, timeBlock: { enabled: true, time: '10:30', durationMinutes: 60 } },
        // completed on previous days -> builds a study streak
        { id: uid(), kind: 'item', title: 'Review flashcards', description: '', date: addDays(-1), category: 'School', priority: 'Medium', type: 'Task', customColor: '', checkable: true, completed: true, timeBlock: { enabled: false, time: '09:00', durationMinutes: 30 } },
        { id: uid(), kind: 'item', title: 'Outline essay', description: '', date: addDays(-2), category: 'School', priority: 'Medium', type: 'Task', customColor: '', checkable: true, completed: true, timeBlock: { enabled: false, time: '09:00', durationMinutes: 30 } },
        { id: uid(), kind: 'item', title: 'Practice problems', description: '', date: addDays(-3), category: 'School', priority: 'Medium', type: 'Task', customColor: '', checkable: true, completed: true, timeBlock: { enabled: false, time: '09:00', durationMinutes: 30 } },
      ]
      return { ...state, classes, assessments, sessions, items }
    }
    case 'LOG_FOCUS': {
      const key = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`
      const entry = {
        id: uid(),
        date: key(new Date()),
        minutes: action.minutes,
      }
      return { ...state, focusLog: [...(state.focusLog || []), entry] }
    }
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.changes } }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.changes } }
    case 'RESET':
      return seedState()
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors */
    }
  }, [state])

  const actions = useMemo(
    () => ({
      addClass: (name, color) => dispatch({ type: 'ADD_CLASS', name, color }),
      updateClass: (id, changes) =>
        dispatch({ type: 'UPDATE_CLASS', id, changes }),
      deleteClass: (id) => dispatch({ type: 'DELETE_CLASS', id }),
      addAssessment: (assessment) =>
        dispatch({ type: 'ADD_ASSESSMENT', assessment }),
      updateAssessment: (id, changes) =>
        dispatch({ type: 'UPDATE_ASSESSMENT', id, changes }),
      deleteAssessment: (id) => dispatch({ type: 'DELETE_ASSESSMENT', id }),
      addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
      importItems: (items) => dispatch({ type: 'IMPORT_ITEMS', items }),
      updateItem: (id, changes) => dispatch({ type: 'UPDATE_ITEM', id, changes }),
      deleteItem: (id) => dispatch({ type: 'DELETE_ITEM', id }),
      toggleItem: (id) => dispatch({ type: 'TOGGLE_ITEM', id }),
      toggleSession: (id) => dispatch({ type: 'TOGGLE_SESSION', id }),
      toggleTask: (sessionId, taskId) =>
        dispatch({ type: 'TOGGLE_TASK', sessionId, taskId }),
      updateSettings: (changes) =>
        dispatch({ type: 'UPDATE_SETTINGS', changes }),
      updateProfile: (changes) =>
        dispatch({ type: 'UPDATE_PROFILE', changes }),
      logFocus: (minutes) => dispatch({ type: 'LOG_FOCUS', minutes }),
      loadSample: () => dispatch({ type: 'LOAD_SAMPLE' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  )

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
