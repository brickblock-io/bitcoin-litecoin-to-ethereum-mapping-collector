// @flow
const squel = require('squel')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require('./isValidAddressMappingPayload.js')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const insertionQuery = mapping =>
  squel
    .insert()
    .into('address_mapping')
    .setFieldsRows([mapping])

const startServer = (pool: *, port: number) => {
  app.post('/address-map', (req, httpRes) => {
    if (!isValidAddressMappingPayload(req.body)) {
      return httpRes
        .status(400)
        .send(JSON.stringify(errorsInMappingPayload(req.body)))
    }

    try {
      pool.query(
        insertionQuery({
          address: req.body.address,
          ethereumAddress: req.body.ethereumAddress,
          signature: req.body.signature
        }).toString(),
        (error, dbResult) => {
          if (error) {
            console.log('POST /address-map ERROR:', error)
            return httpRes.status(500).send()
          } else {
            console.log(
              `Inserted valid Claim ${JSON.stringify(req.body)} into DB`
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
