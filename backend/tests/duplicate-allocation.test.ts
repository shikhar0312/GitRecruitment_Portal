import { getApp, getAdminToken } from './helpers'
import { prisma } from '../src/config/prisma'

describe('Duplicate Allocation Prevention', () => {
  let app: Awaited<ReturnType<typeof getApp>>
  let token: string

  beforeAll(async () => {
    app = await getApp()
    token = await getAdminToken(app)
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns 409 when creating duplicate allocation', async () => {
    const existing = await prisma.allocations.findFirst({
      select: { requirement_id: true, candidate_id: true },
    })

    if (!existing) throw new Error('No existing allocation found in seed data')

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/allocations',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        requirement_id: existing.requirement_id,
        candidate_id: existing.candidate_id,
      },
    })

    expect(response.statusCode).toBe(409)
    const body = JSON.parse(response.body)
    expect(body.code).toBe('CONFLICT')
  })
})
