import { CalendarDays, TrendingUp, Users, User, Settings } from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

export const NAV = [
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
]

// Desktop left sidebar. Hidden below lg (MobileNav takes over there).
export default function Sidebar({ section, setSection, onOpenAI, onOpenSettings }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-2 border-r pl-border pl-surface p-4 lg:flex">
      <div className="px-2 py-3">
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
            width: '108px',
            height: '40px',
            display: 'inline-block',
          }}
        />
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-current={active ? 'page' : undefined}
              style={active ? { color: 'var(--planda-accent)' } : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active ? 'pl-accent-soft' : 'pl-text-muted hover:pl-surface-2'
              }`}
            >
              <Icon size={19} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <button
          type="button"
          onClick={onOpenAI}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold pl-accent-text transition hover:pl-surface-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full pl-surface-2 transition group-hover:scale-105">
            <PandaLogo size={30} />
          </span>
          Ask Planda
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold pl-text-muted transition hover:pl-surface-2"
        >
          <Settings size={19} />
          Settings
        </button>
      </div>
    </aside>
  )
}
