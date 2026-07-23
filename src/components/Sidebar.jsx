import { useState } from 'react'
import {
  CalendarDays,
  TrendingUp,
  Users,
  UserCircle,
  LogOut,
  ChevronUp,
} from 'lucide-react'

// Primary navigation. Account lives at the bottom-left.
export const NAV = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
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
  const pick = (fn) => {
    setMenu(false)
    fn()
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
              } ${active ? 'pl-accent-soft' : 'pl-text-muted hover:pl-surface-2'}`}
            >
              <Icon size={20} />
              {!collapsed && label}
            </button>
          )
        })}
      </nav>

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
