import { useState } from 'react'
import {
  CalendarDays,
  TrendingUp,
  GraduationCap,
  Users,
  UserCircle,
  LogOut,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { categoryColor } from '../lib/constants'
import { HOLIDAY_SETS } from '../lib/holidays'

// Primary navigation. Account lives at the bottom-left.
export const NAV = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'friends', label: 'Friends', icon: Users },
]

export default function Sidebar({
  section,
  setSection,
  collapsed,
  avatar,
  name,
  onProfile,
  onAccount,
  onLogout,
}) {
  const [menu, setMenu] = useState(false)
  const [openGroups, setOpenGroups] = useState({
    Classes: true,
    'My calendars': true,
    Other: true,
  })
  const toggleGroup = (title) =>
    setOpenGroups((g) => ({ ...g, [title]: !g[title] }))
  const pick = (fn) => {
    setMenu(false)
    fn()
  }

  const { classes, items, settings, toggleCalendar } = useStore()
  const hidden = settings.hiddenCalendars || []
  const usedCats = [...new Set(items.map((i) => i.category))].filter(Boolean)
  const holidayKeys = Object.keys(HOLIDAY_SETS)
  const classCals = classes.map((c) => ({
    id: `class:${c.id}`,
    name: c.name,
    color: c.color,
  }))
  const toCal = (cat) => ({ id: `cat:${cat}`, name: cat, color: categoryColor(cat) })
  // "My calendars" = the user's own categories; "Other" = imported holiday sets.
  const myCals = usedCats.filter((c) => !holidayKeys.includes(c)).map(toCal)
  const otherCals = usedCats.filter((c) => holidayKeys.includes(c)).map(toCal)
  const hasCalendars = classCals.length + myCals.length + otherCals.length > 0

  const calRow = (cal) => {
    const off = hidden.includes(cal.id)
    return (
      <button
        key={cal.id}
        type="button"
        onClick={() => toggleCalendar(cal.id)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-sm transition hover:pl-surface-2"
      >
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2"
          style={{
            backgroundColor: off ? 'transparent' : cal.color,
            borderColor: cal.color,
          }}
        >
          {!off && <Check size={11} className="text-white" />}
        </span>
        <span className={`truncate ${off ? 'pl-text-muted' : 'pl-text'}`}>
          {cal.name}
        </span>
      </button>
    )
  }
  // Collapsible calendar group with a clickable header + chevron.
  const calGroup = (title, cals) => {
    if (cals.length === 0) return null
    const open = openGroups[title]
    return (
      <div key={title}>
        <button
          type="button"
          onClick={() => toggleGroup(title)}
          className="flex w-full items-center justify-between rounded-lg px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider pl-text-muted transition hover:pl-text"
        >
          <span>{title}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? '' : '-rotate-90'}`}
          />
        </button>
        {open && cals.map(calRow)}
      </div>
    )
  }

  return (
    <aside
      className="hidden shrink-0 flex-col gap-1 overflow-visible border-r pl-border pl-surface p-3 transition-[width] duration-200 lg:flex"
      style={{ width: collapsed ? 72 : 240 }}
    >
      <nav className="mt-1 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              title={collapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              style={active ? { color: 'var(--planda-accent)' } : undefined}
              className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${active ? 'pl-accent-soft' : 'pl-text hover:pl-surface-2'}`}
            >
              <Icon size={20} />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

      {/* Calendars: toggle what shows (grouped, Google-Calendar style) */}
      {!collapsed && hasCalendars && (
        <div className="mt-3 max-h-[42vh] overflow-y-auto planda-scroll">
          {calGroup('Classes', classCals)}
          {calGroup('My calendars', myCals)}
          {calGroup('Other', otherCals)}
        </div>
      )}

      {/* Account (bottom-left) with a popup menu */}
      <div className="relative mt-auto">
        {menu && (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              className="fixed inset-0 z-30 cursor-default"
            />
            <div className="planda-pop absolute bottom-full z-40 mb-2 w-48 overflow-hidden rounded-2xl border pl-border pl-surface p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => pick(onProfile)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
              >
                <span className="text-lg leading-none">{avatar || '🐼'}</span>
                Profile
              </button>
              <button
                type="button"
                onClick={() => pick(onAccount)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
              >
                <UserCircle size={18} className="pl-text-muted" />
                Account
              </button>
              <div className="my-1 h-px pl-surface-2" />
              <button
                type="button"
                onClick={() => pick(onLogout)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          title={collapsed ? name || 'Account' : undefined}
          aria-haspopup="menu"
          aria-expanded={menu}
          className={`flex w-full items-center gap-2 rounded-xl border pl-border py-1.5 text-sm font-semibold pl-text transition hover:pl-surface-2 ${
            collapsed ? 'justify-center px-0' : 'justify-between px-2'
          }`}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full pl-surface-2 text-lg">
              {avatar || '🐼'}
            </span>
            {!collapsed && <span className="truncate">{name || 'Account'}</span>}
          </span>
          {!collapsed && (
            <ChevronUp
              size={16}
              className={`shrink-0 pl-text-muted transition-transform ${
                menu ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
      </div>
    </aside>
  )
}
