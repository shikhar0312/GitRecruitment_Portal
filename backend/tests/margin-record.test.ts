import { getApp, getAdminToken } from './helpers'
import { prisma } from '../src/config/prisma'

describe('Margin Record Auto-Calculation', () => {
  let app: Awaited<ReturnType<typeof getApp>>
  let token: string
  let createdMarginRecordId: string
  let createdAllocationId: string

  beforeAll(async () => {
    app = await getApp()
    token = await getAdminToken(app)

    // Use a UK Ltd requirement so the reporting currency is GBP and the
    // FX rate is forced to 1 (same-currency deal) — keeps the expected
    // numbers in this test simple and deterministic.
    const candidate = await prisma.candidates.findFirst()
    const requirement = await prisma.requirements.findFirst({
      where: {
        billing_entity: 'git_uk_ltd',
        allocations: {
          none: {
            candidate_id: candidate!.id,
          },
        },
      },
    })

    if (!candidate || !requirement) throw new Error('Seed data missing')

    const allocation = await prisma.allocations.create({
      data: {
        requirement_id: requirement.id,
        candidate_id: candidate.id,
        status: 'placed',
        created_by: candidate.created_by,
        match_score: 50,
      },
    })

    createdAllocationId = allocation.id
  })

  afterAll(async () => {
    if (createdMarginRecordId) {
      await prisma.margin_records.delete({ where: { id: createdMarginRecordId } })
    }
    if (createdAllocationId) {
      await prisma.allocations.delete({ where: { id: createdAllocationId } })
    }
    await app.close()
  })

  it('auto-calculates converted amounts and margin percentage', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tracker',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        allocation_id: createdAllocationId,
        demand_amount: 6000,
        demand_currency: 'GBP',
        demand_fx_rate: 1,
        billed_amount: 7200,
        billed_currency: 'GBP',
        billed_fx_rate: 1,
        payment_status: 'pending',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body.data.billing_entity).toBe('git_uk_ltd')
    expect(body.data.reporting_currency).toBe('GBP')
    expect(Number(body.data.billed_converted_yearly)).toBe(86400)
    expect(Number(body.data.margin_pct)).toBeCloseTo(16.67, 1)
    createdMarginRecordId = body.data.id
  })

  it('locks the FX rate on update — only amounts recompute', async () => {
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/v1/tracker/${createdMarginRecordId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        billed_amount: 8000,
      },
    })

    expect(updateResponse.statusCode).toBe(200)
    const body = JSON.parse(updateResponse.body)
    // Rate stays 1 (locked), only the converted/margin figures move.
    expect(Number(body.data.billed_fx_rate)).toBe(1)
    expect(Number(body.data.billed_converted)).toBe(8000)
    expect(Number(body.data.margin_amount)).toBe(2000)
  })
})
