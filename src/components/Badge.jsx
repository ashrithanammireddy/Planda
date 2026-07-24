import { Lock } from 'lucide-react'

// Ring gradient per earned tier (bronze / silver / gold); tier 0 = locked grey.
const TIER_RING = {
  0: 'linear-gradient(145deg, #d3d9e0, #aeb7c2)',
  1: 'linear-gradient(145deg, #f0c199, #cf9160)',
  2: 'linear-gradient(145deg, #eef2f7, #b3bfce)',
  3: 'linear-gradient(145deg, #ffe28a, #f4b301)',
}

// A circular badge medallion. Earned badges are full-color with a tiered ring;
// locked ones show the same medal greyed with a small lock, so you can preview
// what you'll earn.
export default function BadgeMedal({ badge, size = 64 }) {
  const earned = badge.earned
  const pad = Math.max(3, Math.round(size * 0.06))
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={badge.name}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: TIER_RING[earned ? badge.tier : 0],
          boxShadow: earned ? '0 4px 10px rgba(20,40,34,0.14)' : 'none',
        }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          inset: pad,
          background: earned ? '#fffdf8' : '#eef0f3',
        }}
      >
        <span
          style={{
            fontSize: size * 0.44,
            lineHeight: 1,
            filter: earned ? 'none' : 'grayscale(1)',
            opacity: earned ? 1 : 0.35,
          }}
        >
          {badge.emoji}
        </span>
      </div>
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex items-center justify-center rounded-full bg-white/85 text-slate-500 shadow"
            style={{ width: size * 0.4, height: size * 0.4 }}
          >
            <Lock size={size * 0.22} />
          </span>
        </div>
      )}
    </div>
  )
}
