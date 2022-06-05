const crypto = require('crypto')

async function rpc(method, params) {
  const id = crypto.randomUUID()
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id,
  }

  const res = await fetch('http://localhost:3000/jsonrpc-bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if(id !== data.id) {
    throw new Error('JSON RPC error: Response id does not match request id')
  }

  if(res.status < 300) {
    return data.result
  } else if(res.status >= 400) {
    const msg = data.code ? 
    `JSON RPC error (${data.code}): ${data.message}` : `An unknown JSON RPC error occurred`
    throw new Error(msg)
  }
}

const handler = {
  get(obj, prop) {
    return async function() {
      return rpc(prop, [ ...arguments ])
    }
  },
}

module.exports = {
  bridge: new Proxy({}, handler),
}