import express, { Application } from 'express'
import nock from 'nock'
import supertest, { SuperTest, Test } from 'supertest'
import { AuthRouteOptions, registerAuthRoutes } from '../src'

describe('auth-routes', () => {
  let agent: SuperTest<Test>
  let app: Application
  let opts: AuthRouteOptions

  beforeEach(() => {
    app = express()
    agent = supertest.agent(app)
    opts = {
      client_id: '123abc',
      client_secret: '456def'
    }
  })

  it('GET /login', async () => {
    registerAuthRoutes(app, opts)

    await agent.get('/login')
      .expect(302)
      .expect('Location', /^https:\/\/github.com\/login\/oauth\/authorize/)
  })

  it('redirects to / from callback', async () => {
    registerAuthRoutes(app, opts)
    nock('https://github.com').post('/login/oauth/access_token')
      .reply(200, { access_token: 'testing123', token_type: 'bearer' })

    const res = await agent.get('/login/cb')
    expect(res.status).toBe(302)
    expect(res.get('location')).toBe('/')
  })

  it('responds with a 500 with an invalid code', async () => {
    registerAuthRoutes(app, opts)
    nock('https://github.com').post('/login/oauth/access_token')
      .reply(500)

    const res = await agent.get('/login/cb')
    expect(res.status).toBe(500)
    expect(res.text).toBe('Invalid code')
  })

  it('overwrites default options', async () => {
    registerAuthRoutes(app, { ...opts, loginURL: '/eat-some-pizza' })

    await agent.get('/eat-some-pizza')
      .expect(302)
      .expect('Location', /^https:\/\/github.com\/login\/oauth\/authorize/)
  })
})
