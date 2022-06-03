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
    return function(req, res, next) {
      if (req.url === '/jsonrpc-bridge') {
        const { method, params, id } = req.body
        const send = {
          jsonrpc: '2.0',
          id,
        }
    
        if (bridge.hasMethod(method)) {
          send.result = this.methods[method](...params)
        }
    
        res.send(send)
      } else {
        next()
      }
    }.bind(this)
  }
}

module.exports = bridge