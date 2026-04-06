import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Drivers from './pages/Drivers'
import Teams from './pages/Teams'
import Races from './pages/Races'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Spinner from './components/common/Spinner'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  return (
    <>
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/races" element={<Races />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
