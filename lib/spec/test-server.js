process.title = 'magic-bridge-test-server'

const newBridge = require('../bridge')

const bridge = newBridge()
const circle = newBridge()
const triangle = newBridge()

bridge.register(function add() {
  return 20
})
bridge.register(function multiply(num1, num2) {
  return num1 * num2
})
bridge.register(function concat({ foo, bar }) {
  return `${foo}${bar}`
})
bridge.register(function somethingWrong() {
  throw new Error('something wrong')
});

let something;
bridge.register(function changeSomething() {
  something = 'hello world'
});
bridge.register(function getSomething() {
  return something;
});
bridge.register(function resetSomething() {
  something = 'hello'
});

bridge.register(function saveUser(_session_, email) {
  return `${email}_${_session_.userId}`
})

class Rectangle {
  constructor(height, width) {
    this.height = parseInt(height);
    this.width = parseInt(width);
  }

  // Method
  calcArea() {
    return this.height * this.width;
  }

  calcPerimeter() {
    return (this.height * 2) + (this.width * 2)
  }
}

const rect = new Rectangle(50, 40)

bridge.register(rect);

class Circle {
  constructor(radius) {
    this.radius = parseInt(radius);
  }

  // Method
  calcArea() {
    return (Math.PI * Math.pow(this.radius, 2)).toFixed(2)
  }

  calcPerimeter() {
    return (2 * Math.PI * this.radius).toFixed(2)
  }
}

const _circle = new Circle(100)
circle.register(_circle);


const _triangle = {
  base: 10,
  height: 5,
  calcArea: function() {
    return (0.5 * this.base * this.height).toFixed(2)
  },
}


console.log('--TRIANGE--')
triangle.register(_triangle);

const express = require('express')
const session = require('express-session')
const { log } = console

const app = express()
const port = 3000
app.use(express.json())
app.use(session({
  secret: 'magic',
}))

app.use((req, res, next) => {
  req.session.userId = '99'
  next()
})

app.use('/jsonrpc/default', bridge.middleware())
app.use('/jsonrpc/circle', circle.middleware())
app.use('/jsonrpc/triangle', circle.middleware())

app.listen(port, () => {
  log(`Express server is running on port: ${port}`)
})