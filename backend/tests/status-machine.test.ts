import { getApp, getAdminToken } from './helpers'
import { prisma } from '../src/config/prisma'

describe('Allocation Status Machine', () => {
  let app: Awaited<ReturnType<typeof getApp>>
  let token: string
  let interviewingAllocationId: string

  beforeAll(async () => {
    app = await getApp()
    token = await getAdminToken(app)

    const candidate = await prisma.candidates.findFirst()
    const requirement = await prisma.requirements.findFirst({
      where: {
        allocations: {
          none: { candidate_id: candidate!.id }
        }
      }
    })

    if (!candidate || !requirement) throw new Error('Seed data missing')

    const allocation = await prisma.allocations.create({
      data: {
        requirement_id: requirement.id,
        candidate_id: candidate.id,
        status: 'interviewing',
        created_by: candidate.created_by,
        match_score: 50,
      },
    })

    interviewingAllocationId = allocation.id
  })

  afterAll(async () => {
    if (interviewingAllocationId) {
      await prisma.allocations.delete({
        where: { id: interviewingAllocationId },
      })
    }
    await app.close()
  })

  it('rejects invalid status transition with 400', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/allocations/${interviewingAllocationId}/status`,
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'placed' },
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('allows valid status transition', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/allocations/${interviewingAllocationId}/status`,
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'offered' },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.data.status).toBe('offered')
  })
})
