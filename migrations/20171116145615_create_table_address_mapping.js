exports.up = function(knex, Promise) {
  return knex.schema.createTable("address_mapping", table => {
    table.increments("id").primary()
    table.dateTime("createdAt")
    table.dateTime("updatedAt")

    table.text("address")

    table.text("ethereumAddress")
    table.text("signature").unique()
  })
}

exports.down = function(knex, Promise) {
  knex.schema.dropTable("address_mapping")
}
