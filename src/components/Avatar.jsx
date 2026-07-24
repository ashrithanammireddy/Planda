import AnimalAvatar from './AnimalAvatar'
import { isAnimalAvatar } from '../lib/avatars'

// Renders a profile avatar at a given pixel size. Animal-id avatars render as
// the SVG portrait (clipped round) with optional glasses/hat; anything else (an
// emoji) shows centered in a neutral circle so older/mock avatars still work.
export default function Avatar({ value, glasses = 'none', hat = 'none', size = 40, className = '' }) {
  if (isAnimalAvatar(value)) {
    return (
      <AnimalAvatar
        id={value}
        glasses={glasses}
        hat={hat}
        size={size}
        className={`shrink-0 rounded-full ${className}`}
      />
    )
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full pl-surface-2 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.56, lineHeight: 1 }}
    >
      {value || '🐼'}
    </span>
  )
}
