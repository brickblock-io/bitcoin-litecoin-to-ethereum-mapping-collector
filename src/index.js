// @flow
const mysql = require('mysql')
const { isNil } = require('ramda')

require('dotenv').config()

const fallbackPort = 8080

const { startServer } = require('./server.js')
;['MYSQL_HOST', 'MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'].forEach(
  envVar => {
    if (!isNil(process.env[envVar])) return

    console.log('init ERROR: missing process.env', envVar)
    process.exit(1)
  }
)

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

startServer(pool, Number(process.env.API_PORT || fallbackPort))
