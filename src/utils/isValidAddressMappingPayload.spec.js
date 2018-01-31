// @flow

const test = require('tape')
const { assoc, dissoc, not } = require('ramda')

const {
  isValidAddressMappingPayload,
  errorsInMappingPayload,
  isValidSignature
} = require('./isValidAddressMappingPayload.js')

const validBTCMapping = {
  address: '1JpdKD25rPUyU9ET9xnNiE8cbroMK1woVz',
  addressType: 'BTC',
  ethereumAddress: '0x5523e5d5ba8284f59869e5f4b054ccaaeee4fb48',
  signature:
    'H8ebd0Vp5lqptoKC8mqlYRs2SqPHoIYHaYJbZ27SDn7sSYhJ7SFbdjFi9CbjoMTtKWupQIQL1FRPsGsnTEs4Fjk='
}

const validBTCSegWitMapping = {
  address: '3DfbDR3bFykVodkwnQbMwUWbXjPhafvadP',
  addressType: 'BTC',
  ethereumAddress: '0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe',
  signature:
    'H09xFpdL9v+aqgyfoUQYl0LgF3g63nil0B0RTMYWIlAweRe3ULd+cO8qzwuzTJ9hR1jlGzaEJPVSrafskGQUBeQ='
}

const validLTCMapping = {
  address: 'LRWUJTkYQeAxz5aj7LfpJ6sjubVKbMVrvH',
  addressType: 'LTC',
  ethereumAddress: '0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe',
  signature:
    'IEllG0WF0i9YqcSBCvb3ud79NuDV6/sA4qr447NRqeHFJejRAG/szo52yI7M+Cnc45YFLjsYV1DtaakmobNth2A='
}

test('verifying a signature', t => {
  t.assert(
    isValidSignature(
      validBTCMapping.address,
      validBTCMapping.addressType,
      validBTCMapping.ethereumAddress,
      validBTCMapping.signature
    ),
    'validBTCMapping'
  )
  t.assert(
    not(
      isValidSignature(
        validBTCSegWitMapping.address,
        validBTCSegWitMapping.addressType,
        validBTCSegWitMapping.ethereumAddress,
        validBTCSegWitMapping.signature
      )
    ),
    'validBTCSegWitMapping should fail; if it passes then someone has added support :D'
  )
  t.assert(
    isValidSignature(
      validLTCMapping.address,
      validLTCMapping.addressType,
      validLTCMapping.ethereumAddress,
      validLTCMapping.signature
    ),
    'validLTCMapping'
  )
  t.assert(
    isValidSignature(
      '1Au9ATfh7btcE2ongcYs7HdmFP3X87By5x',
      validBTCMapping.addressType,
      '0x908ad7535af813aa60fdfce13bfc203ae5f3fcfe',
      'IEIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA='
    )
  )
  t.assert(
    isValidSignature(
      '17KxmFM2U7Y7Du5fjyMefrxjKkN5DSeBj8',
      validBTCMapping.addressType,
      '0x57B174839cbD0A503B9Dfcb655e4f4B1B47B3296',
      'IEehJCpI1dFZzW2HBk1P1dILtq+++fZXzRsCDKXxUiyPTwNUT8MXRc4EbRsf+jbhHCZd9zxuobMuPiMqNF1Kwa4='
    )
  )
  t.assert(
    isValidSignature(
      '13ZqjBc1PS6Q8KZ5FeHk7ooiBLJfsTBFSt',
      validBTCMapping.addressType,
      '0x4A4699D4C795c67844502Cd6b7b80a29ef189fe2',
      'H4Nlv9cwRkLASoQbeU+U29F1XoJ4IpUBTH1TJouNuUXcDx6k+/jIwP3Vt9duz7beg1Sec9pNSGc7kvlWf+cqMiw='
    )
  )

  t.assert(
    not(
      isValidSignature(
        validBTCMapping.address,
        validBTCMapping.addressType,
        'false message',
        validBTCMapping.signature
      )
    ),
    'an incorrect message should fail'
  )
  t.assert(
    not(
      isValidSignature(
        validBTCMapping.address,
        validBTCMapping.addressType,
        validBTCMapping.ethereumAddress,
        'badly formatted signature'
      )
    ),
    'an incorrectly formatted signature should fail'
  )
  t.assert(
    not(
      isValidSignature(
        validBTCMapping.address,
        validBTCMapping.addressType,
        validBTCMapping.ethereumAddress,
        'IAIpDoCrsQqGZrdZNflrEk8vuDI8TzgwOAIPRdJtsdg8fFkt+SgV4uMG5zI95REQebg1hiz/7m+zo6DfHdyceWA='
      )
    ),
    'an incorrect signature should fail'
  )
  t.end()
})

test('validating mappings', t => {
  t.deepLooseEqual(
    errorsInMappingPayload(
      assoc('signature', 'this is an invalid signature!', validBTCMapping)
    ),
    ['Invalid signature']
  )
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc('address', validBTCMapping)),
    ['Missing Bitcoin/Litecoin address'],
    'Mapping lacking address'
  )
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc('signature', validBTCMapping)),
    ['Missing signature']
  )
  t.deepLooseEqual(
    errorsInMappingPayload(dissoc('ethereumAddress', validBTCMapping)),
    ['Missing Ethereum address']
  )
  t.end()
})
