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

function rgbToHsl({ r, g, b }) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Derives a vivid "accent" of the same hue as the chosen background color —
// used for the "today" highlight so it always matches the user's theme vibe.
// `alpha` < 1 returns a translucent version (handy for soft rings).
export function accentColor(bg, { l = 56, alpha = 1 } = {}) {
  const rgb = hexToRgb(bg)
  if (!rgb) return alpha < 1 ? `hsla(245, 60%, ${l}%, ${alpha})` : `hsl(245, 60%, ${l}%)`
  const { h, s } = rgbToHsl(rgb)
  // Near-grey themes have no real hue — forcing saturation would invent a
  // random (often red) tint, so fall back to a neutral slate-blue accent.
  if (s < 12) {
    return alpha < 1
      ? `hsla(220, 14%, ${l}%, ${alpha})`
      : `hsl(220, 14%, ${l}%)`
  }
  // Boost saturation a touch (and floor it) so pastels read as a clear accent.
  const sat = Math.min(70, Math.max(48, s * 1.15))
  return alpha < 1
    ? `hsla(${Math.round(h)}, ${Math.round(sat)}%, ${l}%, ${alpha})`
    : `hsl(${Math.round(h)}, ${Math.round(sat)}%, ${l}%)`
}

// Perceived brightness (0–1). Used to decide light vs dark UI from the theme.
export function luminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
}

export function isColorDark(hex) {
  return luminance(hex) < 0.5
}

// Linearly blends two hex colors. t=0 → a, t=1 → b.
export function mix(a, b, t) {
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  if (!ra || !rb) return a
  const ch = (x, y) => Math.round(x + (y - x) * t)
  const hx = (n) => n.toString(16).padStart(2, '0')
  return `#${hx(ch(ra.r, rb.r))}${hx(ch(ra.g, rb.g))}${hx(ch(ra.b, rb.b))}`
}

// Builds the full set of surface/border/text tokens derived from one theme
// color, adapting for light vs dark backgrounds.
export function themeTokens(bg, isDark) {
  if (isDark) {
    return {
      surface: mix(bg, '#ffffff', 0.1),
      surface2: mix(bg, '#ffffff', 0.17),
      border: mix(bg, '#ffffff', 0.22),
      text: '#f1f3f9',
      textMuted: mix(bg, '#ffffff', 0.62),
    }
  }
  return {
    surface: mix(bg, '#ffffff', 0.82),
    surface2: mix(bg, '#ffffff', 0.66),
    border: mix(bg, '#000000', 0.09),
    text: '#1f2433',
    textMuted: mix(bg, '#000000', 0.45),
  }
}

export function isValidColor(value) {
  if (!value) return false
  const s = new Option().style
  s.color = ''
  s.color = value
  return s.color !== ''
}
