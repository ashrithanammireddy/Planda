import { AVATARS, DEFAULT_AVATAR } from '../lib/avatars'

// Shared little features so every animal reads as the same "portrait" style.
const Eyes = ({ y = 34, dx = 6.5, r = 2.6 }) => {
  const d = Number(dx)
  return (
    <g fill="#2b2b2b">
      <circle cx={32 - d} cy={y} r={r} />
      <circle cx={32 + d} cy={y} r={r} />
      <circle cx={32 - d + 0.8} cy={y - 0.9} r={r * 0.34} fill="#fff" />
      <circle cx={32 + d + 0.8} cy={y - 0.9} r={r * 0.34} fill="#fff" />
    </g>
  )
}
const Blush = ({ y = 40, dx = 11 }) => {
  const d = Number(dx)
  return (
    <g fill="#ff9db0" opacity="0.55">
      <ellipse cx={32 - d} cy={y} rx="2.7" ry="1.7" />
      <ellipse cx={32 + d} cy={y} rx="2.7" ry="1.7" />
    </g>
  )
}
const Smile = ({ y = 41 }) => (
  <path
    d={`M28.5 ${y} Q32 ${y + 3} 35.5 ${y}`}
    fill="none"
    stroke="#6b5b53"
    strokeWidth="1.3"
    strokeLinecap="round"
  />
)

const ANIMALS = {
  panda: (
    <g>
      <circle cx="18" cy="20" r="8" fill="#2b2b2b" />
      <circle cx="46" cy="20" r="8" fill="#2b2b2b" />
      <circle cx="18" cy="20" r="3.6" fill="#4b4b4b" />
      <circle cx="46" cy="20" r="3.6" fill="#4b4b4b" />
      <circle cx="32" cy="37" r="18.5" fill="#f8f8f6" />
      <g transform="rotate(22 25 36)"><ellipse cx="25" cy="36" rx="5" ry="6.6" fill="#2b2b2b" /></g>
      <g transform="rotate(-22 39 36)"><ellipse cx="39" cy="36" rx="5" ry="6.6" fill="#2b2b2b" /></g>
      <circle cx="25.5" cy="36" r="2.4" fill="#fff" />
      <circle cx="38.5" cy="36" r="2.4" fill="#fff" />
      <circle cx="26" cy="36.4" r="1.2" fill="#2b2b2b" />
      <circle cx="38" cy="36.4" r="1.2" fill="#2b2b2b" />
      <ellipse cx="32" cy="43" rx="2.3" ry="1.6" fill="#2b2b2b" />
      <path d="M29.5 46 Q32 48.4 34.5 46" fill="none" stroke="#2b2b2b" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  ),
  fox: (
    <g>
      <path d="M14 20 L24 30 L18 34 Z" fill="#ef9d54" />
      <path d="M50 20 L40 30 L46 34 Z" fill="#ef9d54" />
      <path d="M16 22 L22 29 L19 31 Z" fill="#2b2b2b" />
      <path d="M48 22 L42 29 L45 31 Z" fill="#2b2b2b" />
      <ellipse cx="32" cy="35" rx="18" ry="16" fill="#ef9d54" />
      <path d="M32 30 Q22 44 32 50 Q42 44 32 30 Z" fill="#fdf3ea" />
      <Eyes />
      <ellipse cx="32" cy="42" rx="2.2" ry="1.6" fill="#2b2b2b" />
      <Blush y={40} dx="12" />
    </g>
  ),
  cat: (
    <g>
      <path d="M16 18 L26 30 L14 30 Z" fill="#9aa3ad" />
      <path d="M48 18 L38 30 L50 30 Z" fill="#9aa3ad" />
      <path d="M18 21 L24 29 L16.5 29 Z" fill="#ffd1dc" />
      <path d="M46 21 L40 29 L47.5 29 Z" fill="#ffd1dc" />
      <ellipse cx="32" cy="36" rx="18" ry="16" fill="#aab2bb" />
      <Eyes />
      <path d="M32 39 l-2 2 l2 1.4 l2 -1.4 Z" fill="#ff9db0" />
      <g stroke="#e9edf1" strokeWidth="1" strokeLinecap="round">
        <line x1="18" y1="40" x2="10" y2="38" />
        <line x1="18" y1="42" x2="10" y2="43" />
        <line x1="46" y1="40" x2="54" y2="38" />
        <line x1="46" y1="42" x2="54" y2="43" />
      </g>
    </g>
  ),
  bear: (
    <g>
      <circle cx="19" cy="21" r="7" fill="#a9805a" />
      <circle cx="45" cy="21" r="7" fill="#a9805a" />
      <circle cx="19" cy="21" r="3.5" fill="#c79c74" />
      <circle cx="45" cy="21" r="3.5" fill="#c79c74" />
      <ellipse cx="32" cy="37" rx="19" ry="17" fill="#b78a63" />
      <ellipse cx="32" cy="42" rx="9" ry="7" fill="#e9d3ba" />
      <Eyes y={33} />
      <ellipse cx="32" cy="40" rx="2.4" ry="1.7" fill="#2b2b2b" />
      <Smile y={44} />
    </g>
  ),
  bunny: (
    <g>
      <rect x="21" y="4" width="7" height="24" rx="3.5" fill="#f3f0ee" />
      <rect x="36" y="4" width="7" height="24" rx="3.5" fill="#f3f0ee" />
      <rect x="23" y="7" width="3" height="18" rx="1.5" fill="#ffd1dc" />
      <rect x="38" y="7" width="3" height="18" rx="1.5" fill="#ffd1dc" />
      <ellipse cx="32" cy="38" rx="17" ry="15" fill="#f6f3f1" />
      <Eyes y={36} />
      <path d="M32 41 l-2 1.6 l2 1.2 l2 -1.2 Z" fill="#ff9db0" />
      <Blush y={44} dx="10.5" />
    </g>
  ),
  koala: (
    <g>
      <circle cx="16" cy="30" r="10" fill="#a7b0b8" />
      <circle cx="48" cy="30" r="10" fill="#a7b0b8" />
      <circle cx="16" cy="30" r="5.5" fill="#cdd4da" />
      <circle cx="48" cy="30" r="5.5" fill="#cdd4da" />
      <ellipse cx="32" cy="37" rx="17" ry="15" fill="#aeb7bf" />
      <Eyes y={34} />
      <ellipse cx="32" cy="42" rx="4.5" ry="5.5" fill="#5c5550" />
      <Blush y={43} dx="12" />
    </g>
  ),
  penguin: (
    <g>
      <ellipse cx="32" cy="35" rx="18" ry="17" fill="#3a3f47" />
      <ellipse cx="32" cy="37" rx="12.5" ry="13" fill="#f9f9f7" />
      <Eyes y={33} dx={5.5} r={2.4} />
      <path d="M32 37 l-4 3 l4 2.2 l4 -2.2 Z" fill="#f5a623" />
      <path d="M32 41.2 l-4 -1 l4 1.8 l4 -1.8 Z" fill="#d98410" />
      <Blush y={43} dx="10.5" />
    </g>
  ),
  frog: (
    <g>
      <circle cx="22" cy="22" r="8" fill="#8bc46a" />
      <circle cx="42" cy="22" r="8" fill="#8bc46a" />
      <circle cx="22" cy="22" r="4" fill="#2b2b2b" />
      <circle cx="42" cy="22" r="4" fill="#2b2b2b" />
      <circle cx="23" cy="21" r="1.3" fill="#fff" />
      <circle cx="43" cy="21" r="1.3" fill="#fff" />
      <ellipse cx="32" cy="38" rx="19" ry="15" fill="#8bc46a" />
      <path d="M20 40 Q32 50 44 40" fill="none" stroke="#4f7d38" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="29" cy="36" r="0.9" fill="#4f7d38" />
      <circle cx="35" cy="36" r="0.9" fill="#4f7d38" />
      <Blush y={41} dx="13" />
    </g>
  ),
  owl: (
    <g>
      <path d="M16 16 L24 26 L14 26 Z" fill="#8a6f52" />
      <path d="M48 16 L40 26 L50 26 Z" fill="#8a6f52" />
      <ellipse cx="32" cy="36" rx="19" ry="17" fill="#9c7f5e" />
      <circle cx="24" cy="34" r="8" fill="#f4ead6" />
      <circle cx="40" cy="34" r="8" fill="#f4ead6" />
      <circle cx="24" cy="34" r="3.6" fill="#2b2b2b" />
      <circle cx="40" cy="34" r="3.6" fill="#2b2b2b" />
      <circle cx="25" cy="33" r="1.2" fill="#fff" />
      <circle cx="41" cy="33" r="1.2" fill="#fff" />
      <path d="M32 40 l-3 3 l3 2 l3 -2 Z" fill="#f5a623" />
    </g>
  ),
  tiger: (
    <g>
      <circle cx="20" cy="22" r="6.5" fill="#f3a94e" />
      <circle cx="44" cy="22" r="6.5" fill="#f3a94e" />
      <ellipse cx="32" cy="36" rx="18" ry="16" fill="#f3a94e" />
      <ellipse cx="32" cy="42" rx="8" ry="6" fill="#fdf1e0" />
      <g stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round">
        <line x1="32" y1="21" x2="32" y2="27" />
        <line x1="26" y1="23" x2="24" y2="28" />
        <line x1="38" y1="23" x2="40" y2="28" />
        <line x1="16" y1="34" x2="20" y2="35" />
        <line x1="48" y1="34" x2="44" y2="35" />
      </g>
      <Eyes y={34} />
      <ellipse cx="32" cy="40" rx="2.2" ry="1.6" fill="#c0603a" />
      <Smile y={44} />
    </g>
  ),
  lion: (
    <g>
      <g fill="#cf8437">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2
          return <circle key={i} cx={32 + Math.cos(a) * 20} cy={35 + Math.sin(a) * 19} r="6.5" />
        })}
      </g>
      <g fill="#e0a253">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 + 0.26
          return <circle key={i} cx={32 + Math.cos(a) * 16} cy={35 + Math.sin(a) * 15} r="5" />
        })}
      </g>
      <circle cx="20" cy="26" r="4.5" fill="#d98b3f" />
      <circle cx="44" cy="26" r="4.5" fill="#d98b3f" />
      <ellipse cx="32" cy="36" rx="16" ry="15" fill="#f0b866" />
      <Eyes y={34} />
      <path d="M32 39 l-2.5 2 h5 Z" fill="#8a5a2b" />
      <path d="M32 41 Q28 45 25 43 M32 41 Q36 45 39 43" fill="none" stroke="#8a5a2b" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  ),
  dog: (
    <g>
      <ellipse cx="14" cy="38" rx="6.5" ry="13" fill="#8a5f3d" transform="rotate(12 14 38)" />
      <ellipse cx="50" cy="38" rx="6.5" ry="13" fill="#8a5f3d" transform="rotate(-12 50 38)" />
      <ellipse cx="32" cy="34" rx="16.5" ry="15" fill="#c89460" />
      <ellipse cx="24" cy="28" rx="6" ry="7" fill="#b07f4e" />
      <ellipse cx="32" cy="41" rx="8.5" ry="7" fill="#efdcc4" />
      <Eyes y={33} />
      <ellipse cx="32" cy="39" rx="2.6" ry="1.9" fill="#2b2b2b" />
      <path d="M30.5 44 a1.5 2 0 0 0 3 0 Z" fill="#ff8fa0" />
      <Blush y={39} dx="12.5" />
    </g>
  ),
  pig: (
    <g>
      <path d="M16 22 L26 26 L20 32 Z" fill="#f4a3b8" />
      <path d="M48 22 L38 26 L44 32 Z" fill="#f4a3b8" />
      <ellipse cx="32" cy="37" rx="18" ry="16" fill="#f6adc0" />
      <Eyes y={33} />
      <ellipse cx="32" cy="42" rx="6.5" ry="5" fill="#ef8fa8" />
      <circle cx="30" cy="42" r="1.1" fill="#c46e86" />
      <circle cx="34" cy="42" r="1.1" fill="#c46e86" />
      <Blush y={40} dx="12.5" />
    </g>
  ),
  hamster: (
    <g>
      <circle cx="21" cy="24" r="5.5" fill="#d9b483" />
      <circle cx="43" cy="24" r="5.5" fill="#d9b483" />
      <circle cx="21" cy="24" r="2.6" fill="#f0dcc0" />
      <circle cx="43" cy="24" r="2.6" fill="#f0dcc0" />
      <ellipse cx="32" cy="37" rx="20" ry="16" fill="#e6c79a" />
      <ellipse cx="32" cy="41" rx="7" ry="5.5" fill="#f6ecda" />
      <Eyes y={34} />
      <ellipse cx="32" cy="40" rx="1.8" ry="1.3" fill="#8a6a44" />
      <Blush y={43} dx="14" />
    </g>
  ),
  deer: (
    <g>
      <g stroke="#8a6a44" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M24 20 L20 8 M20 12 L15 9 M20 12 L23 6" />
        <path d="M40 20 L44 8 M44 12 L49 9 M44 12 L41 6" />
      </g>
      <ellipse cx="15" cy="30" rx="5" ry="8" fill="#c79a68" />
      <ellipse cx="49" cy="30" rx="5" ry="8" fill="#c79a68" />
      <ellipse cx="32" cy="37" rx="16" ry="15" fill="#d3a874" />
      <Eyes y={34} />
      <ellipse cx="32" cy="41" rx="2.3" ry="1.7" fill="#2b2b2b" />
      <circle cx="24" cy="44" r="1.1" fill="#f3e6d2" />
      <circle cx="40" cy="44" r="1.1" fill="#f3e6d2" />
      <Smile y={44} />
    </g>
  ),
  raccoon: (
    <g>
      <circle cx="19" cy="21" r="6.5" fill="#9198a1" />
      <circle cx="45" cy="21" r="6.5" fill="#9198a1" />
      <circle cx="19" cy="21" r="3.2" fill="#5b626b" />
      <circle cx="45" cy="21" r="3.2" fill="#5b626b" />
      <ellipse cx="32" cy="37" rx="18" ry="16.5" fill="#b3bbc3" />
      <path d="M18 34 Q22 29 27 31.5 Q32 34 37 31.5 Q42 29 46 34 Q45 40 39 39.5 Q32 40.5 25 39.5 Q19 40 18 34 Z" fill="#3a3f47" />
      <circle cx="26" cy="35" r="2.4" fill="#fff" />
      <circle cx="38" cy="35" r="2.4" fill="#fff" />
      <circle cx="26" cy="35.3" r="1.3" fill="#2b2b2b" />
      <circle cx="38" cy="35.3" r="1.3" fill="#2b2b2b" />
      <ellipse cx="32" cy="42" rx="2.2" ry="1.6" fill="#2b2b2b" />
      <Smile y={45} />
    </g>
  ),
  sheep: (
    <g fill="#f6f6f8">
      <circle cx="20" cy="20" r="7" /><circle cx="32" cy="15" r="7" />
      <circle cx="44" cy="20" r="7" /><circle cx="14" cy="34" r="7" />
      <circle cx="50" cy="34" r="7" />
      <ellipse cx="16" cy="40" rx="4" ry="6" fill="#e7dccb" />
      <ellipse cx="48" cy="40" rx="4" ry="6" fill="#e7dccb" />
      <ellipse cx="32" cy="39" rx="14" ry="13" fill="#efe6db" />
      <Eyes y={37} />
      <ellipse cx="32" cy="43" rx="2" ry="1.5" fill="#7a6a5c" />
    </g>
  ),
  monkey: (
    <g>
      <circle cx="14" cy="30" r="7.5" fill="#9a6b45" />
      <circle cx="50" cy="30" r="7.5" fill="#9a6b45" />
      <circle cx="14" cy="30" r="4" fill="#d6a877" />
      <circle cx="50" cy="30" r="4" fill="#d6a877" />
      <ellipse cx="32" cy="34" rx="17" ry="15" fill="#a9764e" />
      <path d="M32 23 Q19 25 20 38 Q25 49 32 49 Q39 49 44 38 Q45 25 32 23 Z" fill="#e7c9a6" />
      <Eyes y={33} />
      <ellipse cx="32" cy="40" rx="2" ry="1.4" fill="#7a5535" />
      <Smile y={43} />
    </g>
  ),
}

// Accessories, drawn at fixed positions that suit every portrait.
function Glasses(type) {
  if (!type || type === 'none') return null
  const y = 33
  const bridge = (
    <line x1="28.5" y1={y} x2="35.5" y2={y} stroke="#3a3a3a" strokeWidth="1.4" />
  )
  const arms = (
    <g stroke="#3a3a3a" strokeWidth="1.4" strokeLinecap="round">
      <line x1="20.5" y1={y - 0.5} x2="15" y2={y - 2} />
      <line x1="43.5" y1={y - 0.5} x2="49" y2={y - 2} />
    </g>
  )
  if (type === 'round') {
    return (
      <g fill="none" stroke="#3a3a3a" strokeWidth="1.6">
        <circle cx="25" cy={y} r="5" />
        <circle cx="39" cy={y} r="5" />
        {bridge}
        {arms}
      </g>
    )
  }
  if (type === 'square') {
    return (
      <g fill="none" stroke="#3a3a3a" strokeWidth="1.6">
        <rect x="20" y={y - 4.5} width="10" height="9" rx="2" />
        <rect x="34" y={y - 4.5} width="10" height="9" rx="2" />
        {bridge}
        {arms}
      </g>
    )
  }
  // red-framed cool sunglasses
  return (
    <g>
      <g fill="#22262b" stroke="#e63946" strokeWidth="2" strokeLinejoin="round">
        <path d="M20 29 h10 a1 1 0 0 1 1 1 v3 a4 5 0 0 1 -12 0 v-3 a1 1 0 0 1 1 -1 Z" />
        <path d="M34 29 h10 a1 1 0 0 1 1 1 v3 a4 5 0 0 1 -12 0 v-3 a1 1 0 0 1 1 -1 Z" />
      </g>
      <line x1="30" y1="30" x2="34" y2="30" stroke="#e63946" strokeWidth="2.4" />
      <g stroke="#e63946" strokeWidth="2" strokeLinecap="round">
        <line x1="20.5" y1="29.5" x2="15" y2="27.5" />
        <line x1="43.5" y1="29.5" x2="49" y2="27.5" />
      </g>
      <line x1="22" y1="31" x2="24.5" y2="31" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </g>
  )
}

function Hat(type) {
  if (!type || type === 'none') return null
  if (type === 'beanie') {
    return (
      <g>
        <path d="M17 20 Q32 4 47 20 Z" fill="#3aa98a" />
        <rect x="15" y="18" width="34" height="7" rx="3.5" fill="#2f8f76" />
        <circle cx="32" cy="6" r="3" fill="#e9f6f0" />
      </g>
    )
  }
  if (type === 'cap') {
    return (
      <g>
        <path d="M16 21 A16 15 0 0 1 48 21 Z" fill="#e8604c" />
        <rect x="15" y="19.5" width="34" height="3.4" rx="1.7" fill="#d14e3c" />
        <path d="M46 21 Q57 21 57 25.5 Q50 25 45 23.8 Z" fill="#c94b3a" />
        <circle cx="32" cy="7.5" r="2.2" fill="#d14e3c" />
      </g>
    )
  }
  if (type === 'bow') {
    return (
      <g transform="translate(44 26) scale(0.82)">
        <path d="M0 0 Q-11 -6 -10.5 0 Q-11 6 0 0 Z" fill="#ff7fa3" />
        <path d="M0 0 Q11 -6 10.5 0 Q11 6 0 0 Z" fill="#ff7fa3" />
        <path d="M0 0 Q-11 -6 -10.5 0 Q-11 6 0 0 Z" fill="#ff9db8" opacity="0.5" />
        <rect x="-2.6" y="-3.2" width="5.2" height="6.4" rx="2" fill="#e85f88" />
      </g>
    )
  }
  if (type === 'party') {
    return (
      <g transform="rotate(-13 28 19)">
        <path d="M28 2 L21.5 19 L34.5 19 Z" fill="#8bd0bb" />
        <path d="M28 2 L24.6 10.5 L31.4 10.5 Z" fill="#f5c542" />
        <path d="M25 14.5 h6" stroke="#f5c542" strokeWidth="1.6" />
        <circle cx="28" cy="2" r="2.6" fill="#ff7fa3" />
      </g>
    )
  }
  // crown
  return (
    <g>
      <path d="M17 20 L17 9 L24 15 L32 6 L40 15 L47 9 L47 20 Z" fill="#f5c542" stroke="#e0ad24" strokeWidth="0.8" />
      <circle cx="24" cy="12" r="1.4" fill="#ff7fa3" />
      <circle cx="32" cy="9" r="1.6" fill="#5cc0e8" />
      <circle cx="40" cy="12" r="1.4" fill="#ff7fa3" />
    </g>
  )
}

// Renders one animal avatar with optional glasses + hat. Unknown id -> panda.
export default function AnimalAvatar({
  id = DEFAULT_AVATAR,
  glasses = 'none',
  hat = 'none',
  size = 40,
  className = '',
}) {
  const def = AVATARS.find((a) => a.id === id) || AVATARS[0]
  const animal = ANIMALS[def.id] || ANIMALS.panda
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={def.id}
    >
      <rect width="64" height="64" fill={def.bg} />
      {animal}
      {Glasses(glasses)}
      {Hat(hat)}
    </svg>
  )
}
