import {
  Flame,
  CheckCheck,
  Waves,
  Target,
  CalendarCheck,
  BookOpen,
  Flag,
  Handshake,
  Trophy,
  Lock,
  Award,
} from 'lucide-react'

// Vector medals: a vibrant colored seal (per badge) with a clean white face and
// a bold icon. Tier adds flair — bronze is clean, silver gets an accent ring,
// gold gets a golden rim + shine + sparkles. Locked = lightly dimmed with a
// small corner lock so the design still peeks through.

const ICONS = {
  streak: Flame, tasks: CheckCheck, focus: Waves, session: Target,
  consistency: CalendarCheck, sessions: BookOpen, goal: Flag,
  share: Handshake, mvp: Trophy,
}

// light (top highlight) → base (frame) → deep (stroke + icon)
const PALETTE = {
  streak: { light: '#ffb877', base: '#f97316', deep: '#c2540c' },
  tasks: { light: '#86efac', base: '#22c55e', deep: '#15803d' },
  focus: { light: '#93c5fd', base: '#3b82f6', deep: '#1d4ed8' },
  session: { light: '#fcd34d', base: '#f59e0b', deep: '#b45309' },
  consistency: { light: '#c4b5fd', base: '#8b5cf6', deep: '#6d28d9' },
  sessions: { light: '#5eead4', base: '#14b8a6', deep: '#0f766e' },
  goal: { light: '#f9a8d4', base: '#ec4899', deep: '#be185d' },
  share: { light: '#67e8f9', base: '#06b6d4', deep: '#0e7490' },
  mvp: { light: '#fde68a', base: '#f5c518', deep: '#b7860b' },
}
const LOCKED = { light: '#eef2f6', base: '#cbd3dd', deep: '#94a3b8' }
const GOLD_RIM = '#e9ab16'

function sealPath(cx, cy, outer, inner, bumps = 34) {
  const pts = []
  for (let i = 0; i < bumps; i++) {
    const ang = (i / bumps) * Math.PI * 2
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(cx + Math.cos(ang) * r).toFixed(2)},${(cy + Math.sin(ang) * r).toFixed(2)}`)
  }
  return `M${pts.join(' L')} Z`
}
const SEAL = sealPath(32, 32, 31, 28.5)
const star = (cx, cy, r) =>
  `M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`

export default function BadgeMedal({ badge, size = 64 }) {
  const earned = badge.earned
  const tier = earned ? badge.tier || 1 : 0
  const p = earned ? PALETTE[badge.id] || PALETTE.mvp : LOCKED
  const Icon = ICONS[badge.id] || Award
  const gid = `bdg-${badge.id}-${tier}`
  const rim = tier === 3 ? GOLD_RIM : p.deep

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={badge.name}>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <radialGradient id={gid} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="100%" stopColor={p.base} />
          </radialGradient>
        </defs>

        {/* colored fluted seal */}
        <path d={SEAL} fill={`url(#${gid})`} stroke={rim} strokeWidth={tier === 3 ? 2 : 1.5} strokeLinejoin="round" />

        {/* clean white face */}
        <circle cx="32" cy="32" r="21" fill="#ffffff" />
        <circle cx="32" cy="32" r="21" fill="none" stroke={p.deep} strokeWidth="1" opacity="0.35" />

        {/* silver+: colored accent ring */}
        {tier >= 2 && <circle cx="32" cy="32" r="17.5" fill="none" stroke={p.base} strokeWidth="1.4" opacity="0.5" />}

        {/* gold: shine + sparkles */}
        {tier === 3 && (
          <>
            <ellipse cx="24" cy="21" rx="12" ry="6.5" fill="#ffffff" opacity="0.4" transform="rotate(-30 24 21)" />
            <path d={star(51, 15, 3)} fill="#fff6cf" />
            <path d={star(14, 41, 2.2)} fill="#fff6cf" />
          </>
        )}
      </svg>

      {/* icon — visible even when locked (dimmed) for a sneak peek */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={size * 0.36} strokeWidth={2.5} color={p.deep} style={{ opacity: earned ? 1 : 0.45 }} />
      </div>

      {/* locked: small corner lock, not a full cover */}
      {!earned && (
        <span
          className="absolute flex items-center justify-center rounded-full bg-slate-500 text-white shadow ring-2 ring-white"
          style={{ width: size * 0.3, height: size * 0.3, right: -1, bottom: -1 }}
        >
          <Lock size={size * 0.16} />
        </span>
      )}
    </div>
  )
}
