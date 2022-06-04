const { type } = require("server/reply")

const errorCodes = {
  INVALID_REQUEST: '-32600',
  METHOD_NOT_FOUND: '-32601',
  INTERNAL_ERROR: '-32603',
}

const JSONRPC_VERSION = '2.0'

const bridge = {
  methods: {
    '__TEST_BAD_RESPONSE_ID': { fn: () => null, ctx: null }
  },
  // 1. register(fn)
  // 2. register(fn, context)
  // 3. register(name, fn)
  // 3. register(name, fn, context)
  register: function () {
    let fn, name, ctx = null
    if(typeof arguments[0] === 'function') {
      fn = arguments[0]
      name = fn.name
      if(arguments[1]) {
        ctx = arguments[1]
      }
    } else if(typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
      fn = arguments[1]
      name = arguments[0]
      if(arguments[2]) {
        ctx = arguments[1]
      }
    } else {
      throw new Error('Bad arguments given to register')
    }
    this.methods[name] = {
      fn,
      ctx,
    }
  },
  hasMethod: function (name) {
    return this.methods.hasOwnProperty(name)
  },
  middleware: function() {

    function sendError(res, status, id, code, message) {
      return res.status(status).send({
        id,
        code,
        message,
      })
    }

    return function(req, res, next) {
      if(req.url === '/jsonrpc-bridge') {
        const { jsonrpc, method, params, id } = req.body

        // errors
        let missing;
        if(!method) {
          missing = 'method'
        }
        if(!id) {
          missing = 'id'
        }
        if(missing) {
          return sendError(res, 400, id, errorCodes.INVALID_REQUEST, `Invalid request: missing ${missing}`)
        }
        if(jsonrpc !== JSONRPC_VERSION) {
          return sendError(res, 400, id, errorCodes.INVALID_REQUEST, `Invalid request: wrong jsonrpc version (${jsonrpc})`)
        }
        if (!bridge.hasMethod(method)) {
          return sendError(res, 400, id, errorCodes.METHOD_NOT_FOUND, `Method not found: ${method}`)
        }

        // ok, send response
        const send = {
          jsonrpc: JSONRPC_VERSION,
          id: method === '__TEST_BAD_RESPONSE_ID' ? 'bad_id_123' : id,
        }
    
        try {
          const { fn, ctx } = this.methods[method]
          send.result = fn.call(ctx, ...params)
        } catch(err) {
          return sendError(res, 500, id, errorCodes.INTERNAL_ERROR, `Internal server error: ${err.message}`)
        }
  
        res.status(200).send(send)
      } else {
        next()
      }
    }.bind(this)
  }
}

module.exports = bridge