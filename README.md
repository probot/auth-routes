<h3 align="center">GitHub Auth Routes</h3>

<p align="center">Helpful authentication routes for Node.js GitHub integrations</p>

<p align="center"><a href="https://npmjs.com/package/auth-routes"><img src="https://badgen.net/npm/v/auth-routes" alt="NPM"></a> <a href="https://travis-ci.com/probot/auth-routes"><img src="https://badgen.now.sh/travis/probot/auth-routes" alt="Build Status"></a> <a href="https://codecov.io/gh/probot/auth-routes/"><img src="https://badgen.now.sh/codecov/c/github/probot/auth-routes" alt="Codecov"></a></p>

## Usage

```js
const { registerAuthRoutes } = require('auth-routes')

const app = express()
registerAuthRoutes(app, {
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET
})

// Or pass some options:
registerAuthRoutes(app, {
  loginURL: '/log-me-in',
  callbackURL: '/call-me-back',
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET
})
```

### Use with Probot

```js
module.exports = app => {
  // Access the Express server that Probot uses
  const expressApp = app.route()

  // Register the routes as normal
  registerAuthRoutes(expressApp, {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  })
}
```

## Options

| Name | Description | Required | Default |
| ------- | ----------- | ------- | ------- |
| `client_id` | GitHub App's Client ID | ✓ | - |
| `client_secret` | GitHub App's Client Secret | ✓ | - |
| `loginURL` | Login path |  | `'/login'` |
| `callbackURL` | Authorization callback URL, for your GitHub App |  | `'/login/cb'` |
| `afterLogin` | Where users are redirected to after they've logged in |  | `'/'` |
