import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import {
  requireAdmin,
  requireRecruiterOrAccountManager,
  requireAnyRole,
} from '../../shared/middleware/rbac.middleware'
import {
  RequirementQuerySchema,
  CreateRequirementSchema,
  UpdateRequirementSchema,
  SuggestedCandidatesQuerySchema,
} from './requirement.schema'
import {
  listRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  getSuggestedCandidates,
} from './requirement.service'

export async function requirementRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // All authenticated users can read
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const query = RequirementQuerySchema.parse(request.query)
    const result = await listRequirements(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getRequirementById(id)
    return { success: true, data }
  })

  app.get('/:id/suggested-candidates', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const query = SuggestedCandidatesQuerySchema.parse(request.query)
    const result = await getSuggestedCandidates(id, query)
    return { success: true, ...result }
  })

  // Recruiter, account_manager, admin can create and update
  app.post('/', { preHandler: requireRecruiterOrAccountManager }, async (request, reply) => {
    const body = CreateRequirementSchema.parse(request.body)
    const user = request.user as { id: string }
    const data = await createRequirement(body, user.id)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id', { preHandler: requireRecruiterOrAccountManager }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateRequirementSchema.parse(request.body)
    const data = await updateRequirement(id, body)
    return { success: true, data }
  })

  // Only admin can delete
  app.delete('/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    await deleteRequirement(id)
    return { success: true, message: 'Requirement deleted' }
  })
}
