import pandaUrl from '../assets/planda-book.png'

// Planda's hand-drawn panda mascot (transparent PNG).
export default function PandaLogo({ size = 40, className = '' }) {
  return (
    <img
      src={pandaUrl}
      width={size}
      height={size}
      alt="Planda"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
