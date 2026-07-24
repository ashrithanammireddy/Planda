import { NAV } from './Sidebar'
import PandaLogo from './PandaLogo'

// Bottom tab bar for small screens (hidden at lg+). Panda in the middle opens
// the Study Assistant; the avatar on the right opens the account area.
export default function MobileNav({ section, setSection, onOpenAI, avatar }) {
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
          active ? '' : 'pl-text'
        }`}
      >
        <Icon size={20} />
        {label}
      </button>
    )
  }

  const accountActive = section === 'account' || section === 'profile'
  // Grades stays a desktop/sidebar item to keep the mobile bar uncluttered.
  const tabs = NAV.filter((n) => n.id !== 'grades')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t pl-border pl-surface px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
      {tabs.slice(0, 2).map(tab)}
      <button
        type="button"
        onClick={onOpenAI}
        aria-label="Ask Planda"
        id="panda-anchor-mobile"
        className="mx-1 -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full pl-surface shadow-lg ring-4 ring-[var(--planda-bg)]"
      >
        <PandaLogo size={40} />
      </button>
      {tabs.slice(2).map(tab)}
      <button
        type="button"
        onClick={() => setSection('account')}
        aria-current={accountActive ? 'page' : undefined}
        style={accountActive ? { color: 'var(--planda-accent)' } : undefined}
        className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
          accountActive ? '' : 'pl-text'
        }`}
      >
        <span className="text-xl leading-none">{avatar || '🐼'}</span>
        Account
      </button>
    </nav>
  )
}
