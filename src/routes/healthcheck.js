const { addressMappingTable } = require('../utils/database-queries')

const healthcheckQuery = `SELECT 1 FROM ${addressMappingTable} LIMIT 1`

const getHealthCheck = mysql => (req, res) => {
  try {
    mysql.query(healthcheckQuery, (error, dbResult) => {
      if (error) {
        console.log(
          `HealthCheck Error. Cannot touch database table: ${sqlTable}`,
          error
        )
        return res.status(500).send(error.code)
      } else {
        console.log(`HealthCheck Success`)
        return res.status(200).send()
      }
    })
  } catch (error) {
    console.log('GET / ERROR:', error)
    return res.status(500).send()
  }
}

module.exports = {
  getHealthCheck
}
