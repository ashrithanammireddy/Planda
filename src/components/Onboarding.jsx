import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import pandaUrl from '../assets/planda-book.png'
import { AVATARS, DEFAULT_AVATAR } from '../lib/avatars'
import AnimalAvatar from './AnimalAvatar'

// Shown once after signing in: set up your local profile.
export default function Onboarding({ onDone }) {
  const { profile, updateProfile } = useStore()
  const [name, setName] = useState(profile.name || '')
  const [school, setSchool] = useState(profile.school || '')
  const [avatar, setAvatar] = useState(profile.avatar || DEFAULT_AVATAR)

  const finish = () => {
    updateProfile({ name: name.trim(), school: school.trim(), avatar })
    onDone()
  }

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden p-4"
      style={{ background: '#eef5f1' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(520px 520px at 50% 30%, rgba(52,169,138,.22), transparent 70%)',
        }}
      />
      <div className="relative z-10 w-[400px] max-w-[90%] rounded-[26px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_70px_rgba(20,40,34,0.18)] backdrop-blur-md">
        <div className="mb-1 flex items-center gap-3">
          <img src={pandaUrl} alt="" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create your profile</h1>
            <p className="text-sm text-slate-500">A couple details and you're set.</p>
          </div>
        </div>

        <div className="mt-5">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Pick an avatar</span>
          <div className="grid grid-cols-6 place-items-center gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAvatar(a.id)}
                className="h-11 w-11 overflow-hidden rounded-full transition hover:-translate-y-0.5"
                style={
                  avatar === a.id
                    ? { outline: '2px solid #34a98a', outlineOffset: 2 }
                    : undefined
                }
                aria-label={a.id}
              >
                <AnimalAvatar id={a.id} size={44} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && finish()}
            placeholder="What should we call you?"
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            School <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Lincoln High School"
            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#34a98a] focus:ring-2 focus:ring-[#34a98a]/25"
          />
        </div>

        <button
          type="button"
          disabled={!name.trim()}
          onClick={finish}
          className="mt-6 w-full rounded-full py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ background: '#34a98a' }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}
