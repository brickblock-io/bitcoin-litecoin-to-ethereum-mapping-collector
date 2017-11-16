const {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  isValidSignature
} = require("../src/isValidAddressMappingPayload.js")

const test = require("tape")

const { assoc, dissoc, not } = require("ramda")

const validMapping = {
  address: "1Au9ATfh7btcE2ongcYs7HdmFP3X87By5x",
  ethereumAddress: "0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe",
  signature:
    "IEIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA="
}

test("verifying a signature", t => {
  t.assert(
    isValidSignature(
      "1Au9ATfh7btcE2ongcYs7HdmFP3X87By5x",
      "0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe",
      "IEIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA="
    )
  )
  t.assert(
    not(
      isValidSignature(
        validMapping.address,
        "false message",
        validMapping.signature
      )
    )
  )
  t.assert(
    not(
      isValidSignature(
        validMapping.address,
        validMapping.ethereumAddress,
        "badly formatted signature"
      )
    ),
    "badly formatted signature"
  )
  t.assert(
    not(
      isValidSignature(
        validMapping.address,
        validMapping.ethereumAddress,
        "IAIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA="
      )
    ),
    "Well formatted, but invalid signature"
  )
  t.end()
})

test("validating mappings", t => {
  t.deepLooseEqual(
    errorsInMappingPayload(
      assoc("signature", "this is an invalid signature!", validMapping)
    ),
    ["Invalid signature"]
  )
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc("address", validMapping)),
    ["Missing Bitcoin/Litecoin address"],
    "Mapping lacking address"
  )
  t.deepLooseEqual(errorsInMappingPayload(dissoc("signature", validMapping)), [
    "Missing signature"
  ])
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc("ethereumAddress", validMapping)),
    ["Missing Ethereum address"]
  )
  t.end()
})
