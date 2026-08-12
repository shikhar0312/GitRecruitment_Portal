import { getApp } from './helpers'

describe('Auth', () => {
  let app: Awaited<ReturnType<typeof getApp>>

  beforeAll(async () => {
    app = await getApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns a token on valid login', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@gitrecruitment.com',
        password: 'Admin@123',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(body.data.token).toBeDefined()
    expect(body.data.user.role).toBe('admin')
  })

  it('returns 401 on invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@gitrecruitment.com',
        password: 'wrongpassword',
      },
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(false)
    expect(body.code).toBe('UNAUTHORIZED')
  })
})