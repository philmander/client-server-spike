let _todos = []

class Database {

  putTodos(todos) {
    _todos = todos
  }

  getTodos() {
    return _todos
  }
}

module.exports = Database