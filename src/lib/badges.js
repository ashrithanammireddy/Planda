import { FRIENDS } from './friends'

// Milestone badges. Two kinds:
//  - tiered: earned in three bamboo tiers from a growing stat (metric + tiers)
//  - bool:   a one-off achievement (check() -> true/false)
// computeBadges takes stats + a small context (weeklyGoal) so the social/goal
// badges can compare against your squad.

const TIER_LABEL = ['', '🎋', '🎋🎋', '🎋🎋🎋']
const TIER_POINTS = [0, 40, 90, 160]

export const BADGES = [
  {
    id: 'streak', name: 'Streak Keeper', emoji: '🔥',
    desc: 'Keep a school-day streak going (weekends & holidays are free).',
    unit: 'day streak', tiers: [3, 7, 30], metric: (s) => s.streak || 0,
  },
  {
    id: 'tasks', name: 'Task Slayer', emoji: '✅',
    desc: 'Check off what you plan.',
    unit: 'tasks done', tiers: [10, 50, 150], metric: (s) => s.itemsDone || 0,
  },
  {
    id: 'focus', name: 'Deep Diver', emoji: '🌊',
    desc: 'Rack up focused study time.',
    unit: 'focus minutes', tiers: [60, 300, 1000], metric: (s) => s.focusMinutes || 0,
  },
  {
    id: 'session', name: 'In the Zone', emoji: '🎯',
    desc: 'Go long in a single focus session.',
    unit: 'minute session', tiers: [25, 50, 90], metric: (s) => s.longestFocus || 0,
  },
  {
    id: 'consistency', name: 'Steady Panda', emoji: '📆',
    desc: 'Show up on many different days.',
    unit: 'active days', tiers: [5, 20, 60], metric: (s) => s.activeDayCount || 0,
  },
  // Goal + squad achievements (one-off)
  {
    id: 'goal', name: 'Goal Getter', emoji: '🎯',
    desc: 'Hit your weekly focus goal.',
    bool: true,
    check: (s, c) => (c.weeklyGoal || 0) > 0 && (s.weeklyMinutes || 0) >= c.weeklyGoal,
  },
  {
    id: 'share', name: 'Pulling Weight', emoji: '🤝',
    desc: 'Study more than your share of the squad goal.',
    bool: true,
    check: (s, c) => {
      const friends = c.friends || FRIENDS
      const fairShare = squadGoalMinutes(c.weeklyGoal || 0, friends) / (friends.length + 1)
      return fairShare > 0 && (s.weeklyMinutes || 0) >= fairShare
    },
  },
  {
    id: 'mvp', name: 'Squad MVP', emoji: '🏅',
    desc: 'Top the weekly leaderboard.',
    bool: true,
    check: (s, c) => {
      const friends = c.friends || FRIENDS
      const top = friends.reduce((m, f) => Math.max(m, f.weeklyMinutes || 0), 0)
      // Only a real squad earns MVP; solo (no friends) can't top a leaderboard.
      return friends.length > 0 && (s.weeklyMinutes || 0) > 0 && (s.weeklyMinutes || 0) >= top
    },
  },
]

// Combined weekly goal of you + your squad. Friends default to the demo squad
// when a real list isn't passed (signed-out preview).
export function squadGoalMinutes(myGoal = 0, friends = FRIENDS) {
  return myGoal + friends.reduce((s, f) => s + (f.goal || 0), 0)
}

// ctx: { weeklyGoal, friends } where friends is the REAL leaderboard (each with
// weeklyMinutes / goal) so the squad badges reflect actual standings.
export function computeBadges(stats, ctx = {}) {
  return BADGES.map((b) => {
    if (b.bool) {
      const earned = !!b.check(stats, ctx)
      return {
        id: b.id, name: b.name, emoji: b.emoji, desc: b.desc,
        bool: true, earned, tier: earned ? 1 : 0,
        tierLabel: '', value: earned ? 1 : 0, nextTarget: null,
        pct: earned ? 100 : 0,
      }
    }
    const value = b.metric(stats)
    let tier = 0
    for (let i = 0; i < b.tiers.length; i++) if (value >= b.tiers[i]) tier = i + 1
    const earned = tier > 0
    const nextTarget = tier < b.tiers.length ? b.tiers[tier] : null
    return {
      id: b.id, name: b.name, emoji: b.emoji, desc: b.desc, unit: b.unit,
      value, tier, tierLabel: TIER_LABEL[tier], earned, nextTarget,
      pct: nextTarget ? Math.min(100, Math.round((value / nextTarget) * 100)) : 100,
    }
  })
}

export function badgePointsFrom(badges) {
  return badges.reduce((sum, b) => sum + (TIER_POINTS[b.tier] || 0), 0)
}
