import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showLogin, setShowLogin] = useState(true)

  if (!token) {
    return showLogin ? (
      <Login setToken={setToken} switchToRegister={() => setShowLogin(false)} />
    ) : (
      <Register setToken={setToken} switchToLogin={() => setShowLogin(true)} />
    )
  }

  return <Dashboard token={token} setToken={setToken} />
}

export default App