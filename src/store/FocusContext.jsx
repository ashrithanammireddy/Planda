import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useStore } from './StoreContext'

const FocusContext = createContext(null)

// Owns the focus timer so it keeps running when the modal is closed and even
// when you navigate between sections. Logs focus minutes (optionally to a class)
// on completion or when you end early.
export function FocusProvider({ children }) {
  const { logFocus } = useStore()
  const [active, setActive] = useState(false) // a session exists (running or paused)
  const [running, setRunning] = useState(false)
  const [open, setOpen] = useState(false) // is the full modal showing
  const [minutes, setMinutes] = useState(25)
  const [left, setLeft] = useState(25 * 60)
  const [classId, setClassId] = useState(null)
  const [done, setDone] = useState(false)
  const tick = useRef(null)

  useEffect(() => {
    if (!running) return
    tick.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(tick.current)
          setRunning(false)
          setDone(true)
          logFocus(minutes, classId)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const start = ({ minutes: m, classId: c }) => {
    setMinutes(m)
    setClassId(c ?? null)
    setLeft(m * 60)
    setDone(false)
    setActive(true)
    setRunning(true)
    setOpen(true)
  }
  const togglePause = () => setRunning((r) => !r)
  const cancel = () => {
    setRunning(false)
    setActive(false)
    setDone(false)
    setOpen(false)
  }
  // End early and log the minutes actually focused so far.
  const endAndLog = () => {
    const elapsed = Math.round((minutes * 60 - left) / 60)
    if (elapsed >= 1) logFocus(elapsed, classId)
    setRunning(false)
    setActive(false)
    setDone(false)
    setOpen(false)
  }
  const dismissDone = () => {
    setDone(false)
    setActive(false)
    setOpen(false)
  }

  const value = {
    active,
    running,
    open,
    minutes,
    left,
    classId,
    done,
    elapsedMin: Math.round((minutes * 60 - left) / 60),
    setOpen,
    start,
    togglePause,
    cancel,
    endAndLog,
    dismissDone,
  }
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export function useFocus() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocus must be used within FocusProvider')
  return ctx
}
