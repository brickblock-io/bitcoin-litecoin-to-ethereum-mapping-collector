// @flow
const mysql = require('mysql')
const { isNil } = require('ramda')
const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require('./isValidAddressMappingPayload.js')
const { startServer } = require('./server.js')

require('dotenv').config()

if (
  isNil(process.env['MYSQL_HOST']) ||
  isNil(process.env['MYSQL_USERNAME']) ||
  isNil(process.env['MYSQL_PASSWORD']) ||
  isNil(process.env['MYSQL_DATABASE'])
) {
  console.log(
    'You must set the environment variables $MYSQL_HOST, $MYSQL_USERNAME, $MYSQL_PASSWORD $MYSQL_DATABASE'
  )
  process.exit(1)
}

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env['MYSQL_HOST'],
  user: process.env['MYSQL_USERNAME'],
  password: process.env['MYSQL_PASSWORD'],
  database: process.env['MYSQL_DATABASE']
})

function main() {
  startServer(pool, 8080)
}

main()
