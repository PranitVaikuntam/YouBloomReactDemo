import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

/**
 * Layout route guarding every authenticated page, so the guard is declared
 * once instead of per route. `replace` keeps the guarded URL out of history.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
