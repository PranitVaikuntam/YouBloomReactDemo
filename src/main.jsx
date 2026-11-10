import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import './index.css'

// AuthProvider sits inside BrowserRouter so anything it renders may use
// router hooks. StrictMode stays on deliberately: its double-invoked effects
// exercise the abort handling in useFetch and services/api.js in development.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
