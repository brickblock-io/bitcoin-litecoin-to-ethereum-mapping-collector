const express = require("express")
const bodyParser = require("body-parser")
const squel = require("squel")
const mysql = require("mysql")
const { isNil } = require("ramda")
const {
  isValidAddressMappingPayload,
  errorsInMappingPayload
} = require("./isValidAddressMappingPayload.js")

require("dotenv").config()

const app = express()

app.use(bodyParser.json())

if (
  isNil(process.env["MYSQL_HOST"]) ||
  isNil(process.env["MYSQL_USERNAME"]) ||
  isNil(process.env["MYSQL_PASSWORD"])
) {
  console.log(
    "You must set the environment variables $MYSQL_HOST, $MYSQL_USERNAME and $MYSQL_PASSWORD"
  )
  process.exit(1)
}

const connection = mysql.createConnection({
  // host: "35.205.87.182",
  host: process.env["MYSQL_HOST"],
  user: process.env["MYSQL_USERNAME"],
  password: process.env["MYSQL_PASSWORD"],
  database: "db"
})

connection.connect()

// This is how you can query for all address_mapping rows
/* connection.query("SELECT * FROM address_mapping", (error, res, fields) => {
 *   if (error) {
 *     console.error(error)
 *   }
 *   console.log("Current mappings: ", res)
 * })*/

// Mapping -> SQLQuery
const insertionQuery = mapping =>
  squel
    .insert()
    .into("address_mapping")
    .setFieldsRows([mapping])

app.post("/address-map", (req, httpRes) => {
  if (isValidAddressMappingPayload(req.body)) {
    connection.query(
      insertionQuery({
        address: req.body.address,
        ethereumAddress: req.body.ethereumAddress,
        signature: req.body.signature
      }).toString(),
      (err, dbResult) => {
        if (err) {
          console.log(err, dbResult)
          return httpRes.status(500)
        } else {
          return httpRes.status(200).send("OK")
        }
      }
    )
  } else {
    httpRes.status(400).send(JSON.stringify(errorsInMappingPayload(req.body)))
  }
})

app.get("/", (req, res) => res.send("hello world"))

const port = 8080
app.listen(port, () =>
  console.log(
    `App running on port ${port}. Check /address-map. Env is ${process.env
      .NODE_ENV}`
  )
)
