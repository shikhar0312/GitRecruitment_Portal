import { prisma } from '../../config/prisma'
import { NotFoundError } from '../../shared/errors'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import {
  CreateRequirementInput,
  UpdateRequirementInput,
  RequirementQuery,
} from './requirement.schema'
import { getSorting } from '../../shared/utils/sorting'
import { computeMatchScore } from '../../shared/utils/match-score'

const requirementInclude = {
  customer: {
    select: { id: true, name: true, industry: true, city: true },
  },
  role: {
    select: { id: true, title: true, category: true },
  },
  creator: {
    select: { id: true, full_name: true },
  },
}

export async function listRequirements(query: RequirementQuery) {
  const { skip, take, page, limit } = getPagination(query)
  const orderBy = getSorting(
    query.sortBy,
    query.sortOrder,
    ['created_at', 'priority', 'expected_start_date', 'status'],
    'created_at'
  )

  const where = {
    ...(query.status && { status: query.status }),
    ...(query.hiring_type && { hiring_type: query.hiring_type }),
    ...(query.work_mode && { work_mode: query.work_mode }),
    ...(query.priority && { priority: query.priority }),
    ...(query.billing_entity && { billing_entity: query.billing_entity }),
    ...(query.customer_id && { customer_id: query.customer_id }),
    ...(query.role_id && { role_id: query.role_id }),
    ...(query.search && {
      OR: [
        { location: { contains: query.search, mode: 'insensitive' as const } },
        { job_description: { contains: query.search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.requirements.findMany({
      where,
      skip,
      take,
      orderBy,
      include: requirementInclude,
    }),
    prisma.requirements.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getRequirementById(id: string) {
  const requirement = await prisma.requirements.findUnique({
    where: { id },
    include: requirementInclude,
  })

  if (!requirement) throw new NotFoundError('Requirement not found')
  return requirement
}

export async function createRequirement(
  data: CreateRequirementInput,
  createdBy: string
) {
  const customer = await prisma.customers.findUnique({
    where: { id: data.customer_id },
  })
  if (!customer) throw new NotFoundError('Customer not found')

  const role = await prisma.roles.findUnique({
    where: { id: data.role_id },
  })
  if (!role) throw new NotFoundError('Role not found')

  return prisma.requirements.create({
    data: {
      ...data,
      expected_start_date: data.expected_start_date
        ? new Date(data.expected_start_date)
        : undefined,
      closing_date: data.closing_date
        ? new Date(data.closing_date)
        : undefined,
      created_by: createdBy,
    },
    include: requirementInclude,
  })
}

export async function updateRequirement(
  id: string,
  data: UpdateRequirementInput
) {
  await getRequirementById(id)
  return prisma.requirements.update({
    where: { id },
    data: {
      ...data,
      expected_start_date: data.expected_start_date
        ? new Date(data.expected_start_date)
        : undefined,
      closing_date: data.closing_date
        ? new Date(data.closing_date)
        : undefined,
    },
    include: requirementInclude,
  })
}

export async function deleteRequirement(id: string) {
  await getRequirementById(id)
  return prisma.requirements.delete({ where: { id } })
}

const MIN_SUGGESTION_SCORE = 40

export async function getSuggestedCandidates(
  requirementId: string,
  query: { page: number; limit: number }
) {
  const requirement = await getRequirementById(requirementId)

  const alreadyAllocated = await prisma.allocations.findMany({
    where: { requirement_id: requirementId },
    select: { candidate_id: true },
  })
  const allocatedIds = new Set(alreadyAllocated.map((a) => a.candidate_id))

  const candidates = await prisma.candidates.findMany({
    where: {
      status: 'active',
      id: { notIn: Array.from(allocatedIds) },
    },
    include: { skills: true },
  })

  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: computeMatchScore(candidate, requirement),
    }))
    .filter((entry) => entry.score >= MIN_SUGGESTION_SCORE)
    .sort((a, b) => b.score - a.score)

  const { skip, take, page, limit } = getPagination(query)
  const paginated = scored.slice(skip, skip + take)

  const data = paginated.map(({ candidate, score }) => ({
    id: candidate.id,
    full_name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    current_location: candidate.current_location,
    exp_years: candidate.exp_years,
    current_company: candidate.current_company,
    current_role: candidate.current_role,
    availability_status: candidate.availability_status,
    currency: candidate.currency,
    expected_ctc: candidate.expected_ctc,
    expected_day_rate: candidate.expected_day_rate,
    match_score: score,
    primary_skills: candidate.skills
      .filter((s) => s.is_primary)
      .map((s) => ({ skill: s.skill, proficiency: s.proficiency })),
  }))

  return {
    data,
    meta: getPaginationMeta(scored.length, page, limit),
  }
}
