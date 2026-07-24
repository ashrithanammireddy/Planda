// Simulated squad for the "Study with friends" experience. Real pods will sync
// once accounts exist; until then these make the social features come alive.
export const POD = {
  name: 'Study Squad',
  weeklyGoalMinutes: 1500,
}

export const FRIENDS = [
  { id: 'zoe', name: 'Zoe', avatar: 'owl', glasses: 'round', hat: 'none', streak: 21, weeklyMinutes: 480, points: 2680, status: 'focusing' },
  { id: 'maya', name: 'Maya', avatar: 'fox', glasses: 'none', hat: 'bow', streak: 12, weeklyMinutes: 320, points: 1520, status: 'focusing' },
  { id: 'leo', name: 'Leo', avatar: 'koala', glasses: 'none', hat: 'beanie', streak: 5, weeklyMinutes: 210, points: 720, status: 'break' },
  { id: 'kai', name: 'Kai', avatar: 'tiger', glasses: 'sun', hat: 'none', streak: 3, weeklyMinutes: 150, points: 300, status: 'offline' },
]

export const STATUS_LABEL = {
  focusing: 'Focusing',
  break: 'On a break',
  offline: 'Offline',
}

// A little rotating encouragement for the nudge feature.
export const CHEERS = [
  'Keep going! 🔥',
  "You've got this 💪",
  'Lock in! 🔒',
  'Proud of you 🐼',
  'Almost there ✨',
]
