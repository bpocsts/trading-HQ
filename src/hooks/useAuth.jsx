// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null)
      return undefined
    }

    const unsub = onAuthStateChanged(auth, u => setUser(u || null))
    return unsub
  }, [])

  const logout = async () => {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, logout, loading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
