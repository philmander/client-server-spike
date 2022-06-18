const express = require('express')
const session = require('express-session')
const newBridge = require('../../bridge/index')
const Database = require('./database')

const { log } = console

const app = express()
const port = 3001
app.use(express.json())
app.use(session({
  secret: 'magic',
}))

const bridge = newBridge()
app.use('/jsonrpc-bridge', bridge.middleware())
bridge.register(new Database())

app.use('/', express.static('../client/dist'))

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})