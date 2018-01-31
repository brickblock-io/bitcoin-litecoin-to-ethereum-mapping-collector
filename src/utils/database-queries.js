const squel = require('squel')

const addressMappingTable = 'address_mapping'

const insertionQuery = addressMappingTable => mapping =>
  squel
    .insert()
    .into(addressMappingTable)
    .setFieldsRows([mapping])

module.exports = {
  insertionQuery,
  addressMappingTable
}
