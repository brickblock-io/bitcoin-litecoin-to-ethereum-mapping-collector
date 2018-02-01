const { is } = require('ramda')

const {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  signatureError
} = require('../utils/isValidAddressMappingPayload.js')
const {
  addressMappingTable,
  insertionQuery
} = require('../utils/database-queries')
const { isAddressInICO } = require('../utils/blockchain-api')

const isObject = is(Object)
const insertIntoAddressMappingTable = insertionQuery(addressMappingTable)

const addressNotInIcoError = 'ERR:Address-Not-In-ICO'

const postAddressMap = mysql => async (req, res) => {
  try {
    const body = isObject(req.body) ? req.body : JSON.parse(req.body)
    console.assert(
      isObject(body),
      `TypeError: Body of postAddressMap is not an Object, is ${typeof req.body}. Value: ${JSON.stringify(
        req.body
      )}`
    )

    // check that the submited values are valid
    if (!isValidAddressMappingPayload(body)) {
      const errorList = errorsInMappingPayload(body)

      // when the only error was a signature error, we send a hint for the i18n the client
      // should show
      if (errorList.length === 1 && errorList[0] === signatureError) {
        return res.status(400).send(signatureError)
      }

      // otherwise we send a list of all errors that made this request not valid
      return res.status(400).send(JSON.stringify(errorList))
    }

    // check that submited address participated in the ICO
    const addressIsInICO = await isAddressInICO(body.address)
    if (!addressIsInICO) {
      return res.status(400).send(addressNotInIcoError)
    }

    // everything is good! insert data into table
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
