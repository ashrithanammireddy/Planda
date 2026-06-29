// Static configuration shared across Planda.

export const VIEWS = ['Day', 'Week', 'Month', 'Year']

export const ASSESSMENT_TYPES = ['Test', 'Quiz', 'Exam', 'Project']

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// How aggressively to study based on difficulty — multiplies the daily minutes
// and controls how many days before the due date the plan starts.
export const DIFFICULTY_LEAD_DAYS = {
  Easy: 5,
  Medium: 10,
  Hard: 18,
}

export const DEFAULT_ASSESSMENT_EMOJIS = {
  Exam: '📚',
  Test: '📋',
  Quiz: '📝',
  Project: '🎯',
}

// Palette offered when creating a class (matches the soft tones in the design).
export const CLASS_COLORS = [
  '#86efac', // green
  '#fde68a', // yellow
  '#a5b4fc', // indigo
  '#6ee7b7', // emerald
  '#fdba74', // orange
  '#fca5a5', // red
  '#f0abfc', // fuchsia
  '#7dd3fc', // sky
  '#c4b5fd', // violet
  '#fcd34d', // amber
]

export const STUDY_SESSION_COLOR = '#bbf7d0' // green pill used for generated study blocks
export const DEFAULT_STUDY_TIME = '09:00'

export const STORAGE_KEY = 'planda.state.v1'

// Seed data so a fresh install looks alive (mirrors the demo screenshots).
export const SEED_CLASSES = [
  { name: 'AWS Cloud Fundamentals', color: '#86efac' },
  { name: 'English', color: '#fde68a' },
  { name: 'AP Physics C: Mechanics', color: '#a5b4fc' },
  { name: 'AP Computer Science A', color: '#6ee7b7' },
  { name: 'Spanish 4 Honors', color: '#fdba74' },
  { name: 'AP Calculus AB', color: '#fca5a5' },
]
