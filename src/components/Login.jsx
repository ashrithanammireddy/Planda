import { useEffect, useRef, useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import pandaUrl from '../assets/planda-panda.png'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Soft mint fog blobs that slowly drift on their own. `home` is the resting
// position (fraction of the viewport); each blob also gets nudged away from the
// cursor, so moving the mouse pushes the fog around and it settles back after.
const BLOBS = [
  { home: [0.28, 0.32], size: 520, color: 'rgba(45,168,136,0.62)', sx: 0.13, sy: 0.17, ph: 0.0, amp: 26 },
  { home: [0.72, 0.28], size: 460, color: 'rgba(108,201,170,0.58)', sx: 0.11, sy: 0.15, ph: 1.7, amp: 30 },
  { home: [0.5, 0.62], size: 600, color: 'rgba(45,168,136,0.55)', sx: 0.09, sy: 0.12, ph: 3.1, amp: 34 },
  { home: [0.24, 0.72], size: 420, color: 'rgba(150,222,198,0.60)', sx: 0.14, sy: 0.1, ph: 4.4, amp: 28 },
  { home: [0.8, 0.74], size: 440, color: 'rgba(45,168,136,0.50)', sx: 0.1, sy: 0.16, ph: 5.6, amp: 32 },
  { home: [0.55, 0.2], size: 360, color: 'rgba(120,205,175,0.55)', sx: 0.12, sy: 0.13, ph: 2.4, amp: 24 },
]

// Login gate. Clean light-mint background with drifting mint fog the cursor
// pushes around. Sign-in is front-end only for now.
export default function Login({ onDone, notice = '' }) {
  const layerRef = useRef(null)
  const blobRefs = useRef([])
  const mouse = useRef({ x: -9999, y: -9999 })
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState(notice)
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  // Show the log-out confirmation toast briefly, then let it fade away.
  useEffect(() => {
    if (!notice) return
    setToast(notice)
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [notice])

  // Drift + cursor-repulsion loop. Each blob eases toward (idle drift + push),
  // so the fog looks alive and gets shoved around by the mouse, then relaxes.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const move = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', move)

    const offsets = BLOBS.map(() => ({ x: 0, y: 0 }))
    const start = performance.now()
    const PUSH_RADIUS = 420
    const PUSH_STRENGTH = 300
    let raf = 0

    const tick = (now) => {
      const t = (now - start) / 1000
      const W = window.innerWidth
      const H = window.innerHeight
      BLOBS.forEach((b, i) => {
        const driftX = Math.sin(t * b.sx * 6.28 + b.ph) * b.amp
        const driftY = Math.cos(t * b.sy * 6.28 + b.ph) * b.amp
        const cx = b.home[0] * W + driftX
        const cy = b.home[1] * H + driftY
        const dx = cx - mouse.current.x
        const dy = cy - mouse.current.y
        const dist = Math.hypot(dx, dy)
        let px = 0
        let py = 0
        if (!reduce && dist < PUSH_RADIUS && dist > 0.01) {
          const f = (PUSH_RADIUS - dist) / PUSH_RADIUS
          px = (dx / dist) * f * PUSH_STRENGTH
          py = (dy / dist) * f * PUSH_STRENGTH
        }
        const o = offsets[i]
        // Snappy on the push (shovel), slow on the settle (fog relaxing back).
        const ease = Math.hypot(px, py) > Math.hypot(o.x, o.y) ? 0.16 : 0.04
        o.x += (px - o.x) * ease
        o.y += (py - o.y) * ease
        const el = blobRefs.current[i]
        if (el) el.style.transform = `translate3d(${driftX + o.x}px, ${driftY + o.y}px, 0)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden" style={{ background: '#ffffff' }}>
      {/* log-out confirmation toast */}
      <div
        className={`pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_12px_30px_rgba(20,40,34,0.18)] backdrop-blur">
          <CheckCircle2 size={17} className="text-[#34a98a]" />
          {toast || 'Logged out successfully'}
        </div>
      </div>

      {/* drifting mint fog the cursor pushes around */}
      <div
        ref={layerRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ filter: 'blur(44px)' }}
      >
        {BLOBS.map((b, i) => (
          <div
            key={i}
            ref={(el) => (blobRefs.current[i] = el)}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${b.home[0] * 100}%`,
              top: `${b.home[1] * 100}%`,
              width: b.size,
              height: b.size,
              marginLeft: -b.size / 2,
              marginTop: -b.size / 2,
              background: `radial-gradient(circle at 50% 50%, ${b.color}, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* card */}
      <div className="relative z-20 w-[360px] max-w-[88%] rounded-[26px] border border-white/60 bg-white/85 p-8 shadow-[0_30px_70px_rgba(20,40,34,0.18)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <img src={pandaUrl} alt="Planda" className="h-20 w-20 object-contain" />
          <span
            aria-label="planda"
            role="img"
            style={{
              width: 132,
              height: 44,
              backgroundColor: '#15201c',
              WebkitMaskImage: `url(${wordmarkUrl})`,
              maskImage: `url(${wordmarkUrl})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => onDone('account')}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-[#4285F4] ring-1 ring-black/5">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => onDone('account')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            <span className="text-base leading-none"></span>
            Continue with Apple
          </button>

          <div className="my-1 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span className="h-px flex-1 bg-black/10" />
            or
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && validEmail && onDone('account')}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
            />
          </div>
          <button
            type="button"
            disabled={!validEmail}
            onClick={() => onDone('account')}
            className="w-full rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: '#34a98a' }}
          >
            Continue
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDone('guest')}
          className="mt-4 w-full text-center text-xs font-semibold text-slate-500 transition hover:text-slate-700"
        >
          or keep going without an account
        </button>
      </div>
    </div>
  )
}
