import { useEffect, useRef, useState } from 'react'

// Brand intro: plays the animated panda once on load, then fades into the app.
// Shows once per tab session and respects reduced-motion.
export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const videoRef = useRef(null)

  const finish = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onDone, 450)
  }

  useEffect(() => {
    // Safety net in case the video can't play (autoplay blocked, bad codec).
    const t = setTimeout(finish, 6000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-[450ms] ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#a7cfca' }}
    >
      <video
        ref={videoRef}
        src="/planda-intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        className="max-h-[78vh] max-w-[88vw] object-contain"
      />
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-8 rounded-full bg-black/10 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-black/15"
      >
        Skip
      </button>
    </div>
  )
}
