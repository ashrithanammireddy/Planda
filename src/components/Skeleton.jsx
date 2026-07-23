// Shimmering placeholder shown briefly while the app/fonts settle. Mirrors the
// calendar layout so the load reads as smooth (no spinner).
export default function AppSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="pl-skeleton h-10 w-64 rounded-xl" />
        <div className="pl-skeleton h-10 w-72 rounded-xl" />
      </div>
      <div className="flex flex-col gap-5 lg:h-[calc(100vh-176px)] lg:flex-row">
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="pl-skeleton min-h-[64px] rounded-2xl" />
          ))}
        </div>
        <div className="pl-skeleton hidden w-80 rounded-3xl lg:block" />
      </div>
    </div>
  )
}
