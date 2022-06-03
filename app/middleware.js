const errorCodes = {
  INVALID_REQUEST: '-32600',
  METHOD_NOT_FOUND: '-32601',
  INTERNAL_ERROR: '-32603',
}

const JSONRPC_VERSION = '2.0'

const bridge = {
  methods: {},
  register: function () {
    let method, name
    if (arguments.length === 1) {
      method = arguments[0]
      name = method.name
    } else if (arguments.length == 2) {
      method = arguments[1]
      name = arguments[0]
    }
    this.methods[name] = method
  },
  hasMethod: function (name) {
    return this.methods.hasOwnProperty(name)
  },
  middleware: function() {

    function sendError(res, status, code, message) {
      return res.status(status).send({
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
          return sendError(res, 400, errorCodes.INVALID_REQUEST, `Invalid request: missing ${missing}`)
        }
        if(jsonrpc !== JSONRPC_VERSION) {
          return sendError(res, 400, errorCodes.INVALID_REQUEST, `Invalid request: wrong jsonrpc version (${jsonrpc})`)
        }

        // ok, send response
        const send = {
          jsonrpc: JSONRPC_VERSION,
          id,
        }
    
        if (bridge.hasMethod(method)) {
          try {
            send.result = this.methods[method](...params)
          } catch(err) {
            return sendError(res, 500, errorCodes.INTERNAL_ERROR, err.message)
          }
        } else {
          return sendError(res, 400, errorCodes.METHOD_NOT_FOUND, `Method not found: ${method}`)
        }
    
        res.status(200).send(send)
      } else {
        next()
      }
    }.bind(this)
  }
}

module.exports = bridge