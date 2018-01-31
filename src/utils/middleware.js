const assert = require('assert')

const authToken = process.env.API_AUTH_TOKEN
assert(authToken, 'process.env.API_AUTH_TOKEN is empty')

const isAuthenticated = (req, res, next) => {
  if (req.header('Authorization') !== authToken) {
    return res.status(401).send()
  }
  next()
}

module.exports = {
  isAuthenticated
}
