import { CalendarDays, TrendingUp, Users, Palette } from 'lucide-react'

// Primary navigation (Profile/Account live in the top-bar avatar menu).
export const NAV = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'friends', label: 'Friends', icon: Users },
]

// Desktop left sidebar, collapsible to an icon rail. Hidden below lg.
// Sits under the top bar; the collapse toggle lives in the top bar.
export default function Sidebar({ section, setSection, collapsed, onOpenSettings }) {
  return (
    <aside
      className="hidden shrink-0 flex-col gap-1 overflow-y-auto border-r pl-border pl-surface p-3 transition-[width] duration-200 planda-scroll lg:flex"
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
              } ${active ? 'pl-accent-soft' : 'pl-text-muted hover:pl-surface-2'}`}
            >
              <Icon size={20} />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onOpenSettings}
        title={collapsed ? 'Settings' : undefined}
        className={`mt-auto flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold pl-text-muted transition hover:pl-surface-2 ${
          collapsed ? 'justify-center px-0' : 'px-3'
        }`}
      >
        <Palette size={19} />
        {!collapsed && 'Settings'}
      </button>
    </aside>
  )
}
