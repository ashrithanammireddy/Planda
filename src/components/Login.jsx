import { useEffect, useRef, useState } from 'react'
import { Mail } from 'lucide-react'
import pandaUrl from '../assets/planda-panda.png'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Login gate. A mint "aura" sits under a soft fog canvas that the cursor wipes
// away (and slowly re-forms). Sign-in is front-end only for now.
export default function Login({ onDone }) {
  const canvasRef = useRef(null)
  const [email, setEmail] = useState('')
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf

    const fog = (alpha) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(196, 224, 214, ${alpha})`
      ctx.fillRect(0, 0, w, h)
    }
    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fog(0.95)
      if (reduce) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,1)'
        ctx.fillRect(0, 0, w, h)
      }
    }
    const wipe = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      const r = 110
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(0,0,0,0.45)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      wipe(p.clientX - rect.left, p.clientY - rect.top)
    }
    const loop = () => {
      fog(0.012) // slowly re-form the fog
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    if (!reduce) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('touchmove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden" style={{ background: '#bcdcd3' }}>
      {/* aura beneath the fog */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full" style={{ background: '#7fd3b0', filter: 'blur(70px)', opacity: 0.8 }} />
        <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full" style={{ background: '#a7d8ea', filter: 'blur(70px)', opacity: 0.75 }} />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full" style={{ background: '#e7d59a', filter: 'blur(70px)', opacity: 0.6 }} />
      </div>
      {/* fog layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full" />

      {/* card */}
      <div className="relative z-20 w-[360px] max-w-[88%] rounded-[26px] border border-white/50 bg-white/80 p-8 shadow-[0_30px_70px_rgba(20,40,34,0.25)] backdrop-blur-md">
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
            onClick={onDone}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-[#4285F4] ring-1 ring-black/5">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={onDone}
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
              onKeyDown={(e) => e.key === 'Enter' && validEmail && onDone()}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
            />
          </div>
          <button
            type="button"
            disabled={!validEmail}
            onClick={onDone}
            className="w-full rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: '#34a98a' }}
          >
            Continue
          </button>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="mt-4 w-full text-center text-xs font-semibold text-slate-500 transition hover:text-slate-700"
        >
          or keep going without an account
        </button>
      </div>
    </div>
  )
}
