import { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../errors'

export async function verifyToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError('Invalid or missing token')
  }
}