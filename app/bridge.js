async function rpc(method) {
  const body = {
    jsonrpc: '2.0',
    method,
    params: [],
    id: 'xxx',
  }

  const res = await fetch('http://localhost:3000/jsonrpc-bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return await res.json()
}

const handler = {
  get(obj, prop) {
    return async function() {
      return rpc(prop)
    }
  },
}

module.exports = new Proxy({}, handler)