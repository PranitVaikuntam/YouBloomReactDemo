import { useCallback, useMemo, useState } from 'react'
import { AuthContext, STORAGE_KEY } from './authContext.js'
import { validatePhone } from '../utils/validatePhone.js'

// Every localStorage access in this module goes through these three helpers.
// getItem is not the only call that throws: with storage disabled (Safari
// private mode, enterprise policy) setItem and removeItem throw too, so
// guarding only the read would move the crash into the login handler rather
// than handle it. State is the source of truth; persistence is best-effort.

function readPhone() {
  let stored = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  // localStorage is user-writable, so re-validate what we read: junk must not
  // satisfy the guard or render in the header.
  if (!stored) return null
  const result = validatePhone(stored)
  return result.valid ? result.value : null
}

function writePhone(phone) {
  try {
    localStorage.setItem(STORAGE_KEY, phone)
  } catch {
    // Session simply does not survive a reload.
  }
}

function clearPhone() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — state has already been cleared.
  }
}

export function AuthProvider({ children }) {
  const [phone, setPhone] = useState(readPhone)

  const login = useCallback((next) => {
    setPhone(next)
    writePhone(next)
  }, [])

  const logout = useCallback(() => {
    setPhone(null)
    clearPhone()
  }, [])

  const value = useMemo(
    () => ({ phone, isAuthenticated: Boolean(phone), login, logout }),
    [phone, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
