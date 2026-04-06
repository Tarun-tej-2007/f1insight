import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('f1_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(({ user: u }) => setUser(u))
      .catch(() => localStorage.removeItem('f1_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.post('/auth/login', { email, password })
    localStorage.setItem('f1_token', token)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { token, user: u } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('f1_token', token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('f1_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { user: u } = await api.get('/auth/me')
    setUser(u)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  )
}
