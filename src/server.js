// @flow
const squel = require('squel')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require('./isValidAddressMappingPayload.js')
const { is } = require('ramda')

const isObject = is(Object)
const app = express()

app.use(bodyParser.json({ type: ['*/*', 'application/json'] }))
app.use(cors())

const insertionQuery = mapping =>
  squel
    .insert()
    .into('address_mapping')
    .setFieldsRows([mapping])

const startServer = (pool: *, port: number) => {
  app.post('/address-map', (req, httpRes) => {
    const body = isObject(req.body) ? req.body : JSON.parse(req.body)
    console.assert(
      isObject(body),
      `TypeError: Body of POST /address-map is not an Object, is ${typeof req.body}. Value: ${JSON.stringify(
        req.body
      )}`
    )
    if (!isValidAddressMappingPayload(body)) {
      return httpRes
        .status(400)
        .send(JSON.stringify(errorsInMappingPayload(body)))
    }

    try {
      pool.query(
        insertionQuery({
          address: body.address,
          ethereumAddress: body.ethereumAddress,
          signature: body.signature
        }).toString(),
        (error, dbResult) => {
          if (error) {
            console.log(
              '500 Database error Error POST /address-map, ERROR:',
              error
            )
            return httpRes.status(500).send(error.code)
          } else {
            console.log(
              `200 OK Inserted valid Claim ${JSON.stringify(body)} into DB`
            )
            return httpRes.status(200).send('OK')
          }
        }
      )
    } catch (error) {
      console.log('POST /address-map ERROR:', error)
      return httpRes.status(500).send()
    }
  })

  app.get('/', (req, res) => res.send('hello world'))

  app.listen(port, () =>
    console.log(`App running on port ${port}. Check /address-map.`)
  )
}

module.exports = {
  startServer
}
