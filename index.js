const request = require('request')
const querystring = require('querystring')
const {promisify} = require('util')
const octokit = require('@octokit/rest')()
const post = promisify(request.post)

module.exports = (app, options = {}) => {
  const opts = {
    loginURL: '/login',
    callbackURL: '/login/cb',
    afterLogin: '/',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    ...options
  }

  app.get(opts.loginURL, (req, res) => {
    // Store the users previous place (if they were on GitHub Learn)
    if (req.session && req.get('Referrer') && req.get('Referrer').includes(req.get('host'))) {
      req.session.redirect = req.get('Referrer')
    }

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
    // complete OAuth dance
    const tokenRes = await post({
      url: 'https://github.com/login/oauth/access_token',
      form: {
        client_id: opts.client_id,
        client_secret: opts.client_secret,
        code: req.query.code,
        state: req.query.state
      },
      json: true
    })

    if (tokenRes.statusCode === 200) {
      // Set the user's session if there is a session
      if (req.session) {
        // Authenticate the GitHub client as the user
        octokit.authenticate({ type: 'token', token: tokenRes.body.access_token })

        // Fetch that user's data from GitHub
        const {data: user} = await octokit.users.get({})

        req.session.user = user
      }

      // Redirect after login
      res.redirect(opts.afterLogin)
    } else {
      res.status(500)
      res.send('Invalid code')
    }
  })
}
