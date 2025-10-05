'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  latitude: number
  longitude: number
  created_at: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: () => Promise<void>
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          localStorage.setItem('acep_user', JSON.stringify(data.user))
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('acep_user')
  }

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('acep_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('acep_user')
      }
    }
    setLoading(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
