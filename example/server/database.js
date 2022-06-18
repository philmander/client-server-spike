let _todos = {}

class Database {

  putTodos(todos, _cookies_) {
    const userId = _cookies_.auth;
    if(userId) {
      _todos[userId] = todos
    }
  }

  getTodos(_cookies_) {
    const userId = _cookies_.auth;
    return _todos[userId] || []
  }
}

module.exports = Database