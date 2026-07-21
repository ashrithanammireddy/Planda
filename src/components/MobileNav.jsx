import { NAV } from './Sidebar'
import PandaLogo from './PandaLogo'

// Bottom tab bar for small screens (hidden at lg+). The panda in the middle
// opens the Study Assistant.
export default function MobileNav({ section, setSection, onOpenAI }) {
  const left = NAV.slice(0, 2)
  const right = NAV.slice(2)

  const tab = ({ id, label, icon: Icon }) => {
    const active = section === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => setSection(id)}
        aria-current={active ? 'page' : undefined}
        style={active ? { color: 'var(--planda-accent)' } : undefined}
        className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
          active ? '' : 'pl-text-muted'
        }`}
      >
        <Icon size={20} />
        {label}
      </button>
    )
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t pl-border pl-surface px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
      {left.map(tab)}
      <button
        type="button"
        onClick={onOpenAI}
        aria-label="Ask Planda"
        className="mx-1 -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full pl-surface shadow-lg ring-4 ring-[var(--planda-bg)]"
      >
        <PandaLogo size={40} />
      </button>
      {right.map(tab)}
    </nav>
  )
}
