import { buildApp } from '../src/app'

export async function getApp() {
  const app = await buildApp()
  await app.ready()
  return app
}

export async function getAdminToken(app: Awaited<ReturnType<typeof getApp>>) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email: 'admin@gitrecruitment.com',
      password: 'Admin@123',
    },
  })

  const body = JSON.parse(response.body)
  return body.data.token
}