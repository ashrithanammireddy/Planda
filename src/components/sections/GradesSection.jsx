import { useMemo, useState } from 'react'
import { Plus, Trash2, Target, FlaskConical } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import {
  calcOverallGrade,
  letterGrade,
  solveRequiredScore,
  DEFAULT_CATEGORIES,
} from '../../lib/gradeEngine'

const field = 'pl-field rounded-xl border px-3 py-2 text-sm transition'
const TARGETS = [
  ['A', 93], ['A-', 90], ['B+', 87], ['B', 83], ['B-', 80],
  ['C+', 77], ['C', 73], ['C-', 70], ['D', 63],
]

export default function GradesSection() {
  const {
    classes,
    grades,
    gradeAddItem,
    gradeDeleteItem,
    gradeUpdateItem,
    gradeSetWeight,
  } = useStore()

  const [classId, setClassId] = useState(classes[0]?.id || '')
  const [includeWhatIf, setIncludeWhatIf] = useState(true)
  const [form, setForm] = useState({ name: '', categoryId: '', earned: '', possible: '' })
  const [whatIfNew, setWhatIfNew] = useState(false)
  const [target, setTarget] = useState('A-')
  const [solveCat, setSolveCat] = useState('')
  const [solvePts, setSolvePts] = useState(100)

  const cls = useMemo(
    () => grades[classId] || { categories: DEFAULT_CATEGORIES, items: [] },
    [grades, classId]
  )
  const cats = cls.categories
  const catName = (id) => cats.find((c) => c.id === id)?.name || id

  const overall = useMemo(
    () => calcOverallGrade(cls, { includeHypothetical: includeWhatIf }),
    [cls, includeWhatIf]
  )

  const solution = useMemo(() => {
    const targetPct = TARGETS.find(([l]) => l === target)?.[1] ?? 90
    return solveRequiredScore(cls, targetPct, {
      categoryId: solveCat || cats[0]?.id,
      possible: Number(solvePts) || 100,
    })
  }, [cls, target, solveCat, solvePts, cats])

  if (!classes.length) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold pl-text">Grades</h1>
        <div className="rounded-2xl border pl-border pl-surface p-8 text-center text-sm pl-text-muted">
          Add a class in Settings first, then track its grades here.
        </div>
      </div>
    )
  }

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

  const pct = overall.percent
  const accent = 'var(--planda-accent)'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold pl-text">Grades</h1>
        <select
          className={field}
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Overall */}
      <div className="mb-4 flex items-center gap-5 rounded-3xl border pl-border pl-surface p-5">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl pl-accent-soft">
          <span className="text-3xl font-extrabold pl-accent-text leading-none">
            {letterGrade(pct)}
          </span>
          <span className="mt-1 text-sm font-semibold pl-accent-text">
            {pct == null ? '—' : `${pct.toFixed(1)}%`}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold pl-text">Category breakdown</span>
            <label className="flex items-center gap-1.5 text-xs pl-text-muted">
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
                  onChange={(e) =>
                    gradeSetWeight(classId, c.id, Number(e.target.value) || 0)
                  }
                  className="w-14 rounded-lg border pl-border pl-surface-2 px-2 py-1 text-xs pl-text"
                  title="Weight %"
                />
                <span className="w-20 shrink-0 truncate text-xs pl-text-muted">
                  {c.name}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full pl-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.percent ?? 0}%`, backgroundColor: accent }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold pl-text">
                  {c.percent == null ? '—' : `${Math.round(c.percent)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What do I need */}
      <div className="mb-4 rounded-3xl border pl-border pl-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="pl-accent-text" />
          <h2 className="font-bold pl-text">What do I need?</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <span className="pl-text-muted">To get an</span>
          <select className={field} value={target} onChange={(e) => setTarget(e.target.value)}>
            {TARGETS.map(([l]) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <span className="pl-text-muted">on an upcoming</span>
          <select
            className={field}
            value={solveCat || cats[0]?.id}
            onChange={(e) => setSolveCat(e.target.value)}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="pl-text-muted">out of</span>
          <input
            type="number"
            className={`${field} w-20`}
            value={solvePts}
            onChange={(e) => setSolvePts(e.target.value)}
          />
          <span className="pl-text-muted">pts:</span>
        </div>
        <div className="mt-3 rounded-xl pl-accent-soft px-4 py-3 text-sm font-semibold pl-accent-text">
          {overall.percent == null
            ? 'Add some grades first, then I can tell you exactly what you need.'
            : solution.impossible
              ? `Even a perfect score only gets you to ${solution.best.toFixed(1)}%. That target isn't reachable with one assignment.`
              : solution.alreadyMet
                ? "You're already at or above that, nice."
                : `You need at least ${solution.score}/${Number(solvePts) || 100} (${solution.percent.toFixed(0)}%).`}
        </div>
      </div>

      {/* Assignments */}
      <div className="rounded-3xl border pl-border pl-surface p-5">
        <h2 className="mb-3 font-bold pl-text">Assignments</h2>
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
            <input
              type="checkbox"
              checked={whatIfNew}
              onChange={(e) => setWhatIfNew(e.target.checked)}
            />
            what-if
          </label>
          <button
            type="submit"
            className="rounded-xl pl-accent px-3 text-white transition hover:brightness-110"
          >
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
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-xl border pl-border px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate pl-text">
                  {it.hypothetical && (
                    <FlaskConical
                      size={13}
                      className="mr-1 inline pl-accent-text"
                    />
                  )}
                  {it.name}
                </span>
                <span className="shrink-0 text-xs pl-text-muted">{catName(it.categoryId)}</span>
                <span
                  className="shrink-0 font-semibold pl-text"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {it.earned}/{it.possible}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    gradeUpdateItem(classId, it.id, { hypothetical: !it.hypothetical })
                  }
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
