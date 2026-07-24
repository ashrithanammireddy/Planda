// Built-in cartoon animal avatars. Each is a simple flat SVG "portrait" framed
// in a colored circle, all the same format. Stored on the profile by id.
export const AVATARS = [
  { id: 'panda', bg: '#dbeee6' },
  { id: 'fox', bg: '#ffe4cf' },
  { id: 'cat', bg: '#efe2fb' },
  { id: 'bear', bg: '#f3e3cf' },
  { id: 'bunny', bg: '#ffe1ec' },
  { id: 'koala', bg: '#d9e8f5' },
  { id: 'penguin', bg: '#d5eef7' },
  { id: 'frog', bg: '#dcf0d2' },
  { id: 'owl', bg: '#e6e0f7' },
  { id: 'tiger', bg: '#fdeecb' },
  { id: 'lion', bg: '#ffe6c2' },
  { id: 'dog', bg: '#d7ebfb' },
  { id: 'pig', bg: '#ffe0e8' },
  { id: 'hamster', bg: '#fbeed9' },
  { id: 'deer', bg: '#e3efd6' },
  { id: 'raccoon', bg: '#e3e8ee' },
  { id: 'sheep', bg: '#eee7f7' },
  { id: 'monkey', bg: '#d6efe9' },
]

export const AVATAR_IDS = AVATARS.map((a) => a.id)
export const isAnimalAvatar = (v) => AVATAR_IDS.includes(v)
export const DEFAULT_AVATAR = 'panda'

// Optional accessories layered on top of any animal (same fixed positions).
export const GLASSES = ['none', 'round', 'square', 'sun']
export const HATS = ['none', 'beanie', 'cap', 'bow', 'party', 'crown']
