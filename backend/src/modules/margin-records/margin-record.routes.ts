import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import { requireFinance, requireTrackerViewer } from '../../shared/middleware/rbac.middleware'
import {
  MarginRecordQuerySchema,
  CreateMarginRecordSchema,
  UpdateMarginRecordSchema,
} from './margin-record.schema'
import {
  listMarginRecords,
  getMarginRecordById,
  createMarginRecord,
  updateMarginRecord,
} from './margin-record.service'

export async function marginRecordRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // Tracker is readable by admin, recruiter, account_manager, and finance —
  // broader than the old Billing section, which was finance/admin-only.
  app.get('/', { preHandler: requireTrackerViewer }, async (request) => {
    const query = MarginRecordQuerySchema.parse(request.query)
    const result = await listMarginRecords(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireTrackerViewer }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getMarginRecordById(id)
    return { success: true, data }
  })

  // Only admin and finance can create or edit the financial figures.
  app.post('/', { preHandler: requireFinance }, async (request, reply) => {
    const body = CreateMarginRecordSchema.parse(request.body)
    const data = await createMarginRecord(body)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id', { preHandler: requireFinance }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateMarginRecordSchema.parse(request.body)
    const data = await updateMarginRecord(id, body)
    return { success: true, data }
  })
}
