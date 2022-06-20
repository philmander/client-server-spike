const mocha = require('mocha')
const assert = require('assert')
const helpers = require('../helpers')

describe('Server helper functions', function () {

  it('can call a function with no params', async () => {
    const foo = () => 'bar'
    const r = helpers.callFn(foo, null, [])
    assert.equal(r, 'bar')
  })

  it('can call a function', async () => {
    const add = (a, b) => a + b
    const r = helpers.callFn(add, null, [2,3])
    assert.equal(r, 5)
  })

  it('can call a function with context', async () => {
    const add = function (a, b) {
      return a + b + this.num
    }
    const ctx = { num: 4 }
    const r = helpers.callFn(add, ctx, [2,3])
    assert.equal(r, 9)
  })

  it('can call a function where the last arg is a session ', async () => {
    const add = function (a, b, _session_) {
      return (a + b) + _session_
    }
    const localArgs = {
      session: '_SESSION',
    }
    const r = helpers.callFn(add, null, [2,3], localArgs)
    assert.equal(r, '5_SESSION')
  })

  it('can call a function where the first arg is a session ', async () => {
    const add = function (a, _session_, b) {
      return (a + b) + _session_
    }
    const localArgs = {
      session: '_SESSION',
    }
    const r = helpers.callFn(add, null, [2,3], localArgs)
    assert.equal(r, '5_SESSION')
  })

  it('can call a function with request and session args ', async () => {
    const add = function (a, _session_, b, _request_) {
      return (a + b) + _session_ + _request_
    }
    const localArgs = {
      session: '_SESSION',
      request: '_REQUEST',
    }
    const r = helpers.callFn(add, null, [2,3], localArgs)
    assert.equal(r, '5_SESSION_REQUEST')
  })
})