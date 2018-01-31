// @flow
const squel = require('squel')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { isAuthenticated } = require('./utils/middleware')
const { getHealthCheck } = require('./routes/healthcheck')
const { getAddressMap, postAddressMap } = require('./routes/address-map')

const app = express()

app.use(bodyParser.json({ type: ['*/*', 'application/json'] }))
app.use(cors())

const startServer = (mysql: *, port: number) => {
  // health-check
  app.get('/', getHealthCheck(mysql))

  // address-map
  app.get('/address-map', isAuthenticated, getAddressMap(mysql))
  app.post('/address-map', postAddressMap(mysql))

  app.listen(port, () => console.log(`App running on port ${port}`))
}

module.exports = {
  startServer
}
