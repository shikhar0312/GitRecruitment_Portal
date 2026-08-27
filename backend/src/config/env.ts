import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // Required because the Prisma schema declares `directUrl = env("DIRECT_URL")`.
  // Validating it here fails fast with a clear message instead of an opaque
  // Prisma error at migrate/generate time. If your database has no separate
  // pooled/direct split, set DIRECT_URL to the same value as DATABASE_URL.
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data