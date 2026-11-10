import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthProvider.jsx'
import { LoginPage } from '../LoginPage.jsx'

// vi.hoisted, not a plain const: vi.mock's factory runs while this file's own
// imports are being resolved, before any top-level statement in the body — a
// plain const would still be in its temporal dead zone.
const navigateMock = vi.hoisted(() => vi.fn())

// A partial mock. A bare factory would also stub out MemoryRouter and
// Navigate and break the render.
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  // jsdom's localStorage persists across tests in a file and AuthProvider
  // reads it on mount, so without this each test would start logged in from
  // the previous one's successful submit.
  beforeEach(() => {
    localStorage.clear()
    navigateMock.mockClear()
  })

  it('shows the country-code error and does not navigate for a local number', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByRole('textbox'), '0712345678')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      screen.getByText(
        'Phone number must start with a country code, e.g. +254',
      ),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('navigates to the list for a valid international number', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByRole('textbox'), '+254712345678')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true })
  })
})
