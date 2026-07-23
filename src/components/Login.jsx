import { useEffect, useRef, useState } from 'react'
import { Mail } from 'lucide-react'
import pandaUrl from '../assets/planda-panda.png'
import wordmarkUrl from '../assets/planda-wordmark.png'

// Login gate. Clean light-mint background with a mint spotlight that follows
// the cursor + faint rings. Sign-in is front-end only for now.
export default function Login({ onDone }) {
  const glowRef = useRef(null)
  const [email, setEmail] = useState('')
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  useEffect(() => {
    const move = (e) => {
      const g = glowRef.current
      if (!g) return
      g.style.setProperty('--sx', `${(e.clientX / window.innerWidth) * 100}%`)
      g.style.setProperty('--sy', `${(e.clientY / window.innerHeight) * 100}%`)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden" style={{ background: '#eef5f1' }}>
      {/* faint concentric rings */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, transparent 0 120px, rgba(52,169,138,.09) 121px 123px, transparent 124px),' +
            'radial-gradient(circle at 50% 42%, transparent 0 210px, rgba(52,169,138,.07) 211px 213px, transparent 214px),' +
            'radial-gradient(circle at 50% 42%, transparent 0 320px, rgba(52,169,138,.05) 321px 323px, transparent 324px)',
        }}
      />
      {/* cursor spotlight */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(420px 420px at var(--sx,50%) var(--sy,42%), rgba(52,169,138,.30), transparent 70%)',
        }}
      />

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
