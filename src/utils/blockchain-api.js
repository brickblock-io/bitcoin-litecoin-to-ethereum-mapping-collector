require('fetch-everywhere')

const isAddressInICO = async address => {
  const res = await fetch(`${process.env.BLOCKCHAIN_API_URL}/addr/${address}`)
  return res.ok
}

module.exports = {
  isAddressInICO
}
