import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { DetailPage } from './pages/DetailPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MainPage } from './pages/MainPage.jsx'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* One guard and one Layout for both protected pages, rather than
          wrapping each route individually. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/users/:id" element={<DetailPage />} />
        </Route>
      </Route>
      {/* <Routes> renders nothing when no child matches, so an unknown URL
          would be a blank page with no way forward. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
