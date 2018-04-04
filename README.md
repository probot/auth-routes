# auth-routes

> Helpful authentication routes for Probot Apps

## Usage

```js
const authRoutes = require('probot-auth')

module.exports = robot => {
  const app = robot.route()
  authRoutes(app)

  // Or pass some options:
  authRoutes(app, {
    loginURL: '/log-me-in',
    callbackURL: '/call-me-back'
  })
}
```

You will need to set your app's `CLIENT_ID` and `CLIENT_SECRET` environment variables, or you can pass them manually in the options.

## Options

| Name | Description | Default |
| ------- | ----------- | ------- |
| `loginURL` | Login path | `'/login'` |
| `callbackURL` | Authorization callback URL, for your GitHub App | `'/login/cb'` |
| `afterLogin` | Where users are redirected to after they've logged in | `'/'` |
| `client_id` | GitHub App's Client ID | `process.env.CLIENT_ID` |
| `client_secret` | GitHub App's Client Secret | `process.env.CLIENT_SECRET` |