import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import {
  requireAdmin,
  requireRecruiterOrAccountManager,
  requireAnyRole,
} from '../../shared/middleware/rbac.middleware'
import { ValidationError } from '../../shared/errors'
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
import {
  buildTemplateWorkbook,
  parseRequirementsFile,
  commitRequirements,
} from './requirement.import'

const IMPORT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const IMPORT_ALLOWED_EXT = ['.xlsx', '.xls', '.csv']

export async function requirementRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  app.register(multipart, {
    limits: { fileSize: IMPORT_MAX_FILE_SIZE },
  })

  // ─── Excel/CSV bulk import ───────────────────────────────
  // Download a pre-labelled template matching the requirements columns.
  app.get('/import/template', { preHandler: requireAnyRole }, async (_request, reply) => {
    const buffer = buildTemplateWorkbook()
    return reply
      .header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      .header('Content-Disposition', 'attachment; filename="requirements-template.xlsx"')
      .send(buffer)
  })

  // Upload a filled sheet → parse, match clients/roles by name, validate
  // every row, and return a preview (valid rows + per-row errors). Nothing
  // is written to the database here.
  app.post('/import/preview', { preHandler: requireRecruiterOrAccountManager }, async (request) => {
    const file = await request.file()
    if (!file) throw new ValidationError('No file uploaded')

    const lower = file.filename.toLowerCase()
    if (!IMPORT_ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
      throw new ValidationError('Invalid file type. Upload an .xlsx or .csv file')
    }

    const buffer = await file.toBuffer()
    const preview = await parseRequirementsFile(buffer)
    return { success: true, data: preview }
  })

  // Confirm the previewed valid rows → create them in one transaction.
  app.post('/import/commit', { preHandler: requireRecruiterOrAccountManager }, async (request, reply) => {
    const body = request.body as { rows?: unknown[] }
    if (!Array.isArray(body?.rows) || body.rows.length === 0) {
      throw new ValidationError('No rows to import')
    }
    const user = request.user as { id: string }
    const result = await commitRequirements(body.rows, user.id)
    return reply.status(201).send({ success: true, data: result })
  })

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
