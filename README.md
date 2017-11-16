# Bitcoin Litecoin to ethereum mapping collector

## What is this?

Some of our users participate in the ICO using Bitcoin & Litecoin.

We need to pay these users out in BBT tokens, i.e. sending a transactions on the Ethereum blockchain.

To be able to pay them the right amount of BBT, we need to know how much everyone paid in in Bitcoin & Litecoin.

We already know what Bitcoin and Litecoin addresses paid what amounts (as this data is public on the blockchain).

Our users need to tell us their Bitcoin/Litecoin address, what Ethereum address they want to be paid to. We also need to make sure that they truly are the owners of the Bitcoin/Litecoin addresses they claim.

To do this users must sign a message consisting of their Ethereum address. They must sign it with the private key matching the Bitcoin address they paid in with.

So this webapp exists in order to collect these 3 string values: Bitcoin/Litecoin address, Ethereum address & signature(EthereumAddress, BitcoinAddressPrivateKey).

A cryptographic signature will allow us to verify that they truly own said Bitcoin/Litecoin address. Since the message they signed is the string with their Etheruem address, we also know that the owner of the Bitcoin/Litecoin address wishes to have their BBT tokens sent to the Ethereum address.

And that is what this app is about! A DB, a `POST` http route, and some validation.

## Docker run it

`$ docker build -t bitcoin-litecoin-mapping . && docker run -ti -p 8080:8080 bitcoin-litecoin-mapping`

alternatively

`$ yarn start`

## Testing

To run the Javascript tests, run `$ yarn && yarn test`.
