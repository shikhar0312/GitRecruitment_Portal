import { FastifyInstance } from 'fastify'
import { LoginSchema } from './auth.schema'
import { login } from './auth.service'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const body = LoginSchema.parse(request.body)
      const result = await login(body, app)
      return reply.status(200).send({
        success: true,
        data: result,
      })
    }
  )
}