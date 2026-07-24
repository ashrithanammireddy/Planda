import { Check } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import { RANKS } from '../lib/ranks'

// Shows the full rank ladder so you can see every level and what's next.
export default function RanksModal({ open, onClose, points, currentIndex }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        title="Ranks"
        subtitle={`${points.toLocaleString()} Planda Points · earn points by planning, focusing, and unlocking badges`}
        onClose={onClose}
      />
      <div className="flex flex-col gap-2">
        {RANKS.map((r, i) => {
          const achieved = i < currentIndex
          const current = i === currentIndex
          return (
            <div
              key={r.name}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                current ? 'pl-accent-soft pl-accent-border' : 'pl-border'
              }`}
              style={current ? undefined : { opacity: achieved ? 1 : 0.6 }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full pl-surface-2 text-2xl">
                {r.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-bold pl-text">
                  {r.name}
                  {current && (
                    <span className="rounded-full pl-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-xs pl-text-muted">
                  {r.min.toLocaleString()} pts
                </div>
              </div>
              {achieved && <Check size={18} className="pl-accent-text" />}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
