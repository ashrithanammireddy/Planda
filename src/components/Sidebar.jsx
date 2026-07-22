import {
  CalendarDays,
  TrendingUp,
  Users,
  Settings,
  PanelLeft,
} from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Primary navigation (Profile/Account live in the top-bar avatar menu).
export const NAV = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'friends', label: 'Friends', icon: Users },
]

// Desktop left sidebar, collapsible to an icon rail. Hidden below lg.
export default function Sidebar({
  section,
  setSection,
  collapsed,
  onToggle,
  onOpenSettings,
}) {
  return (
    <aside
      className="sticky top-0 hidden h-screen shrink-0 flex-col gap-2 border-r pl-border pl-surface p-3 transition-[width] duration-200 lg:flex"
      style={{ width: collapsed ? 72 : 240 }}
    >
      <div
        className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1 py-2`}
      >
        {!collapsed &&
          (
            <span
              role="img"
              aria-label="planda"
              style={{
                WebkitMaskImage: `url(${wordmarkUrl})`,
                maskImage: `url(${wordmarkUrl})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskPosition: 'left center',
                maskPosition: 'left center',
                backgroundColor: 'var(--planda-text)',
                width: '96px',
                height: '36px',
                display: 'inline-block',
              }}
            />
          )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          className="rounded-lg p-1.5 pl-text-muted transition hover:pl-surface-2 hover:pl-text"
        >
          <PanelLeft size={19} />
        </button>
      </div>

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

      <div className="mt-auto">
        <button
          type="button"
          onClick={onOpenSettings}
          title={collapsed ? 'Settings' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold pl-text-muted transition hover:pl-surface-2 ${
            collapsed ? 'justify-center px-0' : 'px-3'
          }`}
        >
          <Settings size={19} />
          {!collapsed && 'Settings'}
        </button>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <PandaLogo size={30} />
          </div>
        )}
      </div>
    </aside>
  )
}
