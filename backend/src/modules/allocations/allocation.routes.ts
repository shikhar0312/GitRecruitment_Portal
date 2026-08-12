import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import {
  requireRecruiter,
  requireAnyRole,
} from '../../shared/middleware/rbac.middleware'
import {
  AllocationQuerySchema,
  CreateAllocationSchema,
  UpdateAllocationStatusSchema,
  CreateInterviewRoundSchema,
  UpdateInterviewRoundSchema,
} from './allocation.schema'
import {
  listAllocations,
  getAllocationById,
  createAllocation,
  updateAllocationStatus,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  recalculateMatchScore,
} from './allocation.service'

export async function allocationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // All authenticated users can read
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const query = AllocationQuerySchema.parse(request.query)
    const result = await listAllocations(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getAllocationById(id)
    return { success: true, data }
  })

  // Recruiter and admin can create and update
  app.post('/', { preHandler: requireRecruiter }, async (request, reply) => {
    const body = CreateAllocationSchema.parse(request.body)
    const user = request.user as { id: string }
    const data = await createAllocation(body, user.id)
    return reply.status(201).send({ success: true, data })
  })

  app.patch('/:id/status', { preHandler: requireRecruiter }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateAllocationStatusSchema.parse(request.body)
    const data = await updateAllocationStatus(id, body)
    return { success: true, data }
  })

  app.post('/:id/recalculate-score', { preHandler: requireRecruiter }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await recalculateMatchScore(id)
    return { success: true, data }
  })

  // ─── Interview Rounds ─────────────────────────────────
  app.post('/:id/interviews', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateInterviewRoundSchema.parse(request.body)
    const data = await addInterviewRound(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.patch('/:id/interviews/:roundId', { preHandler: requireRecruiter }, async (request) => {
    const { id, roundId } = request.params as { id: string; roundId: string }
    const body = UpdateInterviewRoundSchema.parse(request.body)
    const data = await updateInterviewRound(id, roundId, body)
    return { success: true, data }
  })

  app.delete('/:id/interviews/:roundId', { preHandler: requireRecruiter }, async (request) => {
    const { id, roundId } = request.params as { id: string; roundId: string }
    const data = await deleteInterviewRound(id, roundId)
    return { success: true, ...data }
  })
}
