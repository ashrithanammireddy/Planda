import { useEffect, useRef, useState } from 'react'

const SIZE = 160 // starting circle diameter (px)

// Shown right after sign-in: a frosted overlay with the animated panda in a
// circle. After a beat it zooms out / flies into the "Ask Planda" icon, then
// hands off to the app. onDone fires when the transition is finished.
export default function PostLoginLoader({ onDone }) {
  const circleRef = useRef(null)
  const [moved, setMoved] = useState(false)
  const [xform, setXform] = useState('none')
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const finish = () => onDone?.()
    if (reduce) {
      const t = setTimeout(finish, 300)
      return () => clearTimeout(t)
    }

    // Play the panda briefly, then fly the circle into the Ask Planda icon.
    const startMove = setTimeout(() => {
      const anchor =
        ['panda-anchor-desktop', 'panda-anchor-mobile']
          .map((id) => document.getElementById(id))
          .find((el) => el && el.getBoundingClientRect().width > 0)

      if (anchor) {
        const a = anchor.getBoundingClientRect()
        const ax = a.left + a.width / 2
        const ay = a.top + a.height / 2
        const dx = ax - window.innerWidth / 2
        const dy = ay - window.innerHeight / 2
        const scale = a.width / SIZE
        setXform(`translate(${dx}px, ${dy}px) scale(${scale})`)
      } else {
        setXform('translate(0, -42vh) scale(0.28)')
      }
      setMoved(true)
      setFade(true)
    }, 450)

    const done = setTimeout(finish, 450 + 620)
    return () => {
      clearTimeout(startMove)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{
        background: 'color-mix(in srgb, var(--planda-bg) 55%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity: fade ? 0 : 1,
        transition: 'opacity 560ms ease-out',
      }}
    >
      <div
        ref={circleRef}
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
          transition: moved ? 'transform 620ms cubic-bezier(0.5, 0.05, 0.2, 1)' : 'none',
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
