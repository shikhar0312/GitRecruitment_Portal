import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { env } from './config/env'
import { AppError } from './shared/errors'
import { ZodError } from 'zod'
import { authRoutes } from './modules/auth/auth.routes'
import { customerRoutes } from './modules/customers/customer.routes'
import { roleRoutes } from './modules/roles/role.routes'
import { requirementRoutes } from './modules/requirements/requirement.routes'
import { candidateRoutes } from './modules/candidates/candidate.route'
import { allocationRoutes } from './modules/allocations/allocation.routes'
import { marginRecordRoutes } from './modules/margin-records/margin-record.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'


export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'production'
        ? true
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
  })

  app.addHook('onSend', async (request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.header('Cache-Control', 'no-store')
    }
  })
  
  // ─── Plugins ───────────────────────────────────────────
  // Allowed origins: always the local dev ports, plus any comma-separated
  // origins from CORS_ORIGIN (set this to the deployed frontend URL in prod,
  // e.g. "https://your-app.vercel.app"). Env-driven so deploying to a new
  // frontend URL never needs a code change.
  const corsOrigins = [
    'http://localhost:5173',
    'http://localhost:5178',
    ...(process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? []),
  ]
  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })


  app.register(jwt, {
    secret: env.JWT_SECRET,
  })

  // ─── Rate limiting ─────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please slow down',
    }),
  })

  // ─── Security headers ──────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  })

  // ─── Swagger docs ──────────────────────────────────────
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'GIT Recruitment Portal API',
        description: 'API documentation for the GIT Recruitment Portal backend',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  })

  // ─── Global error handler ──────────────────────────────
  app.setErrorHandler((error:any, request, reply) => {
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please slow down',
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: error.flatten().fieldErrors,
    })
  }

  app.log.error(error)
  return reply.status(500).send({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  })
})

  // ─── Health check ──────────────────────────────────────
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.register(authRoutes, { prefix: '/api/v1/auth' })

  app.register(customerRoutes, { prefix: '/api/v1/customers' })

  app.register(roleRoutes, { prefix: '/api/v1/roles' })

  app.register(requirementRoutes, { prefix: '/api/v1/requirements' })

  app.register(candidateRoutes, { prefix: '/api/v1/candidates' })

  app.register(allocationRoutes, { prefix: '/api/v1/allocations' })

  app.register(marginRecordRoutes, { prefix: '/api/v1/tracker' })

  app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

  return app
}