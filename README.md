# Magic Bridge
====================

Magic Bridge lets you call functions on a Node.JS server from a client, abstracting away HTTP.

Register functions on the server:

```js
const newBridge = require('@magic-bridge/bridge')
// import bridge from '@magic-bridge/bridge'
const bridge = newBridge()

// register functions or or classes
bridge.register(function getServerThing() {
  return 'i am a string from server'
}

// use with express 
const app = express()
app.use('/jsonrpc/default', bridge.middleware())
```

Now you can call them from the client:

```js
const bridge = require('@magic-bridge/client')
// import bridge from '@magic-bridge/client'
const bridge = newBridge()

const thingFromServer = await bridge.getServerThing()
// thingFromServer === 'i am a string from server'
```

## Install

At your server:

```
npm install @magic-bridge/bridge
```

At your client:

```
npm install @magic-bridge/client
```

## Usage

Magic Bridge is designed to be used as Express middleware.

### Registering functions

Magic Bridge provides a few ways of registering functions via `register()`:

#### Just a function

```js
bridge.register(function func() { ... })
// client: await bridge.func()
```

#### A function with context

```js
const obj = {
  x: 99,
  func: function () { 
    return this.x
  }
}
bridge.register(func, obj)
// client: await bridge.func() --> 99
```

#### A function with a given name

```js
bridge.register('myFunc', () => { ... })
// client: await bridge.myFunc()
```

#### A function with a given name and context

```js
const obj = {
  x: 99,
  func: function() { 
    return this.x
  }
}
bridge.register('myFunc', obj.func, obj)
// client: await bridge.myFunc() --> 99
```

#### An instance of a class

This is quite handy, espcially in combination with [multiple bridges](#multiple-bridges)

```js
class Clazz {
  myMethod() {
    return 99
  }
}
const clazz = new Clazz()
bridge.register(clazz)
// client: await bridge.myMethod()
```

<a name=multiple-bridges></a>

### Multple bridges

You can create multiple bridge instances in a single application, this useful for two main reasons:

1. It acts as a namespace for classes or collections of related functions
2. Registered functions/methods requiring different credentials can be used as separate middleware

```js
const newBridge = require('@magic-bridge/bridge')

const auth = new Auth();
const account = new Account()

const authBridge = newBridge()
const accountBridge = newBridge()

app.use('/jsonrpc/auth', authBridge.middleware())
app.use('/jsonrpc/account', ensureLoggedIn(), accountBridge.middleware())
```

and on the client:

```js
const newBridge = require('@magic-bridge/client')

const authBridge = newBridge('/jsonrpc/auth')
const accountBridge = newBridge('/jsonrpc/account')

await authBridge.login()
await accountBridge.changeUsername()
```

### Local arg resolvers

Functions on the server can be injected with `request`, `response`, `request.session` and `request.cookie` arguments that 
are invisible to the client.

Use arguments with these method names in any postion to have them injected:

| `_request_` | The (express) request object |
| `_response_` | The (express) response object |
| `_sessions_` | The (express) request session object (if using [express-session](https://github.com/expressjs/session) middleware|
| `_cookie_`   | Parsed request cookies |

Example: 

```js
function changeUsername(_session_, newUsername) {
  const user = db.getUser(_session_.userId)
  user.setUsername(newUsername)
  ...
}
