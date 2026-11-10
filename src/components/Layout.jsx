import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

/**
 * Chrome shared by every guarded page. The header lives here rather than on
 * MainPage so Logout and the signed-in identity are present on the detail
 * page too.
 */
export function Layout() {
  const { phone, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <p className="text-lg font-semibold tracking-tight">
            youbloom <span className="text-teal-700">Demo</span>
          </p>
          <div className="ml-auto flex items-center gap-4">
            <p className="text-sm text-slate-600">{phone}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
