import querystring from 'querystring'
import { post } from 'request-promise-native'
import { Application } from 'express'

export interface AuthRouteOptions {
  loginURL?: string
  callbackURL?: string
  afterLogin?: string
  client_id: string
  client_secret: string
}

export function registerAuthRoutes (app: Application, options: AuthRouteOptions): void {
  const opts = {
    loginURL: '/login',
    callbackURL: '/login/cb',
    afterLogin: '/',
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
    try {
      // Complete OAuth dance
      const tokenRes = await post({
        url: 'https://github.com/login/oauth/access_token',
        resolveWithFullResponse: true,
        form: {
          client_id: opts.client_id,
          client_secret: opts.client_secret,
          code: req.query.code,
          state: req.query.state
        },
        json: true
      })
  
      if (tokenRes.statusCode === 200) {
        // Redirect after login
        res.redirect(opts.afterLogin)
      } else {
        res.status(500)
        res.send('Invalid code')
      }
    } catch (err) {
      res.status(500)
      res.send('Invalid code')
    }
  })
}
