import bcrypt from 'bcryptjs'
import { prisma } from '../../config/prisma'
import { UnauthorizedError } from '../../shared/errors'
import { LoginInput } from './auth.schema'
import { FastifyInstance } from 'fastify'

export async function login(input: LoginInput, app: FastifyInstance) {
  const user = await prisma.users.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw new UnauthorizedError('Invalid email or password')
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account is inactive')
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password_hash)

  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid email or password')
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { last_login_at: new Date() },
  })

  const token = app.jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    { expiresIn: '8h' }
  )

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  }
}

