const express = require('express')
const bridge = require('../../app/index')()
const Database = require('./database')

const app = express()
const port = 3001
app.use(express.json())

const { log } = console

app.use(bridge.middleware())

bridge.register(new Database());

app.use('/', express.static('client/dist'))

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})