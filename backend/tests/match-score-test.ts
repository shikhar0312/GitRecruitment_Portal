import { getApp, getAdminToken } from './helpers'
import { prisma } from '../src/config/prisma'

describe('Match Score', () => {
  let app: Awaited<ReturnType<typeof getApp>>
  let token: string
  let createdAllocationId: string

  beforeAll(async () => {
    app = await getApp()
    token = await getAdminToken(app)
  })

  afterAll(async () => {
    if (createdAllocationId) {
      await prisma.allocations.delete({ where: { id: createdAllocationId } })
    }
    await app.close()
  })

  it('returns a match score between 0 and 100 on allocation create', async () => {
    const candidate = await prisma.candidates.findFirst()
    const requirement = await prisma.requirements.findFirst()

    if (!candidate || !requirement) throw new Error('Seed data missing')

    const existing = await prisma.allocations.findUnique({
      where: {
        requirement_id_candidate_id: {
          requirement_id: requirement.id,
          candidate_id: candidate.id,
        },
      },
    })

    if (existing) {
      return
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/allocations',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        requirement_id: requirement.id,
        candidate_id: candidate.id,
      },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    const score = Number(body.data.match_score)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
    createdAllocationId = body.data.id
  })
})
