import { h, createRef } from 'preact'
import { useState } from 'preact/hooks'

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

const Todo = ({ todo, onDestroy, onToggle, onSave }) => {

  const [ editText, setEditText ] = useState(todo.title)
  const [ editing, setEditing ] = useState(false)
  const editInput = createRef();

  function handleSubmit(ev) {
    const val = ev.target.value.trim()
    if (val) {
      setEditText(val)
      setEditing(false)
      onSave(todo, val)
    } else {
      onDestroy(todo);
    }
  }

  function handleEdit(ev) {
    setEditing(true)
    const toFocus = editInput.current
    setTimeout(() => {
      toFocus.focus()
    }, 0)
    
  }

  function handleKeyDown(ev) {
    if (ev.which === ESCAPE_KEY) {
      setEditText(todo.title)
      setEditing(false)
    } else if (ev.which === ENTER_KEY) {
      handleSubmit(ev);
    }
  }

  return (
    <li class={`${todo.completed ? 'completed' : ''} ${editing ? 'editing' : ''}`}>
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
        />
        <label ondblclick={handleEdit}>
          {todo.title}
        </label>
        <button class="destroy" onClick={() => onDestroy(todo)} />
      </div>
      <input
        ref={editInput}
        class="edit"
        value={editText}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </li>
  )
}

export default Todo