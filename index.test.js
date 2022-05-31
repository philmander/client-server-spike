const tap = require('tap')
tap.test('it calls a method on the server', t => {

  const result = server.add(10, 10);

  t.assert(result, 10);
  
});