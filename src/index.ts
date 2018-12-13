import { Application } from 'express'
import fetch from 'node-fetch'
import querystring from 'querystring'
import { URLSearchParams } from 'url'

export interface AuthRouteOptions {
  loginURL?: string
  callbackURL?: string
  afterLogin?: string
  client_id: string
  client_secret: string
}

export function registerAuthRoutes (app: Application, options: AuthRouteOptions): void {
  const opts = {
    afterLogin: '/',
    callbackURL: '/login/cb',
    loginURL: '/login',
    ...options
  }

  app.get(opts.loginURL, (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol
    const host = req.headers['x-forwarded-host'] || req.get('host')

    const params = querystring.stringify({
      client_id: opts.client_id,
      redirect_uri: `${protocol}://${host}${opts.callbackURL}`
    })

    const url = `https://github.com/login/oauth/authorize?${params}`
    res.redirect(url)
  })

  app.get(opts.callbackURL, async (req, res) => {
    const params = querystring.stringify({
      client_id: opts.client_id,
      client_secret: opts.client_secret,
      code: req.query.code,
      state: req.query.state
    })

    // Complete OAuth dance
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams(params)
    })

    if (tokenRes.ok) {
      // Redirect after login
      res.redirect(opts.afterLogin)
    } else {
      res.status(500)
      res.send('Invalid code')
    }
  })
}
