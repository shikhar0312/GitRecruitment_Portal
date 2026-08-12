import { prisma } from '../../config/prisma'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import {
  CreateAllocationInput,
  UpdateAllocationStatusInput,
  AllocationQuery,
  CreateInterviewRoundInput,
  UpdateInterviewRoundInput,
} from './allocation.schema'
import { validateStatusTransition, AllocationStatus } from '../../shared/utils/status-machine'
import { computeMatchScore } from '../../shared/utils/match-score'
import { getSorting } from '../../shared/utils/sorting'
import { logger } from '../../config/logger'
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors'

const allocationInclude = {
  requirement: {
    select: {
      id: true,
      serial_no: true,
      location: true,
      work_mode: true,
      hiring_type: true,
      customer: { select: { id: true, name: true } },
      role: { select: { id: true, title: true } },
    },
  },
  candidate: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      exp_years: true,
      current_role: true,
      availability_status: true,
    },
  },
  creator: {
    select: { id: true, full_name: true },
  },
  interview_rounds: {
    orderBy: { round_number: 'asc' as const },
  },
}

export async function listAllocations(query: AllocationQuery) {
  const { skip, take, page, limit } = getPagination(query)
  const orderBy = getSorting(
    query.sortBy,
    query.sortOrder,
    ['applied_at', 'updated_at', 'match_score', 'status'],
    'applied_at'
  )

  const where = {
    ...(query.status && { status: query.status }),
    ...(query.candidate_id && { candidate_id: query.candidate_id }),
    ...(query.requirement_id && { requirement_id: query.requirement_id }),
    ...(query.customer_id && {
      requirement: { customer_id: query.customer_id },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.allocations.findMany({
      where,
      skip,
      take,
      orderBy,
      include: allocationInclude,
    }),
    prisma.allocations.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getAllocationById(id: string) {
  const allocation = await prisma.allocations.findUnique({
    where: { id },
    include: allocationInclude,
  })

  if (!allocation) throw new NotFoundError('Allocation not found')
  return allocation
}

export async function createAllocation(
  data: CreateAllocationInput,
  createdBy: string
) {
  const requirement = await prisma.requirements.findUnique({
    where: { id: data.requirement_id },
  })
  if (!requirement) throw new NotFoundError('Requirement not found')

  const candidate = await prisma.candidates.findUnique({
    where: { id: data.candidate_id },
    include: { skills: true },
  })
  if (!candidate) throw new NotFoundError('Candidate not found')

  const existing = await prisma.allocations.findUnique({
    where: {
      requirement_id_candidate_id: {
        requirement_id: data.requirement_id,
        candidate_id: data.candidate_id,
      },
    },
  })
  if (existing) throw new ConflictError('This candidate is already allocated to this requirement')

  const match_score = computeMatchScore(candidate, requirement)

  logger.info(
    { candidateId: data.candidate_id, requirementId: data.requirement_id, matchScore: match_score },
    'Allocation created with match score'
  )

  return prisma.allocations.create({
    data: {
      ...data,
      match_score,
      expected_availability: data.expected_availability
        ? new Date(data.expected_availability)
        : undefined,
      created_by: createdBy,
    },
    include: allocationInclude,
  })
}

export async function updateAllocationStatus(
  id: string,
  data: UpdateAllocationStatusInput
) {
  const allocation = await getAllocationById(id)

  logger.info(
    { allocationId: id, from: allocation.status, to: data.status },
    'Allocation status transition requested'
  )

  validateStatusTransition(
    allocation.status as AllocationStatus,
    data.status as AllocationStatus
  )

  return prisma.allocations.update({
    where: { id },
    data: {
      status: data.status,
      rejection_reason: data.rejection_reason,
      offer_date: data.offer_date ? new Date(data.offer_date) : undefined,
      placed_date: data.placed_date ? new Date(data.placed_date) : undefined,
    },
    include: allocationInclude,
  })
}

// ─── Interview Rounds ───────────────────────────────────────

export async function addInterviewRound(
  allocationId: string,
  data: CreateInterviewRoundInput
) {
  const allocation = await getAllocationById(allocationId)

  const hasFailedRound = allocation.interview_rounds.some(
    (round) => round.outcome === 'failed'
  )

  if (hasFailedRound) {
    throw new ValidationError(
      'Cannot schedule a new round — a previous round has a failed outcome'
    )
  }

  const allowedRoundTypesByStatus: Record<string, string[]> = {
    shortlisted: ['screening'],
    screening: ['screening'],
    interviewing: ['technical', 'hr', 'cultural_fit', 'final'],
    offered: [],
    placed: [],
    rejected: [],
    withdrawn: [],
  }

  const allowedTypes = allowedRoundTypesByStatus[allocation.status] ?? []

  if (!allowedTypes.includes(data.round_type)) {
    throw new ValidationError(
      `Cannot schedule a '${data.round_type}' round while allocation status is '${allocation.status}'`
    )
  }

  const round = await prisma.interview_rounds.create({
    data: {
      ...data,
      allocation_id: allocationId,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
    },
  })

  // Sync allocation status when a round is first scheduled
  if (allocation.status === 'shortlisted') {
    await prisma.allocations.update({
      where: { id: allocationId },
      data: { status: 'screening' },
    })
  } else if (
    allocation.status === 'screening' &&
    ['technical', 'hr', 'cultural_fit', 'final'].includes(data.round_type)
  ) {
    await prisma.allocations.update({
      where: { id: allocationId },
      data: { status: 'interviewing' },
    })
  }

  logger.info(
    { allocationId, roundType: data.round_type },
    'Interview round scheduled'
  )

  return round
}

export async function updateInterviewRound(
  allocationId: string,
  roundId: string,
  data: UpdateInterviewRoundInput
) {
  await getAllocationById(allocationId)

  const existingRound = await prisma.interview_rounds.findUnique({
    where: { id: roundId },
  })

  if (!existingRound) throw new NotFoundError('Interview round not found')

  if (
    existingRound.outcome !== null &&
    data.outcome !== undefined &&
    data.outcome !== existingRound.outcome
  ) {
    throw new ValidationError(
      'Cannot change the outcome of a round that has already been recorded'
    )
  }

  const round = await prisma.interview_rounds.update({
    where: { id: roundId },
    data: {
      ...data,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
    },
  })

  logger.info(
    { allocationId, roundId, outcome: data.outcome },
    'Interview round updated'
  )

  return round
}

export async function deleteInterviewRound(allocationId: string, roundId: string) {
  await getAllocationById(allocationId)

  const round = await prisma.interview_rounds.findUnique({
    where: { id: roundId },
  })

  if (!round) throw new NotFoundError('Interview round not found')

  if (round.outcome !== null) {
    throw new ValidationError(
      'Cannot delete a round that already has a recorded outcome'
    )
  }

  await prisma.interview_rounds.delete({ where: { id: roundId } })

  logger.info({ allocationId, roundId }, 'Interview round deleted')

  return { id: roundId }
}

export async function recalculateMatchScore(id: string) {
  const allocation = await prisma.allocations.findUnique({
    where: { id },
    include: {
      candidate: { include: { skills: true } },
      requirement: true,
    },
  })

  if (!allocation) throw new NotFoundError('Allocation not found')

  const match_score = computeMatchScore(allocation.candidate, allocation.requirement)

  return prisma.allocations.update({
    where: { id },
    data: { match_score },
    include: allocationInclude,
  })
}
