const cookie = require('cookie')
const { callFn } = require('./helpers')

const errorCodes = {
  INVALID_REQUEST: '-32600',
  METHOD_NOT_FOUND: '-32601',
  INTERNAL_ERROR: '-32603',
}

const JSONRPC_VERSION = '2.0'

class Bridge {

  constructor(opts = {}) {
    const {
      ignoreMethodNameRegex = /^_/,
      throwOnDup = true,
    } = opts

    this.ignoreMethodNameRegex = ignoreMethodNameRegex
    this.throwOnDup = throwOnDup
  }

  methods = {
    '__TEST_BAD_RESPONSE_ID': { fn: () => null, ctx: null }
  }

  // 1. register(fn)
  // 2. register(fn, context)
  // 3. register(name, fn)
  // 4. register(name, fn, context)
  // 5. register(new Class())
  register() {
    let fn, name, ctx = null
    // 1 + 2
    if (typeof arguments[0] === 'function') {
      fn = arguments[0]
      name = fn.name
      if (arguments[1]) {
        ctx = arguments[1]
      }
    }
    // 2 + 3
    else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
      fn = arguments[1]
      name = arguments[0]
      if (arguments[2]) {
        ctx = arguments[1]
      }
    }
    // 5
    else if (typeof arguments[0] === 'object') {
      const inst = arguments[0]
      for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(inst))) {
        if (key === 'constructor') {
          continue
        }
        if (typeof inst[key] === 'function' && !(this.ignoreMethodNameRegex.test(key.name))) {
          this.register(inst[key], inst)
        }
      }
    } else {
      throw new Error('Bad arguments given to register')
    }

    if (this.throwOnDup && this.hasMethod(name)) {
      throw new Error(`A jsonprc method has already been registered with the name "${name}"`)
    }
    this.methods[name] = {
      fn,
      ctx,
    }
  }

  hasMethod(name) {
    return this.methods.hasOwnProperty(name)
  }

  middleware() {

    function sendError(res, status, id, code, message) {
      return res.status(status).send({
        id,
        code,
        message,
      })
    }

    return function (req, res) {
      const { jsonrpc, method, params, id } = req.body

      // errors
      let missing
      if (!method) {
        missing = 'method'
      }
      if (!id) {
        missing = 'id'
      }
      if (missing) {
        return sendError(res, 400, id, errorCodes.INVALID_REQUEST, `Invalid request: missing ${missing}`)
      }
      if (jsonrpc !== JSONRPC_VERSION) {
        return sendError(res, 400, id, errorCodes.INVALID_REQUEST, `Invalid request: wrong jsonrpc version (${jsonrpc})`)
      }
      if (!this.hasMethod(method)) {
        return sendError(res, 400, id, errorCodes.METHOD_NOT_FOUND, `Method not found: ${method}`)
      }

      // ok, send response
      const toSend = {
        jsonrpc: JSONRPC_VERSION,
        id: method === '__TEST_BAD_RESPONSE_ID' ? 'bad_id_123' : id,
      }

      try {
        const localArgs = {
          request: req,
          response: res,
          session: req.session,
          // a bit inefficient, parsing cookies even if they're not required as local args
          cookies: req.headers.cookie ? cookie.parse(req.headers.cookie) : {},
        }
        const { fn, ctx } = this.methods[method]
        toSend.result = callFn(fn, ctx, params, localArgs)
      } catch (err) {
        return sendError(res, 500, id, errorCodes.INTERNAL_ERROR, `Internal server error: ${err.message}`)
      }

      res.status(200).send(toSend)
    }.bind(this)
  }
}

module.exports = function (opts = {}) {
  return new Bridge(opts)
}