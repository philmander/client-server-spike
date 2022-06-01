const mocha = require('mocha')
const assert = require('assert')
const bridge = require('./bridge')

describe('Direct server calls', function () {
  it('calls a method on the server', async () => {

    const res = await bridge.add(10, 10)
    assert.equal(res.result, 20)
  })
})