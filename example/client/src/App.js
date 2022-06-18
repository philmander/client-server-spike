import { h } from 'preact'
import { useState } from 'preact/hooks'
import Todo from './Todo';

//import magic from '../../../client/dist/main'

const ENTER_KEY = 13;

const App = () => {
  const [todos, setTodos] = useState([])

  function handleNewTodo(ev) {
    if (ev.keyCode !== ENTER_KEY) {
      return;
    }

    const title = ev.target.value

    if (title) {
      setTodos(todos => todos.concat({
        title,
        completed: false,
      }))
      ev.target.value = '';
    }
  }

  function handleToggle(todoToToggle) {
    setTodos(todos => todos.map(todo => todo !== todoToToggle ?
      todo : Object.assign({}, todo, { completed: !todo.completed })))
  }

  function handleSave(todoToUpdate, value) {
    setTodos(todos => todos.map(todo => todo !== todoToUpdate ?
      todo : Object.assign({}, todo, { title: value })))
  }

  function handleDestroy(todoToDestroy) {
    setTodos(todos => todos.reduce((todos, todo) => {
      if (todo !== todoToDestroy) {
        todos.push(todo)
      }
      return todos;
    }, []))
  }

  function toggleAll(ev) {
    const { checked } = ev.target
    setTodos(todos => todos.map(todo => Object.assign({}, todo, { completed: !checked })))
  }

  const activeTodoCount = todos.filter(todo => todo.completed).length
 
  return (
    <section class="todoapp">
      <div>
        <header class="header">
          <h1>todos</h1>
          <input
            class="new-todo"
            placeholder="What needs to be done?"
            onKeyDown={handleNewTodo}
            autoFocus={true}
          />
        </header>
        {
          todos.length && <section class="main">
            <input
              id="toggle-all"
              class="toggle-all"
              type="checkbox"
              onChange={toggleAll}
              checked={activeTodoCount === 0}
            />
            <label htmlFor="toggle-all" />
            <ul class="todo-list">
              {
                todos.map(todo => (
                  <Todo todo={todo}
                    onToggle={handleToggle}
                    onDestroy={handleDestroy}
                    onSave={handleSave} />
                ))
              }
            </ul>
          </section>
        }
      </div>
    </section>
  )
}

export default App;
