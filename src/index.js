const express = require("express")
const app = express()
const isValidAddressMappingPayload = require("./isValidAddressMappingPayload.js")

const db = require("knex")({
  client: "mysql",
  connection: {
    host: "dev-db",
    user: "mysql-testing-db-user",
    password: "mysql-testing-db-user-password",
    database: "address-mapping-test-database"
  }
})

app.get("/address-map", (req, res) =>
  res.send(`it works! req.message: ${req.message}`)
)

/* app.get("/address-map", (req, res) => {
 *   if (res.method !== "POST") {
 *     res.status(400).send("You can only send POST requests here")
 *   } else {
 *     const parsedBody = JSON.parse(req.body)
 *     if (isValidAddressMappingPayload(parsedBody)) {
 *       db("address_mappings").insert({
 *         address: parsedBody.address,
 *         ethereumAddress: parsedBody.ethereumAddress,
 *         signature: parsedBody.signature
 *       })
 *     }
 *   }
 * })*/

app.get("/", (req, res) => res.send("hello world"))

const port = 8080
app.listen(port, () =>
  console.log(`App running on port ${port}. Check /address-map`)
)
