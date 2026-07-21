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
} from '../lib/constants'
import { generateStudySessions } from '../lib/studyPlan'

const StoreContext = createContext(null)

const uid = () =>
  (crypto?.randomUUID?.() ??
    `id-${Math.random().toString(36).slice(2)}${Date.now()}`)

const DEFAULT_PROFILE = { name: '', school: '', avatar: '🐼' }

const DEFAULT_SETTINGS = {
  appearance: 'Auto', // Light | Dark | Auto (Auto follows the theme color)
  backgroundColor: '#bcdcd3', // Planda mint (matches the brand)
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
