const cookie = require('cookie')
const { callFn } = require('./helpers')

// see https://www.jsonrpc.org/specification
const JSONRPC_VERSION = '2.0'

const errorCodes = {
  INVALID_REQUEST: '-32600',
  METHOD_NOT_FOUND: '-32601',
  INTERNAL_ERROR: '-32603',
}

class Bridge {

  constructor(opts = {}) {
    const {
      ignoreMethodNameRegex = /^_/,
      throwOnDup = true,
    } = opts

    // functions registered that match this regex will be ignored
    // (such as methods on a class starting with _)
    this.ignoreMethodNameRegex = ignoreMethodNameRegex

    // will throw an error if more than one function is added with the same name
    this.throwOnDup = throwOnDup
  }

  methods = {
    '__TEST_BAD_RESPONSE_ID': { fn: () => null, ctx: null }
  }

  // Register fulfills these scenarios:
  // 1. register(fn)
  // 2. register(fn, context)
  // 3. register(name, fn)
  // 4. register(name, fn, context)
  // 5. register(new Class())
  // 6. register({})
  // 7. ????
  register() {
    const args = [ ...arguments ]
    // 1 + 2
    if (typeof args[0] === 'function') {
      this._registerFunction({ fn: args[0], ctx: args[1] })
    }
    // 3 + 4
    else if (typeof args[0] === 'string' && typeof args[1] === 'function') {
     this._registerFunction({ name: args[0], fn: args[1], ctx: args[2] })
    }
    // 5 + 6
    else if (typeof args[0] === 'object') {
      this._registerFunctionsOfObject({ obj: args[0] })
    } 
    // 7
    else {
      throw new Error('Bad arguments given to register()')
    }
  }

  _registerFunction({ fn, name = fn.name, ctx = null }) {
    if(!name) {
      throw new Error('Tried to register a function without a name.')
    }
    if (this.throwOnDup && this._hasMethod(name)) {
      throw new Error(`A jsonprc method has already been registered with the name "${name}"`)
    }
    this.methods[name.toString()] = { fn, ctx }
  }

  _registerFunctionsOfObject({ obj }) {
    const propNames = obj.constructor.name !== 'Object' ? 
      Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) : 
      Object.getOwnPropertyNames(obj)

    for (let name of propNames) {
      if (name !== 'constructor' && typeof obj[name] === 'function' && !(this.ignoreMethodNameRegex.test(name))) {
        this._registerFunction({ fn: obj[name], ctx: obj })
      }
    }
  }

  _hasMethod(name) {
    return this.methods.hasOwnProperty(name)
  }

  _getMethod(name) {
    return this.methods[name]
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
      if (!this._hasMethod(method)) {
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
        const { fn, ctx } = this._getMethod(method)
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