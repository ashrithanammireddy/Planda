// Small color helpers for rendering pills with readable text.

function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return null
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

// Returns a near-black or near-white that reads well on the given background.
export function readableText(bg) {
  const rgb = hexToRgb(bg)
  if (!rgb) return '#1f2433'
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.62 ? '#1f2433' : '#0b3d24'
}

// Mixes a color toward white by `amount` (0..1) — used for soft backgrounds.
export function tint(hex, amount = 0.6) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const mix = (c) => Math.round(c + (255 - c) * amount)
  return `rgb(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)})`
}

export function isValidColor(value) {
  if (!value) return false
  const s = new Option().style
  s.color = ''
  s.color = value
  return s.color !== ''
}
