# Bitcoin Litecoin to ethereum mapping collector
Some of our users participate in the ICO using Bitcoin & Litecoin. We need to pay these users out in BBK tokens, so our users need to tell us their Bitcoin/Litecoin address, what Ethereum address they want to be paid to. We also need to make sure that they truly are the owners of the Bitcoin/Litecoin addresses they claim.

To do this users must sign a message consisting of their Ethereum address. They must sign it with the private key matching the Bitcoin/Litecoin address they paid in with.

This cryptographic signature will allow us to verify that they truly own said Bitcoin/Litecoin address. Since the message they signed is the string with their Etheruem address, we also know that the owner of the Bitcoin/Litecoin address wishes to have their BBT tokens sent to the Ethereum address.

## Development Setup

### Local mySql database
There needs to be a database and user setup for this API to run. A setup to do so on development:

- `mysqld` => start the mysql process
- `mysql -u root` => login with a user that can create other users
- `CREATE DATABASE BBK_claim;` => create the database
- `CREATE USER 'BBK_claim_api'@'localhost' IDENTIFIED BY '{user-password}';` => create a user that will connect to mysql on "localhost"
- `GRANT ALL PRIVILEGES ON BBK_claim . * TO 'BBK_claim_api';` => gives the BBK_claim_api USER all permissions on BBK_claim TABLE

### Local environment file
To run the API, you must have a `.env` file in the repo root. Copy the `.env.example` file to `.env` and make ensure it matches your local mysql setup.

### Local mySql Migrations
When the above steps are completed, you should be able to run `yarn migrate`

## Development API
We use `nodemon` to watch for changes during development `yarn start:dev`

## Testing
To run the Javascript tests, run `yarn test`.
