function add() {
  return '20'
}

const http = require('http');

const requestListener = function (req, res) {
  const data = {
    result: 20
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

const server = http.createServer(requestListener);
server.listen(3000);