import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import {
  requireAdmin,
  requireRecruiter,
  requireAnyRole,
} from '../../shared/middleware/rbac.middleware'
import {
  CandidateQuerySchema,
  CreateCandidateSchema,
  UpdateCandidateSchema,
  CreateSkillSchema,
  CreateWorkHistorySchema,
  CreateEducationSchema,
  CreateCertificationSchema,
  CreateLanguageSchema,
} from './candidate.schema'
import {
  listCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  addSkill,
  deleteSkill,
  addWorkHistory,
  deleteWorkHistory,
  addEducation,
  deleteEducation,
  addCertification,
  deleteCertification,
  addLanguage,
  deleteLanguage,
} from './candidate.service'

export async function candidateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // All authenticated users can read
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const query = CandidateQuerySchema.parse(request.query)
    const result = await listCandidates(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getCandidateById(id)
    return { success: true, data }
  })

  // Recruiter and admin can create and update
  app.post('/', { preHandler: requireRecruiter }, async (request, reply) => {
    const body = CreateCandidateSchema.parse(request.body)
    const user = request.user as { id: string }
    const data = await createCandidate(body, user.id)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id', { preHandler: requireRecruiter }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateCandidateSchema.parse(request.body)
    const data = await updateCandidate(id, body)
    return { success: true, data }
  })

  // ─── Skills ───────────────────────────────────────────
  app.post('/:id/skills', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateSkillSchema.parse(request.body)
    const data = await addSkill(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.delete('/:id/skills/:skillId', { preHandler: requireRecruiter }, async (request) => {
    const { id, skillId } = request.params as { id: string; skillId: string }
    await deleteSkill(id, skillId)
    return { success: true, message: 'Skill removed' }
  })

  // ─── Work History ─────────────────────────────────────
  app.post('/:id/work-history', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateWorkHistorySchema.parse(request.body)
    const data = await addWorkHistory(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.delete('/:id/work-history/:entryId', { preHandler: requireRecruiter }, async (request) => {
    const { id, entryId } = request.params as { id: string; entryId: string }
    await deleteWorkHistory(id, entryId)
    return { success: true, message: 'Work history entry removed' }
  })

  // ─── Education ────────────────────────────────────────
  app.post('/:id/education', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateEducationSchema.parse(request.body)
    const data = await addEducation(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.delete('/:id/education/:entryId', { preHandler: requireRecruiter }, async (request) => {
    const { id, entryId } = request.params as { id: string; entryId: string }
    await deleteEducation(id, entryId)
    return { success: true, message: 'Education entry removed' }
  })

  // ─── Certifications ───────────────────────────────────
  app.post('/:id/certifications', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateCertificationSchema.parse(request.body)
    const data = await addCertification(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.delete('/:id/certifications/:certId', { preHandler: requireRecruiter }, async (request) => {
    const { id, certId } = request.params as { id: string; certId: string }
    await deleteCertification(id, certId)
    return { success: true, message: 'Certification removed' }
  })

  // ─── Languages ────────────────────────────────────────
  app.post('/:id/languages', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateLanguageSchema.parse(request.body)
    const data = await addLanguage(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.delete('/:id/languages/:langId', { preHandler: requireRecruiter }, async (request) => {
    const { id, langId } = request.params as { id: string; langId: string }
    await deleteLanguage(id, langId)
    return { success: true, message: 'Language removed' }
  })
}