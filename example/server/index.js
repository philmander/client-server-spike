const express = require('express')
const cookieParser = require('cookie-parser');
const { ensureLoggedIn } = require('connect-ensure-login')
const newBridge = require('../../bridge/index')
const Database = require('./database')

const { log } = console

const app = express()
const port = 3001
app.use(cookieParser());
app.use(express.json())

// auth bridge
function login(userId, _response_) {
  console.log(`Logging in for ${userId}`)
  _response_.cookie('auth',userId, { httpOnly: true })
  return true
}
function logout(_response_) {
  console.log(`Logging out`)
  _response_.cookie('auth','', { httpOnly: true })
  return true
}
function isLoggedIn(_request_) {
  return !!_request_.cookies.auth
}
const authBridge = newBridge()
authBridge.register(login)
authBridge.register(logout)
authBridge.register(isLoggedIn)

// todos bridge
const todosBridge = newBridge()
todosBridge.register(new Database())

app.use('/', express.static('../client/dist'))
app.use((req, res, next) => {
  req.isAuthenticated = () => !!req.cookies.auth
  next()
})
app.use('/jsonrpc/auth', authBridge.middleware())
app.use('/jsonrpc/todos', ensureLoggedIn(), todosBridge.middleware())


app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})