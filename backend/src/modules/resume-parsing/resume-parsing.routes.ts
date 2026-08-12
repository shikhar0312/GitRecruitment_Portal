import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import { requireRecruiter, requireAnyRole } from '../../shared/middleware/rbac.middleware'
import { ValidationError } from '../../shared/errors'
import { ConfirmResumeSchema } from './resume-parsing.schema'
import {
  uploadAndParseResume,
  getResumeUpload,
  confirmAndSaveCandidate,
} from './resume-parsing.service'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function resumeParsingRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  app.register(multipart, {
    limits: { fileSize: MAX_FILE_SIZE },
  })

  // Upload and parse a resume file
  app.post('/upload', { preHandler: requireRecruiter }, async (request, reply) => {
    const file = await request.file()

    if (!file) throw new ValidationError('No file uploaded')

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError(
        'Invalid file type. Only PDF, JPG, PNG, and WEBP are allowed'
      )
    }

    const buffer = await file.toBuffer()
    const user = request.user as { id: string }

    const result = await uploadAndParseResume(
      buffer,
      file.filename,
      file.mimetype,
      user.id
    )

    return reply.status(201).send({ success: true, data: result })
  })

  // Get upload status and parsed data
  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getResumeUpload(id)
    return { success: true, data }
  })

  // Confirm parsed data and create candidate
  app.post('/:id/confirm', { preHandler: requireRecruiter }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = ConfirmResumeSchema.parse(request.body)
    const user = request.user as { id: string }
    const data = await confirmAndSaveCandidate(id, body, user.id)
    return reply.status(201).send({ success: true, data })
  })
}