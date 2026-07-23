import { useEffect, useRef, useState } from 'react'
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import pandaUrl from '../assets/planda-panda.png'
import wordmarkUrl from '../assets/planda-wordmark.png'
import {
  firebaseEnabled,
  signInWithGoogle,
  signInWithApple,
  signUpWithEmail,
  signInWithEmail,
  authMessage,
} from '../lib/firebase'

// Soft mint fog blobs that slowly drift on their own. `home` is the resting
// position (fraction of the viewport); each blob also gets nudged away from the
// cursor, so moving the mouse pushes the fog around and it settles back after.
const BLOBS = [
  { home: [0.16, 0.22], size: 700, color: 'rgba(45,168,136,0.40)', sx: 0.02, sy: 0.026, ph: 0.0, amp: 34 },
  { home: [0.84, 0.18], size: 660, color: 'rgba(108,201,170,0.36)', sx: 0.018, sy: 0.024, ph: 1.6, amp: 38 },
  { home: [0.8, 0.8], size: 740, color: 'rgba(45,168,136,0.34)', sx: 0.022, sy: 0.02, ph: 3.0, amp: 36 },
  { home: [0.18, 0.82], size: 680, color: 'rgba(150,222,198,0.40)', sx: 0.024, sy: 0.019, ph: 4.3, amp: 34 },
  { home: [0.5, 0.48], size: 800, color: 'rgba(120,205,175,0.30)', sx: 0.016, sy: 0.02, ph: 2.2, amp: 42 },
]

// Official multicolor Google "G".
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// Apple logo glyph.
function AppleGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

// Login gate. Clean light-mint background with drifting mint fog the cursor
// pushes around. Sign-in is front-end only for now (the provider sheets are a
// realistic mock: they collect an account email, no real OAuth yet).
export default function Login({ onDone, notice = '' }) {
  const layerRef = useRef(null)
  const blobRefs = useRef([])
  const mouse = useRef({ x: -9999, y: -9999 })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [signupName, setSignupName] = useState('')
  const [emailMode, setEmailMode] = useState('signin') // 'signin' | 'signup'
  const [info, setInfo] = useState('') // soft, non-error guidance
  const [toast, setToast] = useState(notice)
  // Emails we've confirmed already have an account, so a wrong password on them
  // shows a real error instead of bouncing to create-account.
  const knownExisting = useRef(new Set())
  const [provider, setProvider] = useState(null) // 'google' | 'apple' | null
  const [pStep, setPStep] = useState(1) // 1 = email, 2 = password
  const [providerEmail, setProviderEmail] = useState('')
  const [providerPass, setProviderPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const validProviderEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(providerEmail.trim())

  // When Firebase is configured, use the provider's REAL popup. A cancelled or
  // failed sign-in stays out. Without keys, fall back to the demo sheet.
  const handleProvider = async (p) => {
    if (!firebaseEnabled) {
      openProvider(p)
      return
    }
    setAuthError('')
    setBusy(true)
    try {
      await (p === 'google' ? signInWithGoogle() : signInWithApple())
      // onAuthStateChanged in App flips us into the app; no onDone needed.
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setAuthError('Could not sign in. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  // Real email + password via Firebase (create account or sign in). Falls back
  // to the demo pass-through when Firebase isn't configured.
  const submitEmail = async () => {
    if (!firebaseEnabled) {
      if (validEmail) onDone('account')
      return
    }
    if (!validEmail || password.length < 6) return
    if (emailMode === 'signup') {
      if (!signupName.trim()) return
      if (password !== confirmPass) {
        setAuthError('Passwords do not match.')
        return
      }
    }
    setAuthError('')
    setInfo('')
    setBusy(true)
    try {
      if (emailMode === 'signup') await signUpWithEmail(email, password, signupName)
      else await signInWithEmail(email, password)
      // onAuthStateChanged in App flips us into the app.
    } catch (err) {
      const code = err?.code
      const key = email.trim().toLowerCase()
      if (emailMode === 'signin' && code === 'auth/wrong-password') {
        // Enumeration protection OFF: Firebase tells us the account exists and
        // only the password is wrong — show a clean error, never flip.
        setAuthError('Incorrect password. Please try again.')
      } else if (emailMode === 'signin' && code === 'auth/user-not-found') {
        // Enumeration protection OFF: definitely a new person.
        setEmailMode('signup')
        setInfo("Looks like you're new here — finish creating your account.")
      } else if (emailMode === 'signin' && code === 'auth/invalid-credential') {
        // Enumeration protection ON: ambiguous. Use what we've learned.
        if (knownExisting.current.has(key)) {
          setAuthError('Incorrect password. Please try again.')
        } else {
          setEmailMode('signup')
          setInfo("Looks like you're new here — finish creating your account.")
        }
      } else if (emailMode === 'signup' && code === 'auth/email-already-in-use') {
        // Definitive: they already have an account — send them back to sign in.
        knownExisting.current.add(key)
        setEmailMode('signin')
        setInfo('You already have an account. Enter your password to sign in.')
      } else {
        setAuthError(authMessage(code))
      }
    } finally {
      setBusy(false)
    }
  }

  const openProvider = (p) => {
    setProviderEmail('')
    setProviderPass('')
    setPStep(1)
    setProvider(p)
  }
  const providerNext = () => {
    if (pStep === 1) {
      if (validProviderEmail) setPStep(2)
      return
    }
    if (providerPass.length >= 4) {
      setProvider(null)
      onDone('account')
    }
  }

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
    const REACH = 380 // how close the cursor must be to catch a blob
    const CARRY = 0.85 // how strongly a sweep drags the fog along
    const MAX = 240 // cap so fog never flies off screen
    const last = { x: mouse.current.x, y: mouse.current.y }
    const vel = { x: 0, y: 0 }
    let raf = 0

    const tick = (now) => {
      const t = (now - start) / 1000
      const W = window.innerWidth
      const H = window.innerHeight
      // Smoothed cursor velocity: the direction/speed the mouse is sweeping.
      vel.x = vel.x * 0.82 + (mouse.current.x - last.x) * 0.18
      vel.y = vel.y * 0.82 + (mouse.current.y - last.y) * 0.18
      last.x = mouse.current.x
      last.y = mouse.current.y

      BLOBS.forEach((b, i) => {
        const driftX = Math.sin(t * b.sx * 6.28 + b.ph) * b.amp
        const driftY = Math.cos(t * b.sy * 6.28 + b.ph) * b.amp
        const o = offsets[i]
        const cx = b.home[0] * W + driftX + o.x
        const cy = b.home[1] * H + driftY + o.y
        const dist = Math.hypot(cx - mouse.current.x, cy - mouse.current.y)
        if (!reduce && dist < REACH) {
          // Carry the blob ALONG the sweep direction (not away from the cursor),
          // strongest right under the cursor. Feels like pushing fog with a hand.
          const infl = (REACH - dist) / REACH
          o.x += vel.x * infl * CARRY
          o.y += vel.y * infl * CARRY
        }
        // Fog slowly relaxes back toward home once you stop pushing.
        o.x *= 0.95
        o.y *= 0.95
        if (o.x > MAX) o.x = MAX
        else if (o.x < -MAX) o.x = -MAX
        if (o.y > MAX) o.y = MAX
        else if (o.y < -MAX) o.y = -MAX
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
        style={{ filter: 'blur(80px)' }}
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
            disabled={busy}
            onClick={() => handleProvider('google')}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <GoogleG size={18} />
            Continue with Google
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleProvider('apple')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span className="-mt-0.5">
              <AppleGlyph size={16} />
            </span>
            Continue with Apple
          </button>

          <div className="my-1 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span className="h-px flex-1 bg-black/10" />
            or
            <span className="h-px flex-1 bg-black/10" />
          </div>

          {firebaseEnabled && emailMode === 'signup' && (
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
                placeholder="Your name"
                className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
            />
          </div>

          {firebaseEnabled && (
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
                placeholder={emailMode === 'signup' ? 'Create a password (6+ characters)' : 'Password'}
                className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
              />
            </div>
          )}

          {firebaseEnabled && emailMode === 'signup' && (
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-black/10 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
              />
            </div>
          )}

          <button
            type="button"
            disabled={
              busy ||
              !validEmail ||
              (firebaseEnabled && password.length < 6) ||
              (firebaseEnabled &&
                emailMode === 'signup' &&
                (!signupName.trim() || password !== confirmPass))
            }
            onClick={submitEmail}
            className="w-full rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: '#34a98a' }}
          >
            {!firebaseEnabled ? 'Continue' : emailMode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          {firebaseEnabled && (
            <button
              type="button"
              onClick={() => {
                setAuthError('')
                setInfo('')
                setEmailMode((m) => (m === 'signup' ? 'signin' : 'signup'))
              }}
              className="text-center text-xs font-semibold text-slate-500 transition hover:text-slate-700"
            >
              {emailMode === 'signup'
                ? 'Already have an account? Sign in'
                : 'New to Planda? Create an account'}
            </button>
          )}

          {info && (
            <p className="text-center text-xs font-semibold text-[#2f8f76]">{info}</p>
          )}
          {authError && (
            <p className="text-center text-xs font-semibold text-red-500">{authError}</p>
          )}
        </div>

        {/* Local-only shortcut so you can run it without signing in. This is
            hidden in production builds — the real app requires an account. */}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => onDone('guest')}
            className="mt-4 w-full text-center text-xs font-semibold text-slate-400 transition hover:text-slate-600"
          >
            skip sign-in (local dev only)
          </button>
        )}
      </div>

      {/* Provider sign-in sheet (front-end mock of Google / Apple account choose) */}
      {provider && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
          onClick={() => setProvider(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[380px] max-w-[92%] overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
          >
            <div className="flex flex-col items-center gap-2 px-7 pt-7 text-center">
              {provider === 'google' ? <GoogleG size={26} /> : <AppleGlyph size={26} />}
              <h2 className="text-[17px] font-semibold text-slate-900">
                {pStep === 1
                  ? `Sign in ${provider === 'google' ? 'with Google' : 'with Apple'}`
                  : 'Welcome'}
              </h2>
              <p className="text-sm text-slate-500">
                {pStep === 1 ? 'to continue to Planda' : providerEmail}
              </p>
            </div>

            <div className="px-7 pb-3 pt-5">
              {pStep === 1 ? (
                <>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    {provider === 'google' ? 'Email or phone' : 'Apple Account'}
                  </label>
                  <input
                    type="email"
                    autoFocus
                    value={providerEmail}
                    onChange={(e) => setProviderEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && providerNext()}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/25"
                  />
                </>
              ) : (
                <>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Enter your password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={providerPass}
                    onChange={(e) => setProviderPass(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && providerNext()}
                    placeholder="Password"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/25"
                  />
                </>
              )}
              <p className="mt-2 text-[11px] leading-snug text-slate-400">
                Demo sign-in for the app challenge. Nothing is sent anywhere and
                no real account is used.
              </p>
            </div>

            <div className="flex items-center justify-between px-7 pb-6 pt-2">
              <button
                type="button"
                onClick={() => (pStep === 2 ? setPStep(1) : setProvider(null))}
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              >
                {pStep === 2 ? 'Back' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={pStep === 1 ? !validProviderEmail : providerPass.length < 4}
                onClick={providerNext}
                className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
                style={{ background: provider === 'google' ? '#4285F4' : '#111' }}
              >
                {pStep === 1 ? 'Next' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
