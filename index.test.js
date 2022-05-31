const mocha = require('mocha')
const assert = require('assert')
const server = require('./client')

describe('Direct server calls', function () {
  it('calls a method on the server', async t => {
    const result = server.add(10, 10)
    t.ok(result, 20)
  })
})