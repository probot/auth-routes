const express = require('express')
const nock = require('nock')
const supertest = require('supertest')
const routes = require('.')

describe('auth-routes', () => {
  let agent, app

  beforeEach(() => {
    app = express()
    agent = supertest.agent(app)
  })

  it('GET /login', async () => {
    routes(app)

    await agent.get('/login')
      .expect(302)
      .expect('Location', /^https:\/\/github.com\/login\/oauth\/authorize/)
  })

  it('redirects to / from callback', async () => {
    routes(app)
    nock('https://github.com').post('/login/oauth/access_token')
      .reply(200, { access_token: 'testing123', token_type: 'bearer' })

    const res = await agent.get('/login/cb')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/')
  })

  it('responds with a 500 with an invalid code', async () => {
    routes(app)
    nock('https://github.com').post('/login/oauth/access_token')
      .reply(500)

    const res = await agent.get('/login/cb')
    expect(res.status).toBe(500)
    expect(res.text).toBe('Invalid code')
  })

  it('overwrites default options', async () => {
    routes(app, { loginURL: '/eat-some-pizza' })

    await agent.get('/eat-some-pizza')
      .expect(302)
      .expect('Location', /^https:\/\/github.com\/login\/oauth\/authorize/)
  })

  it('adds the user\'s data to the session', async () => {
    nock('https://github.com').post('/login/oauth/access_token')
      .reply(200, { access_token: 'testing123', token_type: 'bearer' })
    nock('https://api.github.com').get('/user')
      .reply(200, { id: 123 })

    const session = {}

    app.use((req, res, next) => {
      req.session = session
      next()
    })

    routes(app)

    await agent.get('/login/cb')
    expect(session).toEqual({ user: { id: 123 } })
  })
})
