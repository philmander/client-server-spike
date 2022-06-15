const express = require('express')
const session = require('express-session')
const bridge = require('../../app/index')()
const Database = require('./database')

const app = express()
const port = 3001
app.use(express.json())
app.use(session({
  secret: 'magic',
}))

const { log } = console

app.use((req, res, next) => {
  req.session.userId = '999'
  next()
})

app.use(bridge.middleware())

bridge.register(new Database());

app.use('/', express.static('client/dist'))

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})