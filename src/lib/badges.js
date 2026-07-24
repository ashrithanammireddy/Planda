// Milestone badges. Each is earned automatically from tracked stats, with three
// tiers (bamboo levels). computeBadges returns the earned tier + progress so the
// UI can show a trophy shelf and locked/near-complete badges alike.

const TIER_LABEL = ['', '🎋', '🎋🎋', '🎋🎋🎋']
const TIER_POINTS = [0, 40, 90, 160] // points awarded toward your rank per tier

export const BADGES = [
  {
    id: 'streak',
    name: 'Streak Keeper',
    emoji: '🔥',
    desc: 'Stay active day after day.',
    unit: 'day streak',
    tiers: [3, 7, 30],
    metric: (s) => s.streak || 0,
  },
  {
    id: 'tasks',
    name: 'Task Slayer',
    emoji: '✅',
    desc: 'Check off what you plan.',
    unit: 'tasks done',
    tiers: [10, 50, 150],
    metric: (s) => s.itemsDone || 0,
  },
  {
    id: 'focus',
    name: 'Deep Diver',
    emoji: '🌊',
    desc: 'Rack up focused study time.',
    unit: 'focus minutes',
    tiers: [60, 300, 1000],
    metric: (s) => s.focusMinutes || 0,
  },
  {
    id: 'session',
    name: 'In the Zone',
    emoji: '🎯',
    desc: 'Go long in a single focus session.',
    unit: 'minute session',
    tiers: [25, 50, 90],
    metric: (s) => s.longestFocus || 0,
  },
  {
    id: 'consistency',
    name: 'Steady Panda',
    emoji: '📆',
    desc: 'Show up on many different days.',
    unit: 'active days',
    tiers: [5, 20, 60],
    metric: (s) => s.activeDayCount || 0,
  },
  {
    id: 'sessions',
    name: 'Study Machine',
    emoji: '📚',
    desc: 'Complete planned study sessions.',
    unit: 'sessions done',
    tiers: [5, 20, 50],
    metric: (s) => s.sessionsDone || 0,
  },
]

// Evaluate every badge against the stats; returns display-ready records.
export function computeBadges(stats) {
  return BADGES.map((b) => {
    const value = b.metric(stats)
    let tier = 0
    for (let i = 0; i < b.tiers.length; i++) {
      if (value >= b.tiers[i]) tier = i + 1
    }
    const earned = tier > 0
    const nextTarget = tier < b.tiers.length ? b.tiers[tier] : null
    return {
      id: b.id,
      name: b.name,
      emoji: b.emoji,
      desc: b.desc,
      unit: b.unit,
      value,
      tier,
      tierLabel: TIER_LABEL[tier],
      earned,
      nextTarget,
      // progress toward the next tier (or full if maxed)
      pct: nextTarget
        ? Math.min(100, Math.round((value / nextTarget) * 100))
        : 100,
    }
  })
}

// Total rank points contributed by earned badge tiers.
export function badgePointsFrom(badges) {
  return badges.reduce((sum, b) => sum + (TIER_POINTS[b.tier] || 0), 0)
}
