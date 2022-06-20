function randomUUID() {
  const url = URL.createObjectURL(new Blob())
  const [id] = url.toString().split('/').reverse()
  URL.revokeObjectURL(url)
  return id 
}

async function rpc(url, method, params) {
  const id = randomUUID()
  const body = {
    jsonrpc: '2.0',
    method,
    params,
    id,
  }

  const res = await fetch(url, {
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
  get({ url }, prop) {
    return async function() {
      return rpc(url, prop, [ ...arguments ])
    }
  },
}

module.exports =  (url = '/jsonrpc/default') => {
  return new Proxy({ url } , handler)
}