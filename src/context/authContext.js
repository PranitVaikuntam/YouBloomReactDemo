import { createContext, useContext } from 'react'

export const STORAGE_KEY = 'youbloom.phone'

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
