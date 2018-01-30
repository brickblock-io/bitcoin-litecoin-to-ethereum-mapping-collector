// @flow
const squel = require('squel')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { is } = require('ramda')
const sqlTable = 'address_mapping'
const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require('./isValidAddressMappingPayload.js')

const isObject = is(Object)
const app = express()

app.use(bodyParser.json({ type: ['*/*', 'application/json'] }))
app.use(cors())

const insertionQuery = mapping =>
  squel
    .insert()
    .into(sqlTable)
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

  app.get('/', (req, httpRes) => {
    try {
      pool.query(`SELECT 1 FROM ${sqlTable} LIMIT 1`,
        (error, dbResult) => {
          if (error) {
            console.log(
              `Healthcheck Error. Cannot touch database table: ${sqlTable}`,
              error
            )
            return httpRes.status(500).send(error.code)
          } else {
            console.log(
              `Healthcheck Success`
            )
            return httpRes.status(200).send('OK')
          }
        }
      )
    } catch (error) {
      console.log('GET / ERROR:', error)
      return httpRes.status(500).send()
    }
  })

  app.listen(port, () =>
    console.log(`App running on port ${port}. Check /address-map.`)
  )
}

module.exports = {
  startServer
}
