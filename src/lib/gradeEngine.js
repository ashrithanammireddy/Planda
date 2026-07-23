// Weighted grade calculator.
//
// A class's grades look like:
//   { categories: [{ id, name, weight }], items: [{ id, name, categoryId, earned, possible, hypothetical }] }
// Category grade = sum(earned) / sum(possible) across its items.
// Overall = weighted average across categories that actually have items
// (weights renormalized so empty categories don't drag the grade).

export const DEFAULT_CATEGORIES = [
  { id: 'tests', name: 'Tests', weight: 40 },
  { id: 'quizzes', name: 'Quizzes', weight: 20 },
  { id: 'homework', name: 'Homework', weight: 20 },
  { id: 'projects', name: 'Projects', weight: 20 },
]

const LETTERS = [
  [97, 'A+'], [93, 'A'], [90, 'A-'],
  [87, 'B+'], [83, 'B'], [80, 'B-'],
  [77, 'C+'], [73, 'C'], [70, 'C-'],
  [67, 'D+'], [63, 'D'], [60, 'D-'],
  [0, 'F'],
]

export function letterGrade(percent) {
  if (percent == null || Number.isNaN(percent)) return '—'
  for (const [min, letter] of LETTERS) if (percent >= min) return letter
  return 'F'
}

// Unweighted 4.0 GPA points from a percent.
const GPA_POINTS = [
  [93, 4.0], [90, 3.7], [87, 3.3], [83, 3.0], [80, 2.7],
  [77, 2.3], [73, 2.0], [70, 1.7], [67, 1.3], [63, 1.0], [60, 0.7], [0, 0.0],
]
export function gradePoints(percent) {
  if (percent == null) return null
  for (const [min, pts] of GPA_POINTS) if (percent >= min) return pts
  return 0
}

// Final-grade calculator (Bessy-style): given the current overall %, how much
// the final is worth (% of the whole grade), and a target overall %, what do
// you need on the final?  target = current*(1-w) + final*w  ->  solve final.
export function neededOnFinal(current, finalWeightPct, target) {
  const w = (Number(finalWeightPct) || 0) / 100
  if (w <= 0) return { invalid: true }
  if (current == null) return { noData: true }
  const needed = (target - current * (1 - w)) / w
  if (needed <= 0) return { needed: 0, alreadyMet: true }
  if (needed > 100) return { needed, impossible: true }
  return { needed }
}

// Returns { percent: number|null, byCategory: [{ id, name, weight, percent }] }
export function calcOverallGrade(cls, { includeHypothetical = false } = {}) {
  const categories = cls?.categories || []
  const items = (cls?.items || []).filter(
    (i) => includeHypothetical || !i.hypothetical
  )

  const byCategory = categories.map((c) => {
    const own = items.filter((i) => i.categoryId === c.id)
    const possible = own.reduce((s, i) => s + (Number(i.possible) || 0), 0)
    const earned = own.reduce((s, i) => s + (Number(i.earned) || 0), 0)
    const percent = possible > 0 ? (earned / possible) * 100 : null
    return { id: c.id, name: c.name, weight: Number(c.weight) || 0, percent, count: own.length }
  })

  const active = byCategory.filter((c) => c.percent != null && c.weight > 0)
  const totalWeight = active.reduce((s, c) => s + c.weight, 0)
  const percent =
    totalWeight > 0
      ? active.reduce((s, c) => s + c.percent * c.weight, 0) / totalWeight
      : null

  return { percent, byCategory }
}

// Binary-searches the minimum score (out of `possible`) on a new upcoming
// assignment in `categoryId` that lifts the overall grade to `target` percent.
// What-if (hypothetical) assignments already added ARE counted.
export function solveRequiredScore(cls, target, { categoryId, possible }) {
  const base = cls?.items || []
  const cats = cls?.categories || []
  const catId = categoryId || cats[0]?.id
  const max = Number(possible) || 100

  const tryScore = (s) => {
    const probe = {
      id: '__probe__',
      categoryId: catId,
      earned: s,
      possible: max,
      hypothetical: false,
    }
    const probed = { ...cls, items: [...base, probe] }
    return calcOverallGrade(probed, { includeHypothetical: true }).percent ?? 0
  }

  if (tryScore(max) < target) return { impossible: true, best: tryScore(max) }
  if (tryScore(0) >= target) return { score: 0, percent: max ? 0 : 0, alreadyMet: true }

  let lo = 0
  let hi = max
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (tryScore(mid) >= target) hi = mid
    else lo = mid
  }
  return { score: Math.ceil(hi), percent: max ? (Math.ceil(hi) / max) * 100 : 0 }
}
