const { is } = require('ramda')

const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require('../utils/isValidAddressMappingPayload.js')
const {
  addressMappingTable,
  insertionQuery
} = require('../utils/database-queries')

const isObject = is(Object)
const insertIntoAddressMappingTable = insertionQuery(addressMappingTable)

const postAddressMap = mysql => (req, res) => {
  try {
    const body = isObject(req.body) ? req.body : JSON.parse(req.body)
    console.assert(
      isObject(body),
      `TypeError: Body of postAddressMap is not an Object, is ${typeof req.body}. Value: ${JSON.stringify(
        req.body
      )}`
    )
    if (!isValidAddressMappingPayload(body)) {
      return res.status(400).send(JSON.stringify(errorsInMappingPayload(body)))
    }

    mysql.query(
      insertIntoAddressMappingTable({
        address: body.address,
        ethereumAddress: body.ethereumAddress,
        signature: body.signature
      }).toString(),
      (error, dbResult) => {
        if (error) {
          console.log('500 Database error Error postAddressMap, ERROR:', error)
          return res.status(500).send(error.code)
        } else {
          console.log(
            `200 OK Inserted valid Claim ${JSON.stringify(body)} into DB`
          )
          return res.status(200).send()
        }
      }
    )
  } catch (error) {
    console.log('postAddressMap ERROR:', error)
    return res.status(500).send()
  }
}

const selectAllQuery = `SELECT * FROM ${addressMappingTable}`

const getAddressMap = mysql => (req, res) => {
  try {
    mysql.query(selectAllQuery, (error, dbResult) => {
      if (error) {
        console.log('getAddressMap mysql.query error:', error)
        return res.status(500).send()
      }

      return res.status(200).json(dbResult)
    })
  } catch (error) {
    console.log('getAddressMap error:', error)
    return res.status(500).send()
  }
}

module.exports = {
  getAddressMap,
  postAddressMap
}
