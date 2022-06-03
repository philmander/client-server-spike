const bridge = {
  methods: {},
  register: function() {
    let method, name
    if(arguments.length === 1) {
      method = arguments[0]
      name = method.name
    } else if(arguments.length == 2) {
      method = arguments[1]
      name = arguments[0]
    }
    this.methods[name] = method
  },
  hasMethod: function(name) {
    return this.methods.hasOwnProperty(name)
  },
}

bridge.register(function add() {
  return 20
})
bridge.register(function multiply(num1, num2) {
  return num1 * num2
})

bridge.register(function multiply(num1, num2) {
  return num1 * num2
})

bridge.register(function concat({ foo, bar }) {
  return `${foo}${bar}`
})

const express = require('express')
const { log } = console

const app = express()
const port = 3000
app.use(express.json())

app.use((req, res, next) => {
  if(req.url === '/jsonrpc-bridge') {
    const { method, params, id } = req.body
    const send = {
      jsonrpc: '2.0',
      id,
    }

    if(bridge.hasMethod(method)) {
      send.result = bridge.methods[method](...params)
    }

    res.send(send)
  } else {
    next()
  }
})

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})