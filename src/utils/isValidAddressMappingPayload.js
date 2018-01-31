// @flow
const verifyMessage = require('bitcoinjs-message').verify
const {
  isLitecoinAddress,
  isBitcoinAddress,
  isEthereumAddress
} = require('crypto-address-checker')
const { is, isNil, not } = require('ramda')

const isString = is(String)

type BitcoinOrLitecoinT = 'BTC' | 'LTC'
type BitcoinOrLitecoinAddressT = string
type EthereumAddressT = string

const messagePrefixes = {
  BTC: '\u0018Bitcoin Signed Message:\n',
  LTC: '\u0019Litecoin Signed Message:\n'
}

const isValidSignature = (
  address: BitcoinOrLitecoinAddressT,
  addressType: BitcoinOrLitecoinT,
  message: EthereumAddressT,
  signature: string
) => {
  let isValid
  try {
    isValid = verifyMessage(
      message,
      address,
      signature,
      messagePrefixes[addressType]
    )
  } catch (error) {
    isValid = false
  }
  return isValid
}

type ValueMapping = {
  address: BitcoinOrLitecoinAddressT,
  ethereumAddress: EthereumAddressT,
  signature: string
}

const errorsInMappingPayload = ({
  address,
  ethereumAddress,
  signature
}: ValueMapping) => {
  let errors = []
  if (not(isString(address))) {
    errors.push('Missing Bitcoin/Litecoin address')
  }
  if (not(isString(ethereumAddress))) {
    errors.push('Missing Ethereum address')
  }
  if (not(isString(signature))) {
    errors.push('Missing signature')
  }

  // first report missing
  if (errors.length !== 0) return errors

  if (not(isEthereumAddress(ethereumAddress))) {
    errors.push('Ethereum address is not valid')
  }
  let addressType
  if (isBitcoinAddress(address)) {
    addressType = 'BTC'
  } else if (isLitecoinAddress(address)) {
    addressType = 'LTC'
  } else {
    errors.push('Address is not valid BTC or LTC')
  }

  if (
    addressType &&
    errors.length === 0 &&
    not(isValidSignature(address, addressType, ethereumAddress, signature))
  ) {
    errors.push('Invalid signature')
  }
  console.assert(Array.isArray(errors))
  return errors
}

function isValidAddressMappingPayload(valueMapping: ValueMapping) {
  return errorsInMappingPayload(valueMapping).length === 0
}

module.exports = {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  isValidSignature
}
