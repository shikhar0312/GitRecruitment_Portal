import { FastifyInstance } from 'fastify'
import fs from 'fs'
import multipart from '@fastify/multipart'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import { ValidationError } from '../../shared/errors'
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
  attachCandidateResume,
  getCandidateResumePath,
} from './candidate.service'

const RESUME_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const RESUME_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function candidateRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  app.register(multipart, {
    limits: { fileSize: RESUME_MAX_SIZE },
  })

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

  // ─── Resume file ──────────────────────────────────────
  // Attach an uploaded resume to a candidate (HR's split-screen add flow).
  app.post('/:id/resume', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const file = await request.file()
    if (!file) throw new ValidationError('No file uploaded')
    if (!RESUME_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only PDF, JPG, PNG, and WEBP are allowed')
    }
    const buffer = await file.toBuffer()
    const data = await attachCandidateResume(id, buffer, file.filename)
    return reply.status(201).send({ success: true, data })
  })

  // Stream a candidate's resume back through auth (not a public static dir).
  app.get('/:id/resume', { preHandler: requireAnyRole }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const filePath = await getCandidateResumePath(id)
    return reply.send(fs.createReadStream(filePath))
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