const mocha = require('mocha')
const assert = require('assert')
const bridge = require('./bridge')

describe('Direct server calls', function () {
  it('calls a method on the server', async () => {
    const val = await bridge.add(10, 10)
    assert.equal(val, 20)
  })

  it('calls a method on the server with array params', async () => {
    const val1 = await bridge.multiply(10, 10)
    assert.equal(val1, 100)

    const val2 = await bridge.multiply(10, 20)
    assert.equal(val2, 200)
  })

  it('calls a method on the server with object params', async () => {
    const val = await bridge.concat({ foo: 'foo', bar: 'bar'})
    assert.equal(val, 'foobar')
  })

  it('it throws if the method was not found', async () => {
    try {
      await bridge.lalala();
      assert.fail('Missing method was found!')
    } catch(err) {
      assert.equal(err.message, 'foo')
    }
  })
})