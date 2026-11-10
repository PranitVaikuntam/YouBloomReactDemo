import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
import { validatePhone } from '../utils/validatePhone.js'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  // Declarative, rather than navigate() from an effect: it needs no effect and
  // no cleanup, and it does not route this path through the test's useNavigate
  // mock.
  if (isAuthenticated) return <Navigate to="/" replace />

  function handleSubmit(event) {
    event.preventDefault()
    const result = validatePhone(phone)
    if (!result.valid) {
      setError(result.message)
      return
    }
    // The normalized number, not the raw input, so one canonical form is
    // stored however the user typed it.
    login(result.value)
    navigate('/', { replace: true })
  }

  function handleChange(event) {
    setPhone(event.target.value)
    setError('')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          youbloom <span className="text-teal-700">Demo</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your phone number to continue.
        </p>

        {/* A form, so Enter submits and not only a click on the button. */}
        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700"
          >
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={handleChange}
            autoComplete="tel"
            placeholder="+254712345678"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'phone-error' : undefined}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 aria-invalid:border-red-400"
          />
          {error && (
            <p id="phone-error" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}
