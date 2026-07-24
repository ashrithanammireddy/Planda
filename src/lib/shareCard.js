import pandaUrl from '../assets/planda-book.png'

// Draws a square share card (panda + badge) and returns a PNG data URL.
export function makeBadgeCard({ badge, name }) {
  return new Promise((resolve, reject) => {
    const S = 1080
    const c = document.createElement('canvas')
    c.width = S
    c.height = S
    const ctx = c.getContext('2d')

    const bg = ctx.createLinearGradient(0, 0, 0, S)
    bg.addColorStop(0, '#eef7f2')
    bg.addColorStop(1, '#ffffff')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, S, S)

    ctx.fillStyle = 'rgba(52,169,138,0.12)'
    ctx.beginPath()
    ctx.arc(S / 2, 380, 300, 0, Math.PI * 2)
    ctx.fill()

    const img = new Image()
    img.onload = () => {
      const ps = 300
      ctx.drawImage(img, S / 2 - ps / 2, 150, ps, ps)

      ctx.textAlign = 'center'
      ctx.font = '150px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
      ctx.fillText(badge.emoji, S / 2, 610)

      ctx.fillStyle = '#15201c'
      ctx.font = 'bold 76px Poppins, system-ui, sans-serif'
      ctx.fillText(badge.name, S / 2, 720)

      ctx.fillStyle = '#2f8f76'
      ctx.font = '600 46px Poppins, system-ui, sans-serif'
      ctx.fillText(`${badge.tierLabel}  ·  ${badge.value} ${badge.unit}`, S / 2, 792)

      ctx.fillStyle = '#8a94a6'
      ctx.font = '500 40px Poppins, system-ui, sans-serif'
      ctx.fillText(`${name || 'A Planda student'} · earned on Planda`, S / 2, 968)

      resolve(c.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = pandaUrl
  })
}

// Share the card (native share sheet if available, otherwise download).
export async function shareBadge({ badge, name }) {
  const dataUrl = await makeBadgeCard({ badge, name })
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], `planda-${badge.id}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${badge.name} · Planda` })
      return
    }
  } catch {
    /* fall through to download */
  }
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `planda-${badge.id}.png`
  a.click()
}
