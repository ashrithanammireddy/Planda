import { useState } from 'react'
import { UserCircle, Settings, ChevronDown } from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Slim top bar: brand on mobile, "Ask Planda" + account avatar on the right.
export default function TopBar({ avatar, onOpenAI, onOpenSettings, setSection }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (fn) => {
    setMenuOpen(false)
    fn()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b pl-border pl-surface px-4 py-2.5">
      {/* Brand on mobile (sidebar is hidden there) */}
      <span
        role="img"
        aria-label="planda"
        className="inline-block lg:hidden"
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
          width: '88px',
          height: '32px',
        }}
      />
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        {/* Ask Planda lives up here now (desktop; mobile uses the bottom panda) */}
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

        {/* Account avatar + menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-1 rounded-full pl-surface-2 p-1 pr-1.5 transition hover:brightness-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full pl-surface text-xl leading-none">
              {avatar || '🐼'}
            </span>
            <ChevronDown size={15} className="pl-text-muted" />
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
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go(onOpenSettings)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  <Settings size={18} className="pl-text-muted" />
                  Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
