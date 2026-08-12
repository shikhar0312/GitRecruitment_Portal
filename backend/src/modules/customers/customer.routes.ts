import { FastifyInstance } from 'fastify'
import { verifyToken } from '../../shared/middleware/auth.middleware'
import {
  requireAdmin,
  requireAccountManager,
  requireAnyRole,
} from '../../shared/middleware/rbac.middleware'
import {
  CustomerQuerySchema,
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CreateCustomerContactSchema,
  UpdateCustomerContactSchema,
} from './customer.schema'
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomerContacts,
  createCustomerContact,
  updateCustomerContact,
  deleteCustomerContact,
} from './customer.service'

export async function customerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken)

  // All authenticated users can read
  app.get('/', { preHandler: requireAnyRole }, async (request) => {
    const query = CustomerQuerySchema.parse(request.query)
    const result = await listCustomers(query)
    return { success: true, ...result }
  })

  app.get('/:id', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await getCustomerById(id)
    return { success: true, data }
  })

  // Only admin and account_manager can create and update
  app.post('/', { preHandler: requireAccountManager }, async (request, reply) => {
    const body = CreateCustomerSchema.parse(request.body)
    const data = await createCustomer(body)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id', { preHandler: requireAccountManager }, async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdateCustomerSchema.parse(request.body)
    const data = await updateCustomer(id, body)
    return { success: true, data }
  })

  // Only admin can delete
  app.delete('/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await deleteCustomer(id)
    return { success: true, message: 'Customer deleted', data }
  })

  // ─── Contacts ─────────────────────────────────────────
  app.get('/:id/contacts', { preHandler: requireAnyRole }, async (request) => {
    const { id } = request.params as { id: string }
    const data = await listCustomerContacts(id)
    return { success: true, data }
  })

  app.post('/:id/contacts', { preHandler: requireAccountManager }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = CreateCustomerContactSchema.parse(request.body)
    const data = await createCustomerContact(id, body)
    return reply.status(201).send({ success: true, data })
  })

  app.put('/:id/contacts/:contactId', { preHandler: requireAccountManager }, async (request) => {
    const { id, contactId } = request.params as { id: string; contactId: string }
    const body = UpdateCustomerContactSchema.parse(request.body)
    const data = await updateCustomerContact(id, contactId, body)
    return { success: true, data }
  })

  app.delete('/:id/contacts/:contactId', { preHandler: requireAccountManager }, async (request) => {
    const { id, contactId } = request.params as { id: string; contactId: string }
    const data = await deleteCustomerContact(id, contactId)
    return { success: true, ...data }
  })
}
