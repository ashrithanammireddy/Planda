import { useEffect, useState } from 'react'
import pandaUrl from '../assets/planda-panda.png'
import wordmarkUrl from '../assets/planda-wordmark.png'

const MESSAGES = [
  'Warming up the bamboo…',
  'Tidying your calendar…',
  'Lining up your week…',
  'Almost ready…',
]

// Brief branded loading screen shown right after sign-in / onboarding, before
// the planner appears. Mint-on-white to match the login page.
export default function PostLoginLoader({ name }) {
  const [msg, setMsg] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 480)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      {/* soft mint aura */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(560px 560px at 50% 42%, rgba(52,169,138,0.20), transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <img
          src={pandaUrl}
          alt=""
          className="h-24 w-24 object-contain planda-breathe"
        />
        <span
          role="img"
          aria-label="planda"
          className="mt-3 inline-block"
          style={{
            width: 150,
            height: 50,
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

        {/* progress bar */}
        <div className="mt-7 h-1.5 w-56 overflow-hidden rounded-full bg-[#e7efe9]">
          <div
            className="h-full rounded-full planda-fill"
            style={{ background: '#34a98a' }}
          />
        </div>

        <p className="mt-4 h-5 text-sm font-semibold text-[#2f8f76]">
          {name ? `Hi ${name} — ` : ''}
          {MESSAGES[msg]}
        </p>
      </div>
    </div>
  )
}
