// Planda Points + ranks. Points are earned from real activity the app already
// tracks, and map onto named, bamboo-themed ranks so progress feels tangible.

export const RANKS = [
  { name: 'Seedling', emoji: '🌱', min: 0 },
  { name: 'Sprout', emoji: '🌿', min: 120 },
  { name: 'Sapling', emoji: '🎋', min: 350 },
  { name: 'Grove Keeper', emoji: '🐼', min: 750 },
  { name: 'Scholar Panda', emoji: '📚', min: 1400 },
  { name: 'Zen Panda', emoji: '🧘', min: 2400 },
  { name: 'Planda Legend', emoji: '👑', min: 4000 },
]

// Total points from tracked stats. Tuned so a new user climbs quickly at first.
export function computePoints({ stats, badgePoints = 0 }) {
  const s = stats || {}
  return Math.round(
    (s.itemsDone || 0) * 12 +
      (s.focusMinutes || 0) * 0.8 +
      (s.sessionsDone || 0) * 15 +
      (s.activeDayCount || 0) * 20 +
      badgePoints
  )
}

// Resolve a point total to its rank, plus progress toward the next rank.
export function rankFor(points) {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].min) idx = i
  }
  const rank = RANKS[idx]
  const next = RANKS[idx + 1] || null
  const floor = rank.min
  const ceil = next ? next.min : rank.min
  const pct = next
    ? Math.min(100, Math.round(((points - floor) / (ceil - floor)) * 100))
    : 100
  return { index: idx, rank, next, pct, toNext: next ? next.min - points : 0 }
}
