import { useState } from 'react'
import { Settings, Palette, SlidersHorizontal, PanelLeft } from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Full-width top bar: hamburger + planda wordmark (left); Ask Planda + a
// Settings gear that opens Theme / Settings (right).
export default function TopBar({ onToggleSidebar, onOpenAI, onOpenTheme, onOpenSettings }) {
  const [menu, setMenu] = useState(false)
  const pick = (fn) => {
    setMenu(false)
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
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskPosition: 'left center',
            maskPosition: 'left center',
            backgroundColor: 'var(--planda-text)',
            width: '100px',
            height: '40px',
            marginTop: '2px',
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
            onClick={() => setMenu((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menu}
            aria-label="Settings"
            className="rounded-full p-2 pl-text-muted transition hover:pl-surface-2 hover:pl-text"
          >
            <Settings size={20} />
          </button>

          {menu && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenu(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                className="planda-pop absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border pl-border pl-surface p-1.5 shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => pick(onOpenTheme)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  <Palette size={18} className="pl-text-muted" />
                  Theme
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => pick(onOpenSettings)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium pl-text transition hover:pl-surface-2"
                >
                  <SlidersHorizontal size={18} className="pl-text-muted" />
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
