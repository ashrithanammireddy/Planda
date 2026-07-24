import { useEffect, useRef, useState } from 'react'

const SIZE = 160 // starting circle diameter (px)

// Shown right after sign-in: a frosted background with the animated panda in a
// circle. After a beat the circle flies into the "Ask Planda" icon while the
// frosted backdrop clears — the panda circle itself stays fully visible the
// whole way, so you can see where it's going. onDone fires when it lands.
export default function PostLoginLoader({ onDone }) {
  const [moved, setMoved] = useState(false)
  const [xform, setXform] = useState('none')
  const [bgFade, setBgFade] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const finish = () => onDone?.()
    if (reduce) {
      const t = setTimeout(finish, 300)
      return () => clearTimeout(t)
    }

    const startMove = setTimeout(() => {
      const anchor = ['panda-anchor-desktop', 'panda-anchor-mobile']
        .map((id) => document.getElementById(id))
        .find((el) => el && el.getBoundingClientRect().width > 0)

      if (anchor) {
        const a = anchor.getBoundingClientRect()
        const dx = a.left + a.width / 2 - window.innerWidth / 2
        const dy = a.top + a.height / 2 - window.innerHeight / 2
        const scale = a.width / SIZE
        setXform(`translate(${dx}px, ${dy}px) scale(${scale})`)
      } else {
        setXform('translate(0, -42vh) scale(0.28)')
      }
      setMoved(true)
      setBgFade(true)
    }, 950)

    const done = setTimeout(finish, 950 + 900)
    return () => {
      clearTimeout(startMove)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[70]">
      {/* frosted backdrop — clears gently so the app shows through */}
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--planda-bg) 55%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: bgFade ? 0 : 1,
          transition: 'opacity 820ms ease-in-out',
        }}
      />
      {/* the panda circle — travels to Ask Planda, stays fully opaque */}
      <div
        className="fixed overflow-hidden rounded-full shadow-lg ring-2 ring-white/60"
        style={{
          left: '50%',
          top: '50%',
          width: SIZE,
          height: SIZE,
          marginLeft: -SIZE / 2,
          marginTop: -SIZE / 2,
          transform: xform,
          transformOrigin: 'center',
          transition: moved ? 'transform 880ms cubic-bezier(0.5, 0.05, 0.2, 1)' : 'none',
        }}
      >
        <video
          src="/planda-intro.mp4"
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 25%', transform: 'scale(2)' }}
        />
      </div>
    </div>
  )
}
