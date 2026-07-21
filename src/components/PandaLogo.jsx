// Planda's panda mascot — a clean, crisp inline SVG so it scales to any size
// (header mark, favicon, empty states) without a raster asset.
export default function PandaLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Planda"
    >
      {/* cream backdrop so the mark reads on any theme */}
      <circle cx="32" cy="32" r="31" fill="#f4f1e8" />

      {/* ears */}
      <circle cx="15" cy="16" r="8.5" fill="#141414" />
      <circle cx="49" cy="16" r="8.5" fill="#141414" />

      {/* head */}
      <circle cx="32" cy="34" r="21.5" fill="#ffffff" stroke="#141414" strokeWidth="2.4" />

      {/* eye patches */}
      <ellipse cx="24" cy="32" rx="6.6" ry="8.4" fill="#141414" transform="rotate(-12 24 32)" />
      <ellipse cx="40" cy="32" rx="6.6" ry="8.4" fill="#141414" transform="rotate(12 40 32)" />

      {/* eyes */}
      <circle cx="24.6" cy="33" r="3.3" fill="#ffffff" />
      <circle cx="39.4" cy="33" r="3.3" fill="#ffffff" />
      <circle cx="25.1" cy="33.4" r="1.7" fill="#141414" />
      <circle cx="38.9" cy="33.4" r="1.7" fill="#141414" />

      {/* glasses */}
      <g fill="none" stroke="#9aa0a6" strokeWidth="1.5">
        <circle cx="24" cy="32" r="9" />
        <circle cx="40" cy="32" r="9" />
        <line x1="31" y1="31" x2="33" y2="31" />
        <line x1="15.2" y1="30.5" x2="9.5" y2="29" strokeLinecap="round" />
        <line x1="48.8" y1="30.5" x2="54.5" y2="29" strokeLinecap="round" />
      </g>

      {/* nose + mouth */}
      <ellipse cx="32" cy="41" rx="2.4" ry="1.6" fill="#141414" />
      <path
        d="M32 42.6 v1.8 M32 44.4 q-2.4 2 -4.4 .3 M32 44.4 q2.4 2 4.4 .3"
        stroke="#141414"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
