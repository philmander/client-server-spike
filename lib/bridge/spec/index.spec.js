const mocha = require('mocha')
const assert = require('assert')
const newBridge = require('../index')

describe('the server bridge', () => {
  const bridge = newBridge()

  describe('registers functions', () => {
    let bridge

    beforeEach(() => {
      bridge = newBridge()
    })

    it('registers a named function', () => {
      const func = function myFunc() { }
      bridge.register(func)
      const result = bridge._getMethod('myFunc')

      assert.strictEqual(result.fn, func)
    })

    it('registers an assigned anonymous function', () => {
      const myFunc = function () { }
      bridge.register(myFunc)
      const result = bridge._getMethod('myFunc')

      // i was surprised this works
      assert.strictEqual(result.fn, myFunc)
    })

    it('registers an assigned anonymous arrow function', () => {
      const myFunc = () => null 
      bridge.register(myFunc)
      const result = bridge._getMethod('myFunc')

      // i was surprised this works
      assert.strictEqual(result.fn, myFunc)
    })

    it('registers a function with a given name', () => {
      const func = () => {}
      bridge.register('myFunc', func)
      const result = bridge._getMethod('myFunc')

      assert.strictEqual(result.fn, func)
    })
    
    it('registers a named function and its context', () => {
      function myFunc() { }
      const ctx = {}
      bridge.register(myFunc, ctx)
      const result = bridge._getMethod('myFunc')

      assert.strictEqual(result.fn, myFunc)
      assert.strictEqual(result.ctx, ctx)
    })
    
    it('registers a function, with a given name, and its context', () => {
      function func() { }
      const ctx = {}
      bridge.register('myFunc', func, ctx)
      const result = bridge._getMethod('myFunc')

      assert.strictEqual(result.fn, func)
      assert.strictEqual(result.ctx, ctx)
    })

    it('registers an instance of a class', () => {
      class MyClass {
        foo() {}
        bar() {}
        _notMe() {}
      }
      const myInstance = new MyClass()
      bridge.register(myInstance)

      const foo = bridge._getMethod('foo')
      assert.strictEqual(foo.fn, myInstance.foo)
      assert.strictEqual(foo.ctx, myInstance)

      const bar = bridge._getMethod('bar')
      assert.strictEqual(bar.fn, myInstance.bar)
      assert.strictEqual(bar.ctx, myInstance)

      const notMe = bridge._getMethod('_notMe')
      assert.equal(undefined, notMe)

      assert.equal(Object.keys(bridge.methods).length, 3) // includes test methods
    })

    it('registers the functions on an object', () => {
      const obj = {
        foo: () => {},
        bar: () => {},
        _notMe: () => {},
      }
      bridge.register(obj)

      const foo = bridge._getMethod('foo')
      assert.strictEqual(foo.fn, obj.foo)
      assert.strictEqual(foo.ctx, obj)

      const bar = bridge._getMethod('bar')
      assert.strictEqual(bar.fn, obj.bar)
      assert.strictEqual(bar.ctx, obj)

      const notMe = bridge._getMethod('_notMe')
      assert.equal(undefined, notMe)

      assert.equal(Object.keys(bridge.methods).length, 3) // includes test methods
    })

    it('handles bad args', () => {
      assert.throws(() => {
        bridge.register(NaN)
      }, 'bad args')
    })

    it('handles a falsty name', () => {      
      assert.throws(() => {
        bridge.register(()=>{})
      }, 'no name')
    })
  })
})