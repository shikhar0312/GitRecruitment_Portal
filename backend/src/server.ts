import { buildApp } from './app'
import { env } from './config/env'
import { prisma } from './config/prisma'

const gracefulShutdown = async (signal: string, app: Awaited<ReturnType<typeof buildApp>>) => {
  app.log.info(`Received ${signal}, shutting down gracefully`)
  await app.close()
  await prisma.$disconnect()
  process.exit(0)
}

const start = async () => {
  const app = await buildApp()

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', app))
  process.on('SIGINT', () => gracefulShutdown('SIGINT', app))

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()