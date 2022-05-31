const mocha = require('mocha')
const assert = require('assert')
const client = require('./client')

describe('Direct server calls', function () {
  it('calls a method on the server',  async () => {
    const result = await client.add(10, 10)
    assert.equal(result, 20)
  })
})