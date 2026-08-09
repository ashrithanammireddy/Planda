import { useMemo, useState } from 'react'
import { Plus, Trash2, Target, FlaskConical, ChevronLeft } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  calcOverallGrade,
  letterGrade,
  gradePoints,
  neededOnFinal,
  DEFAULT_CATEGORIES,
} from '../../lib/gradeEngine'

const field = 'pl-field rounded-xl border px-3 py-2 text-sm transition'
const TARGETS = [
  ['A', 93], ['A-', 90], ['B+', 87], ['B', 83], ['B-', 80],
  ['C+', 77], ['C', 73], ['C-', 70], ['D', 63],
]

// Calm semantic grade colors that sit well against Planda's mint palette.
function gradeColor(pct) {
  if (pct == null) return 'var(--planda-text-muted)'
  if (pct >= 90) return '#3fae86' // A range
  if (pct >= 80) return '#4f9bb5' // B range
  if (pct >= 70) return '#d3a24d' // C range
  return '#d67f6d' // D and below
}

export default function GradesSection() {
  const { classes, grades, gradeAddItem, gradeDeleteItem, gradeUpdateItem, gradeSetWeight } =
    useStore()

  // null = the dashboard overview; a class id = that class's detail screen.
  const [openId, setOpenId] = useState(null)
  const [includeWhatIf, setIncludeWhatIf] = useState(false)
  const [form, setForm] = useState({ name: '', categoryId: '', earned: '', possible: '' })
  const [whatIfNew, setWhatIfNew] = useState(false)
  const [target, setTarget] = useState('A-')
  const [finalWeight, setFinalWeight] = useState(20)
  const [currentGrade, setCurrentGrade] = useState('')

  const clsFor = (id) => grades[id] || { categories: DEFAULT_CATEGORIES, items: [] }

  // One grade summary per class, used by the dashboard cards and the GPA number.
  const overview = useMemo(
    () =>
      classes.map((c) => {
        const g = calcOverallGrade(clsFor(c.id), { includeHypothetical: false })
        return {
          c,
          percent: g.percent,
          letter: letterGrade(g.percent),
          points: gradePoints(g.percent),
          cats: g.byCategory.filter((x) => x.percent != null),
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, grades]
  )
  const graded = overview.filter((o) => o.percent != null)
  const gpa = graded.length
    ? graded.reduce((s, o) => s + o.points, 0) / graded.length
    : null
  const needAttention = graded.filter((o) => o.percent < 80).length

  if (!classes.length) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold pl-text">Grades</h1>
        <div className="rounded-2xl border pl-border pl-surface p-8 text-center text-sm pl-text-muted">
          Add a class in Settings first, then track its grades here.
        </div>
      </div>
    )
  }

  /* ---------------------------- Overview grid ---------------------------- */
  if (!openId) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-2xl font-bold pl-text">Grades</h1>

        {/* GPA header (no class-average, per design) */}
        <div className="mb-4 flex items-center justify-between rounded-3xl border pl-border pl-surface p-5">
          <div>
            <div
              className="text-4xl font-extrabold leading-none pl-accent-text"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {gpa == null ? '-' : gpa.toFixed(2)}
            </div>
            <div className="mt-1.5 text-xs font-bold uppercase tracking-wide pl-text-muted">
              GPA · {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </div>
          </div>
          {needAttention > 0 && (
            <div className="text-right text-xs font-semibold pl-text-muted">
              {needAttention} to watch
              <div className="text-[11px] font-normal">below a B</div>
            </div>
          )}
        </div>

        {/* Class cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {overview.map((o) => (
            <button
              key={o.c.id}
              type="button"
              onClick={() => setOpenId(o.c.id)}
              className="flex flex-col overflow-hidden rounded-2xl border pl-border pl-surface text-left shadow-sm transition hover:brightness-[.98] hover:-translate-y-0.5"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: o.c.color }} />
              <div className="flex flex-1 flex-col p-3.5">
                <div className="truncate text-sm font-semibold pl-text">{o.c.name}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className="text-[26px] font-extrabold leading-none"
                    style={{ color: gradeColor(o.percent) }}
                  >
                    {o.letter}
                  </span>
                  <span
                    className="text-xs font-semibold pl-text-muted"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {o.percent == null ? 'no grades' : `${o.percent.toFixed(1)}%`}
                  </span>
                </div>
                {/* Always render this row so every card is the same height and
                    the top stripes line up across the grid. */}
                <div className="mt-auto flex gap-1 pt-2.5">
                  {(o.cats.length ? o.cats.slice(0, 4) : [null, null, null]).map(
                    (cat, i) => (
                      <span
                        key={cat ? cat.id : i}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor: cat ? gradeColor(cat.percent) : 'var(--planda-surface-2)',
                        }}
                        title={cat ? `${cat.name}: ${Math.round(cat.percent)}%` : undefined}
                      />
                    )
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ---------------------------- Class detail ---------------------------- */
  const classId = openId
  const cls = clsFor(classId)
  const cats = cls.categories
  const catName = (id) => cats.find((c) => c.id === id)?.name || id
  const theClass = classes.find((c) => c.id === classId)
  const overall = calcOverallGrade(cls, { includeHypothetical: includeWhatIf })

  const targetPct = TARGETS.find(([l]) => l === target)?.[1] ?? 90
  const currentVal = currentGrade !== '' ? Number(currentGrade) : overall.percent
  const need = neededOnFinal(currentVal, finalWeight, targetPct)
  const accent = 'var(--planda-accent)'

  const addItem = (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.possible === '') return
    gradeAddItem(classId, {
      name: form.name.trim(),
      categoryId: form.categoryId || cats[0].id,
      earned: Number(form.earned) || 0,
      possible: Number(form.possible) || 0,
      hypothetical: whatIfNew,
    })
    setForm({ name: '', categoryId: form.categoryId, earned: '', possible: '' })
    setWhatIfNew(false)
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back to the dashboard */}
      <button
        type="button"
        onClick={() => setOpenId(null)}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold pl-text-muted transition hover:pl-text"
      >
        <ChevronLeft size={16} /> All grades
      </button>

      {/* Class header */}
      <div className="mb-4 flex items-center gap-5 rounded-3xl border pl-border pl-surface p-5">
        <div
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'var(--planda-accent-soft)' }}
        >
          <span
            className="text-3xl font-extrabold leading-none"
            style={{ color: gradeColor(overall.percent) }}
          >
            {letterGrade(overall.percent)}
          </span>
          <span
            className="mt-1 text-sm font-semibold pl-text-muted"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {overall.percent == null ? 'no grades' : `${overall.percent.toFixed(1)}%`}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate text-base font-bold pl-text">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ backgroundColor: theClass?.color }}
              />
              {theClass?.name}
            </span>
            <label className="flex shrink-0 items-center gap-1.5 text-xs pl-text-muted">
              <input
                type="checkbox"
                checked={includeWhatIf}
                onChange={(e) => setIncludeWhatIf(e.target.checked)}
              />
              include what-ifs
            </label>
          </div>
          <div className="flex flex-col gap-2">
            {overall.byCategory.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="number"
                  value={c.weight}
                  onChange={(e) => gradeSetWeight(classId, c.id, Number(e.target.value) || 0)}
                  className="w-14 rounded-lg border pl-border pl-surface-2 px-2 py-1 text-xs pl-text"
                  title="Weight %"
                />
                <span className="w-20 shrink-0 truncate text-xs pl-text-muted">{c.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full pl-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.percent ?? 0}%`, backgroundColor: gradeColor(c.percent) }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold pl-text">
                  {c.percent == null ? '-' : `${Math.round(c.percent)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final grade calculator */}
      <div className="mb-4 rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-1 flex items-center gap-2">
          <Target size={18} className="pl-accent-text" />
          <h2 className="font-bold pl-text">Final grade calculator</h2>
        </div>
        <p className="mb-3 text-xs pl-text-muted">
          Works with any school's grading, just enter your current grade from
          your portal (Infinite Campus, Canvas, Schoology).
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
          <span className="pl-text-muted">My current grade is</span>
          <input
            type="number"
            className={`${field} w-24`}
            placeholder={overall.percent != null ? overall.percent.toFixed(1) : 'e.g. 88'}
            value={currentGrade}
            onChange={(e) => setCurrentGrade(e.target.value)}
          />
          <span className="pl-text-muted">%. The final is worth</span>
          <input
            type="number"
            className={`${field} w-20`}
            value={finalWeight}
            onChange={(e) => setFinalWeight(e.target.value)}
          />
          <span className="pl-text-muted">%. To finish with an</span>
          <select className={field} value={target} onChange={(e) => setTarget(e.target.value)}>
            {TARGETS.map(([l]) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <span className="pl-text-muted">overall:</span>
        </div>
        <div className="mt-3 rounded-xl pl-accent-soft px-4 py-3 text-sm font-semibold pl-accent-text">
          {need.noData
            ? 'Add some grades first, then I can tell you what you need on the final.'
            : need.invalid
              ? 'Set how much the final is worth (a percent above 0).'
              : need.alreadyMet
                ? `You've already locked in that grade, even a 0 on the final keeps you at or above ${target}.`
                : need.impossible
                  ? `That's not reachable: you'd need ${need.needed.toFixed(0)}% on the final (over 100%). Aim a bit lower.`
                  : `You need at least ${need.needed.toFixed(1)}% on the final to finish with an ${target}.`}
        </div>
      </div>

      {/* Assignments (optional projection) */}
      <div className="rounded-3xl border pl-border pl-surface p-5">
        <h2 className="font-bold pl-text">Assignments (optional)</h2>
        <p className="mb-3 text-xs pl-text-muted">
          Enter grades to estimate, but your school's real weighting may differ,
          so trust your portal's current grade in the final calculator above.
          Live sync with Infinite Campus / Canvas is coming with accounts.
        </p>
        <form onSubmit={addItem} className="mb-4 flex flex-wrap gap-2">
          <input
            className={`${field} min-w-[8rem] flex-1`}
            placeholder="Assignment name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className={field}
            value={form.categoryId || cats[0]?.id}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className={`${field} w-20`}
            placeholder="Score"
            value={form.earned}
            onChange={(e) => setForm({ ...form, earned: e.target.value })}
          />
          <span className="self-center pl-text-muted">/</span>
          <input
            type="number"
            className={`${field} w-20`}
            placeholder="Total"
            value={form.possible}
            onChange={(e) => setForm({ ...form, possible: e.target.value })}
          />
          <label className="flex items-center gap-1.5 self-center text-xs pl-text-muted">
            <input type="checkbox" checked={whatIfNew} onChange={(e) => setWhatIfNew(e.target.checked)} />
            what-if
          </label>
          <button type="submit" className="rounded-xl pl-accent px-3 text-white transition hover:brightness-110">
            <Plus size={18} />
          </button>
        </form>

        {cls.items.length === 0 ? (
          <p className="py-4 text-center text-sm pl-text-muted">
            No assignments yet. Add real grades, or add "what-if" ones to see how
            future scores would change your grade.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {cls.items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 rounded-xl border pl-border px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate pl-text">
                  {it.hypothetical && <FlaskConical size={13} className="mr-1 inline pl-accent-text" />}
                  {it.name}
                </span>
                <span className="shrink-0 text-xs pl-text-muted">{catName(it.categoryId)}</span>
                <span className="shrink-0 font-semibold pl-text" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {it.earned}/{it.possible}
                </span>
                <button
                  type="button"
                  onClick={() => gradeUpdateItem(classId, it.id, { hypothetical: !it.hypothetical })}
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold pl-text-muted hover:pl-surface-2"
                  title="Toggle what-if"
                >
                  {it.hypothetical ? 'WHAT-IF' : 'REAL'}
                </button>
                <button
                  type="button"
                  onClick={() => gradeDeleteItem(classId, it.id)}
                  className="shrink-0 pl-text-muted hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
