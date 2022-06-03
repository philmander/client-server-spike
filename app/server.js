const bridge = require('./middleware')

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

app.use(bridge.middleware())

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})