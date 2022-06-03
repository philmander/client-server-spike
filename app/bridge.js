const crypto = require('crypto')

async function rpc(method, params) {
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id: crypto.randomUUID(),
  }

  const res = await fetch('http://localhost:3000/jsonrpc-bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if(res.status === 200) {
    const data = await res.json()
    return data.result
  }

  throw new Error('nothing works')
  
}

const handler = {
  get(obj, prop) {
    return async function() {
      return rpc(prop, [ ...arguments ])
    }
  },
}

module.exports = new Proxy({}, handler)