import { Flame, Clock, Send } from 'lucide-react'
import Modal, { ModalHeader } from './Modal'
import Avatar from './Avatar'
import BadgeMedal from './Badge'
import { rankFor } from '../lib/ranks'
import { BADGES } from '../lib/badges'
import { STATUS_LABEL } from '../lib/friends'

const statusDot = {
  focusing: 'bg-emerald-500',
  break: 'bg-amber-400',
  offline: 'bg-slate-300',
}

// A friend's profile card, opened from the Friends leaderboard.
export default function FriendProfileModal({ friend, onClose, onCheer }) {
  if (!friend) return null
  const rank = rankFor(friend.points || 0).rank
  const badgeName = (id) => BADGES.find((b) => b.id === id)?.name || id

  return (
    <Modal open={!!friend} onClose={onClose}>
      <ModalHeader title={friend.name} subtitle={`${rank.emoji} ${rank.name}`} onClose={onClose} />

      <div className="flex flex-col items-center gap-3">
        <Avatar value={friend.avatar} glasses={friend.glasses} hat={friend.hat} size={92} />

        {friend.status && (
          <span className="inline-flex items-center gap-1.5 rounded-full pl-surface-2 px-3 py-1 text-xs font-semibold pl-text-muted">
            <span className={`h-2 w-2 rounded-full ${statusDot[friend.status]}`} />
            {STATUS_LABEL[friend.status]}
          </span>
        )}

        <div className="mt-1 grid w-full grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl pl-surface-2 py-3">
            <div className="flex items-center justify-center gap-1 text-lg font-bold pl-text">
              <Flame size={16} /> {friend.streak}
            </div>
            <div className="text-xs pl-text-muted">day streak</div>
          </div>
          <div className="rounded-2xl pl-surface-2 py-3">
            <div className="flex items-center justify-center gap-1 text-lg font-bold pl-text">
              <Clock size={16} /> {friend.weeklyMinutes}
            </div>
            <div className="text-xs pl-text-muted">min this week</div>
          </div>
          <div className="rounded-2xl pl-surface-2 py-3">
            <div className="text-lg font-bold pl-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {(friend.points || 0).toLocaleString()}
            </div>
            <div className="text-xs pl-text-muted">points</div>
          </div>
        </div>
      </div>

      {friend.badges?.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-sm font-bold pl-text">Milestones</div>
          <div className="flex flex-wrap gap-4">
            {friend.badges.map((id) => (
              <div key={id} className="flex w-16 flex-col items-center gap-1">
                <BadgeMedal badge={{ id, earned: true, tier: friend.tier || 2 }} size={48} />
                <span className="text-center text-[10px] font-medium pl-text-muted">
                  {badgeName(id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onCheer?.(friend.id)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl pl-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
      >
        <Send size={16} /> Send {friend.name} a cheer
      </button>
    </Modal>
  )
}
