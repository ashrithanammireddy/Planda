// Shown briefly right after sign-in as a frosted overlay ON TOP of the app, so
// the planner is visible (blurred) behind it. Plays the animated panda from the
// intro video, cropped to a circle so only the panda shows (no teal / green),
// matching whatever background theme the user has.
export default function PostLoginLoader() {
  return (
    <div
      className="planda-fade fixed inset-0 z-[70] flex items-center justify-center"
      style={{
        background: 'color-mix(in srgb, var(--planda-bg) 55%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="h-40 w-40 overflow-hidden rounded-full shadow-lg ring-2 ring-white/60">
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
