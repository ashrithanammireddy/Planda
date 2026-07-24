import { Pin, Share2 } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { useStore } from '../store/StoreContext'
import { shareBadge } from '../lib/shareCard'
import BadgeMedal from './Badge'

// Full milestones grid: earned badges (with tier + share) and locked ones (with
// progress). Pin up to 3 to the profile trophy shelf.
export default function MilestonesModal({ open, onClose, badges }) {
  const { profile, settings, togglePinBadge } = useStore()
  const pinned = settings.pinnedBadges || []
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title="Milestones"
        subtitle={`${earnedCount} of ${badges.length} unlocked · pin up to 3 to your profile`}
        onClose={onClose}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {badges.map((b) => {
          const isPinned = pinned.includes(b.id)
          const canPin = b.earned && (isPinned || pinned.length < 3)
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 pl-border ${
                b.earned ? 'pl-surface' : 'pl-surface-2 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <BadgeMedal badge={b} size={52} />
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={!canPin}
                    onClick={() => togglePinBadge(b.id)}
                    title={isPinned ? 'Unpin' : 'Pin to profile'}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-30 ${
                      isPinned ? 'pl-accent-soft pl-accent-text' : 'pl-surface-2 pl-text-muted hover:pl-text'
                    }`}
                  >
                    <Pin size={15} fill={isPinned ? 'currentColor' : 'none'} />
                  </button>
                  {b.earned && (
                    <button
                      type="button"
                      onClick={() => shareBadge({ badge: b, name: profile.name })}
                      title="Share"
                      className="flex h-8 w-8 items-center justify-center rounded-full pl-surface-2 pl-text-muted transition hover:pl-text"
                    >
                      <Share2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="font-bold pl-text">{b.name}</span>
                {b.tierLabel && <span className="text-xs">{b.tierLabel}</span>}
              </div>
              <p className="text-sm pl-text-muted">{b.desc}</p>

              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full pl-surface-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${b.pct}%`, backgroundColor: 'var(--planda-accent)' }}
                  />
                </div>
                <div className="mt-1 text-xs pl-text-muted">
                  {b.nextTarget
                    ? `${b.value} / ${b.nextTarget} ${b.unit}`
                    : `Maxed · ${b.value} ${b.unit}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
