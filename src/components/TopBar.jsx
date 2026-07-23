import { Settings, PanelLeft } from 'lucide-react'
import PandaLogo from './PandaLogo'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Full-width top bar: hamburger + planda wordmark (left); Ask Planda + a
// Settings gear (right).
export default function TopBar({ onToggleSidebar, onOpenAI, onOpenSettings }) {
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
          className="group hidden items-center gap-2 rounded-full border pl-border py-1 pl-1 pr-3.5 shadow-sm transition hover:brightness-95 lg:inline-flex"
          style={{ background: 'color-mix(in oklab, var(--planda-surface-2), var(--planda-text) 10%)' }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full pl-surface transition group-hover:scale-105">
            <PandaLogo size={26} />
          </span>
          <span className="text-sm font-semibold pl-text">Ask Planda</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="rounded-full p-2 pl-text-muted transition hover:pl-surface-2 hover:pl-text"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  )
}
