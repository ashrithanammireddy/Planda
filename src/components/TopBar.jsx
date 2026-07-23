import { useState } from 'react'
import { UserCircle, LogOut, PanelLeft } from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Full-width top bar: hamburger + planda wordmark on the left; Ask Planda and
// the account avatar (with Profile / Account / Colors / Log out) on the right.
export default function TopBar({
  avatar,
  onToggleSidebar,
  onOpenAI,
  onLogout,
  setSection,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const go = (fn) => {
    setMenuOpen(false)
    fn()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b pl-border pl-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          className="hidden rounded-lg p-1.5 pl-text-muted transition hover:pl-surface-2 hover:pl-text lg:inline-flex"
        >
          <PanelLeft size={19} />
        </button>
        <span
          role="img"
          aria-label="planda"
          className="inline-block"
          style={{
            WebkitMaskImage: `url(${wordmarkUrl})`,
            maskImage: `url(${wordmarkUrl})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            // fill the box so we can stretch it a touch wider than natural
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskPosition: 'left center',
            maskPosition: 'left center',
            backgroundColor: 'var(--planda-text)',
            width: '100px',
            height: '42px',
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAI}
          title="Ask Planda"
          className="group hidden items-center gap-2 rounded-full pl-surface-2 py-1 pl-1 pr-3.5 shadow-sm transition hover:brightness-95 lg:inline-flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full pl-surface transition group-hover:scale-105">
            <PandaLogo size={26} />
          </span>
          <span className="text-sm font-semibold pl-accent-text">Ask Planda</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account"
            className="flex h-10 w-10 items-center justify-center rounded-full pl-surface-2 text-xl leading-none transition hover:brightness-95"
          >
            {avatar || '🐼'}
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                className="planda-pop absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border pl-border pl-surface p-1.5 shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(() => setSection('profile'))}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  <span className="text-lg leading-none">{avatar || '🐼'}</span>
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(() => setSection('account'))}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  <UserCircle size={18} className="pl-text-muted" />
                  Account
                </button>
                <div className="my-1 h-px pl-surface-2" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(onLogout)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
