const express = require("express")
const app = express()
const db = require("knex")({
  client: "mysql"
})

app.get("/address-map", (req, res) =>
  res.send(`it works! req.message: ${req.message}`)
)

app.get("/", (req, res) => res.send("hello world"))

const port = 8080
app.listen(port, () =>
  console.log(`App running on port ${port}. Check /address-map`)
)
