const {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  isValidSignature
} = require('../src/isValidAddressMappingPayload.js')

const test = require('tape')

const { assoc, dissoc, not } = require('ramda')

const validMapping = {
  address: '1Au9ATfh7btcE2ongcYs7HdmFP3X87By5x',
  ethereumAddress: '0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe',
  signature:
    'IEIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA='
}

test('verifying a signature', t => {
  t.assert(
    isValidSignature(
      '1Au9ATfh7btcE2ongcYs7HdmFP3X87By5x',
      '0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe',
      'IEIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA='
    )
  )
  t.assert(
    isValidSignature(
      '17KxmFM2U7Y7Du5fjyMefrxjKkN5DSeBj8',
      '0x57B174839cbD0A503B9Dfcb655e4f4B1B47B3296',
      'IEehJCpI1dFZzW2HBk1P1dILtq+++fZXzRsCDKXxUiyPTwNUT8MXRc4EbRsf+jbhHCZd9zxuobMuPiMqNF1Kwa4='
    )
  )
  t.assert(
    isValidSignature(
      '13ZqjBc1PS6Q8KZ5FeHk7ooiBLJfsTBFSt',
      '0x4A4699D4C795c67844502Cd6b7b80a29ef189fe2',
      'H4Nlv9cwRkLASoQbeU+U29F1XoJ4IpUBTH1TJouNuUXcDx6k+/jIwP3Vt9duz7beg1Sec9pNSGc7kvlWf+cqMiw='
    )
  )
  t.assert(errorsInMappingPayload)
  /* t.assert(
   *   not(
   *     isValidSignature(
   *       validMapping.address,
   *       'false message',
   *       validMapping.signature
   *     )
   *   ),
   *   isValidSignature(
   *     validMapping.address,
   *     'false message',
   *     validMapping.signature
   *   )
   * )*/
  /* t.assert(
   *   not(
   *     isValidSignature(
   *       validMapping.address,
   *       validMapping.ethereumAddress,
   *       'badly formatted signature'
   *     )
   *   ),
   *   'badly formatted signature'
   * )*/
  /* t.assert(
   *   not(
   *     isValidSignature(
   *       validMapping.address,
   *       validMapping.ethereumAddress,
   *       'IAIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA='
   *     )
   *   ),
   *   'Well formatted, but invalid signature'
   * )*/
  t.end()
})

test('validating mappings', t => {
  /* t.deepLooseEqual(
   *   errorsInMappingPayload(
   *     assoc('signature', 'this is an invalid signature!', validMapping)
   *   ),
   *   ['Invalid signature']
   * )*/
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc('address', validMapping)),
    ['Missing Bitcoin/Litecoin address'],
    'Mapping lacking address'
  )
  t.deepLooseEqual(errorsInMappingPayload(dissoc('signature', validMapping)), [
    'Missing signature'
  ])
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc('ethereumAddress', validMapping)),
    ['Missing Ethereum address']
  )
  t.end()
})
