interface CandidateSkill {
  skill: string
  years_exp: number | null
  proficiency: string | null
  is_primary: boolean
}

interface ScoringCandidate {
  exp_years: number
  expected_ctc: number | null | unknown
  expected_day_rate: number | null | unknown
  current_location: string | null
  willing_to_relocate: boolean | null
  availability_status: string
  notice_period_days: number | null
  skills: CandidateSkill[]
}

interface ScoringRequirement {
  min_exp_years: number
  max_exp_years: number
  budget_min: number | null | unknown
  budget_max: number | null | unknown
  budget_currency: string
  hiring_type: string
  location: string
  work_mode: string
  required_skills: string[]
}

export function computeMatchScore(
  candidate: ScoringCandidate,
  requirement: ScoringRequirement
): number {
  let total = 0

  // ─── 1. Skill Match (40 points) ────────────────────────
  const requiredSkills = requirement.required_skills.map((s) => s.toLowerCase())

  if (requiredSkills.length > 0) {
    let skillPoints = 0

    for (const required of requiredSkills) {
      const match = candidate.skills.find(
        (s) => s.skill.toLowerCase() === required
      )

      if (!match) continue

      if (match.is_primary && (match.years_exp ?? 0) >= 3) {
        skillPoints += 1
      } else if (match.is_primary) {
        skillPoints += 0.75
      } else {
        skillPoints += 0.5
      }
    }

    total += (skillPoints / requiredSkills.length) * 40
  } else {
    total += 20
  }

  // ─── 2. Experience Fit (20 points) ────────────────────
  const exp = candidate.exp_years
  const minExp = requirement.min_exp_years
  const maxExp = requirement.max_exp_years

  if (exp >= minExp && exp <= maxExp) {
    total += 20
  } else if (exp > maxExp && exp - maxExp <= 3) {
    total += 15
  } else if (exp > maxExp) {
    total += 5
  } else {
    total += 0
  }

  // ─── 3. Salary / Rate Fit (20 points) ─────────────────
const budgetMin = requirement.budget_min !== null ? Number(requirement.budget_min) : null
const budgetMax = requirement.budget_max !== null ? Number(requirement.budget_max) : null

  const candidateRate =
    requirement.hiring_type === 'contract'
      ? candidate.expected_day_rate !== null
        ? Number(candidate.expected_day_rate)
        : null
      : candidate.expected_ctc !== null
      ? Number(candidate.expected_ctc)
      : null

  if (budgetMin === null || budgetMax === null || candidateRate === null) {
    total += 10
  } else if (candidateRate >= budgetMin && candidateRate <= budgetMax) {
    total += 20
  } else if (candidateRate > budgetMax && candidateRate <= budgetMax * 1.1) {
    total += 10
  } else {
    total += 0
  }

  // ─── 4. Location Fit (10 points) ──────────────────────
  if (requirement.work_mode === 'remote') {
    total += 10
  } else if (
    candidate.current_location
      ?.toLowerCase()
      .includes(requirement.location.toLowerCase())
  ) {
    total += 10
  } else if (candidate.willing_to_relocate) {
    total += 7
  } else {
    total += 0
  }

  // ─── 5. Availability Fit (10 points) ──────────────────
  if (candidate.availability_status === 'immediate') {
    total += 10
  } else if (candidate.availability_status === 'not_looking') {
    total += 0
  } else {
    const days = candidate.notice_period_days ?? 60
    if (days <= 14) {
      total += 8
    } else if (days <= 30) {
      total += 6
    } else if (days <= 60) {
      total += 3
    } else {
      total += 0
    }
  }

  return Math.round(total * 10) / 10
}