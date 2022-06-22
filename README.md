Magic Bridge
====================

Magic Bridge lets you call functions on a Node.JS server from a client, abstracting away HTTP.

Register a function on the server:

```js
const newBridge = require('@magic-bridge/bridge')
// import bridge from '@magic-bridge/bridge'
const bridge = newBridge()

// register functions (or classes)
bridge.register(function getServerThing() {
  return 'i am a string from server'
}

// use with express 
const app = express()
app.use('/jsonrpc/default', bridge.middleware())
```

Now you can call it from the client:

```js
const bridge = require('@magic-bridge/client')
// import bridge from '@magic-bridge/client'
const bridge = newBridge()

// call a function on the server!
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

- [Create a bridge instance](#create-a-bridge-instance)
- [Registering functions](#registering-functions)
  - [Just a function](#just-a-function)
  - [A function with context](#a-function-with-context)
  - [A function with a given name](#a-function-with-a-given-name)
  - [A function with a given name and context](#a-function-with-a-given-name-and-context)
  - [An instance of a class](#an-instance-of-a-class)
  - [A plain object](#functions-on-a-plain-object)
- [Using middleware with Express](#using-middleware-with-express)
- [Multple bridges](#multple-bridges)
- [Local arg resolvers](#local-arg-resolvers)

### Create a bridge instance

The Magic Bridge module exports a factory function for making new bridges both on the client and the server. 
The server optionally accepts some advanced options:

#### On the server

```js
const newBridge = require('@magic-bridge/bridge')

const bridge = newBridge()
// or
const bridge = newBridge({ opts })
```

| Option | Description | Type | Default |
|----------|-------------|----|---------|
| `ignoreMethodNameRegex` | Functions registered that match this regex will be ignored. Such as methods on a class starting with an underscore to denote that they are private | `regex` | `/^_/` |
| `throwOnDup` | Will throw an error if more than one function is added with the same name | `boolean` | `true` | 


#### On the client

The client accepts one optional arguemnt; the url/path of the [Magic Bridge middleware](#express)

```js
const newBridge = require('@magic-bridge/client')

const bridge = newBridge() // uses /jsonrpc/default
// or 
const bridge = newBridge('/my-magic-bridge-url')
```

the client bridge is now ready to call functions on the server:

```js
// bridge calls must always be async
const thingFromServer = await bridge.doServerThing()
```

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
bridge.register(obj.func, obj)
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
  anotherMethod() {
    return 88
  }
}
const clazz = new Clazz()
bridge.register(clazz)
// client: await bridge.myMethod() --> 99
// client: await bridge.anotherMethod() --> 88
```

#### Functions on a plain object

This is quite handy, espcially in combination with [multiple bridges](#multiple-bridges)

```js
const obj {
  myFunction() {
    return 99
  }
  anotherFunction() {
    return 88
  }
}

bridge.register(obj)
// client: await bridge.myFunction() --> 99
// client: await bridge.anotherFunction() --> 88
```

### Using middleware with Express

Magic Bridge is designed to be used as Express middleware. The default path used by
the client is `/jsonrpc/default`, so the default set up is to do this:

```js
const app = express()
app.use('/jsonrpc/default', bridge.middleware())
```

If you do use a different path, you must also configure the bridge side on the client to use it:

```js
// client side:
const bridge = newBridge('/my-magic-bridge-path')
```

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

| Argument | Resolves to |
|----------|-------------|
| `_request_` | The (express) request object |
| `_response_` | The (express) response object |
| `_session_` | The (express) request session object (if using [express-session](https://github.com/expressjs/session) middleware|
| `_cookies_`   | Parsed request cookies |

Examples: 

```js
function changeUsername(_session_, newUsername) {
  const user = db.getUser(_session_.userId)
  user.setUsername(newUsername)
  ...
}
```

```js
function changeUsername(newUsername, _cookies_) {
  const user = db.getUser(_cookies_.token)
  user.setUsername(newUsername)
  ...
}
```
