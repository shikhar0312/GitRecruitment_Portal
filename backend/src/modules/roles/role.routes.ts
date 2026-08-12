import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import { requireAdmin, requireAnyRole } from '../../shared/middleware/rbac.middleware'
import { RoleQuerySchema, CreateRoleSchema, UpdateRoleSchema } from './role.schema'
import { listRoles, getRoleById, createRole, updateRole, deleteRole } from './role.service'

export async function roleRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // All authenticated users can read
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const query = RoleQuerySchema.parse(request.query)
    const result = await listRoles(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getRoleById(id)
    return { success: true, data }
  })

  // Only admin can create, update, delete roles
  app.post('/', { preHandler: requireAdmin }, async (request, reply) => {
    const body = CreateRoleSchema.parse(request.body)
    const data = await createRole(body)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateRoleSchema.parse(request.body)
    const data = await updateRole(id, body)
    return { success: true, data }
  })

  app.delete('/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    await deleteRole(id)
    return { success: true, message: 'Role deleted' }
  })
}