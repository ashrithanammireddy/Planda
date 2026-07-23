import pandaUrl from '../assets/planda-panda.png'

// Shown briefly right after sign-in as a frosted overlay ON TOP of the app, so
// the planner is visible (blurred) behind it. Just the panda, no color of its
// own, so it matches whatever background theme the user has.
export default function PostLoginLoader() {
  return (
    <div
      className="planda-fade fixed inset-0 z-[70] flex items-center justify-center"
      style={{
        background: 'color-mix(in srgb, var(--planda-bg) 60%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <img
        src={pandaUrl}
        alt="Loading"
        className="h-28 w-28 object-contain planda-breathe drop-shadow-sm"
      />
    </div>
  )
}
