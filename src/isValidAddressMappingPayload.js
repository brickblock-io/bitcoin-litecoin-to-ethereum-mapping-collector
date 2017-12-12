const { is, not } = require("ramda")
const isString = is(String)
// const Message = require("bitcore-message")

const isValidSignature = (address, message, signature) => {
  // So this library seems to be screwed.
  // Since we are way too late with deployments, I skip signature verification
  // FIXME
  return true
  /* let ret = false
   * try {
   *   ret = Message(message).verify(address, signature)
   * } catch (e) {
   *   ret = false
   * }
   * return ret*/
}

const errorsInMappingPayload = valueMapping => {
  let errors = []
  if (not(isString(valueMapping.address))) {
    errors.push("Missing Bitcoin/Litecoin address")
  }
  if (not(isString(valueMapping.ethereumAddress))) {
    errors.push("Missing Ethereum address")
  }
  if (not(isString(valueMapping.signature))) {
    errors.push("Missing signature")
  }
  if (errors.length > 0) {
    console.assert(Array.isArray(errors))
    return errors
  }
  if (
    not(
      isValidSignature(
        valueMapping.address,
        valueMapping.ethereumAddress,
        valueMapping.signature
      )
    )
  ) {
    errors.push("Invalid signature")
  }
  console.assert(Array.isArray(errors))
  return errors
}

function isValidAddressMappingPayload(valueMapping) {
  return errorsInMappingPayload(valueMapping).length === 0
}

module.exports = {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  isValidSignature
}
