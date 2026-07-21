import { Users, Flame, Target, Share2 } from 'lucide-react'
import PandaLogo from '../PandaLogo'

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border pl-border pl-surface p-4">
      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl pl-accent-soft pl-accent-text">
        {icon}
      </span>
      <div className="font-semibold pl-text">{title}</div>
      <div className="mt-0.5 text-sm pl-text-muted">{desc}</div>
    </div>
  )
}

// Placeholder for the social layer (needs a backend to go live).
export default function FriendsSection() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold pl-text">Friends</h1>
      <p className="mb-6 text-sm pl-text-muted">
        Studying is easier together. This is coming soon.
      </p>

      <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl border pl-border pl-surface px-6 py-10 text-center">
        <PandaLogo size={72} />
        <div className="text-lg font-bold pl-text">Study with friends</div>
        <p className="max-w-sm text-sm pl-text-muted">
          Accountability pods are on the way: add friends, share class goals, and
          keep each other on streak. Follow-through is a lot easier with someone
          in your corner.
        </p>
        <span className="mt-1 rounded-full pl-accent-soft px-3 py-1 text-xs font-semibold pl-accent-text">
          Coming soon
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Feature
          icon={<Users size={18} />}
          title="Accountability pods"
          desc="Small groups who see each other's streaks and progress."
        />
        <Feature
          icon={<Target size={18} />}
          title="Shared goals"
          desc="Grinding for the same exam? Track it together."
        />
        <Feature
          icon={<Share2 size={18} />}
          title="Shareable wins"
          desc="Post your readiness and 'exam conquered' cards."
        />
      </div>
    </div>
  )
}
