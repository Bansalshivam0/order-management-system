import { createContext, useContext, useState, ReactNode } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone_number: string
}

interface AuthContextType {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('oms_user')
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  function setUser(u: AuthUser | null) {
    setUserState(u)
    if (u) {
      localStorage.setItem('oms_user', JSON.stringify(u))
    } else {
      localStorage.removeItem('oms_user')
    }
  }

  function logout() {
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
