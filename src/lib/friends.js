// Simulated squad for the "Study with friends" experience. Real pods will sync
// once accounts exist; until then these make the social features come alive.
export const POD = {
  name: 'Study Squad',
}

// Each friend has their own weekly goal; the squad goal is everyone's combined.
export const FRIENDS = [
  { id: 'zoe', name: 'Zoe', avatar: 'owl', glasses: 'round', hat: 'none', streak: 21, weeklyMinutes: 480, goal: 400, points: 2680, status: 'focusing', tier: 3, badges: ['streak', 'focus', 'session', 'mvp'] },
  { id: 'maya', name: 'Maya', avatar: 'fox', glasses: 'none', hat: 'bow', streak: 12, weeklyMinutes: 320, goal: 300, points: 1520, status: 'focusing', tier: 2, badges: ['tasks', 'consistency', 'goal'] },
  { id: 'leo', name: 'Leo', avatar: 'koala', glasses: 'none', hat: 'beanie', streak: 5, weeklyMinutes: 210, goal: 250, points: 720, status: 'break', tier: 2, badges: ['streak', 'sessions'] },
  { id: 'kai', name: 'Kai', avatar: 'tiger', glasses: 'sun', hat: 'none', streak: 3, weeklyMinutes: 150, goal: 200, points: 300, status: 'offline', tier: 1, badges: ['tasks'] },
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
