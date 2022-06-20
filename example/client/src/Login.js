import { h, createRef } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import newBridge from '../../../lib/client/dist/main'

const bridge = newBridge('/jsonrpc/auth')

const users = [
  { id: '1', name: 'User 1' },
  { id: '2', name: 'User 2' },
  { id: '3', name: 'User 3' },
  { id: '4', name: 'User 3' },
]

const Login = ({ onLogin, onLogout }) => {

  const userSelect = createRef();

  const [ loggedIn, setLoggedIn ] = useState(false)

  useEffect(async () => {
    const _loggedIn = await bridge.isLoggedIn()
    setLoggedIn(_loggedIn)
    onLogin()
  }, [])

  async function login(ev) {
    ev.preventDefault()
    const selectedUserId = userSelect.current.value
    const loggedIn = await bridge.login(selectedUserId)
    if(loggedIn) {
      setLoggedIn(true)
      onLogin()
    }
  }

  async function logout() {
    const loggedOut = await bridge.logout()
    if(loggedOut) {
      setLoggedIn(false)
      onLogout()
    }
  }

  return (
    loggedIn ? <button type="button" onClick={logout}>Logout</button> :
  
    <section class="login">
      <form onSubmit={login}>
        <label>Login
          <select ref={userSelect}>
            {users.map(user => <option value={user.id}>{user.name}</option>)}
          </select>
        </label>
        <button type="submit">Login</button>
      </form>
    </section>
  )
}

export default Login