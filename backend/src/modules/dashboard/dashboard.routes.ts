import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import { requireAnyRole } from '../../shared/middleware/rbac.middleware'
import { getDashboardAggregates } from './dashboard.service'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // Dashboard stays open to all roles (including viewer) for the
  // operational widgets — pipeline, requirements by priority, etc.
  // Margin/financial data is excluded server-side for viewer, since
  // that role can't access the Tracker either. This also fixes a
  // pre-existing gap where the old billing summary was visible to
  // every role regardless of Tracker/Billing access.
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const user = request.user as { role: string }
    const data = await getDashboardAggregates(user.role)
    return { success: true, data }
  })
}