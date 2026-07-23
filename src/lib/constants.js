// Static configuration shared across Planda.

export const VIEWS = ['Day', 'Week', 'Month', 'Year']

export const ASSESSMENT_TYPES = ['Test', 'Quiz', 'Exam', 'Project']

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Generic calendar items (tasks / events) created via the FAB "Add Item" flow.
export const ITEM_CATEGORIES = [
  { name: 'Personal', color: '#a5b4fc' },
  { name: 'School', color: '#6ee7b7' },
  { name: 'Work', color: '#fdba74' },
  { name: 'Health', color: '#fca5a5' },
  { name: 'Other', color: '#c4b5fd' },
]
export const ITEM_TYPES = ['Task', 'Event']
export const PRIORITIES = ['Low', 'Medium', 'High']

export function categoryColor(name) {
  return ITEM_CATEGORIES.find((c) => c.name === name)?.color || '#c4b5fd'
}

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

// Theme presets shown in Settings. "Default" is a neutral grey (the standard).
export const DEFAULT_THEME_COLOR = '#ececec'
export const THEME_PRESETS = [
  { name: 'Default', value: DEFAULT_THEME_COLOR },
  { name: 'Mint', value: '#bcdcd3' },
  { name: 'Pink', value: '#f0c7c7' },
  { name: 'Sky', value: '#cfe1f5' },
  { name: 'Lavender', value: '#e2dbf6' },
  { name: 'Peach', value: '#f8ddc8' },
  { name: 'Butter', value: '#f6ecc5' },
  { name: 'Dark', value: '#20242c' },
]

export const STUDY_SESSION_COLOR = '#bbf7d0' // green pill used for generated study blocks
export const DEFAULT_STUDY_TIME = '09:00'

export const STORAGE_KEY = 'planda.state.v1'

// Generic example classes so a fresh install isn't empty. Users can rename,
// recolor, or delete these in Settings → Manage Classes.
export const SEED_CLASSES = [
  { name: 'Mathematics', color: '#a5b4fc' },
  { name: 'Science', color: '#6ee7b7' },
  { name: 'History', color: '#fde68a' },
  { name: 'Literature', color: '#fdba74' },
  { name: 'Art', color: '#f0abfc' },
]
