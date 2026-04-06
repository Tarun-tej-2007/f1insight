import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/teams', label: 'Teams' },
  { to: '/races', label: 'Races' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(0,0,0,0.97)'
          : 'linear-gradient(180deg,rgba(0,0,0,0.9) 0%,transparent 100%)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-10 py-5 md:px-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 select-none">
          <span className="font-black text-xl tracking-tight">F1</span>
          <span style={{ color: 'var(--red)', fontWeight: 900, fontSize: 21 }}>·</span>
          <span className="font-black text-xl tracking-tight" style={{ color: 'var(--red)' }}>INSIGHT</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-200"
              style={{
                color: location.pathname === to ? '#fff' : 'rgba(255,255,255,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <button
                  className="btn-clip btn-clip-sm btn-outline"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </button>
              )}
              <button
                className="btn-clip btn-clip-sm btn-outline"
                onClick={() => navigate('/dashboard')}
              >
                {user.name.split(' ')[0]}
              </button>
              <button className="btn-clip btn-clip-sm btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-clip btn-clip-sm btn-outline" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-clip btn-clip-sm btn-primary" onClick={() => navigate('/register')}>
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ transform: mobileOpen ? 'rotate(45deg) translateY(8px)' : '' }} />
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span className="block w-6 h-0.5 bg-white transition-all" style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-8px)' : '' }} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-col px-8 py-6 gap-5">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: location.pathname === to ? 'var(--red)' : 'rgba(255,255,255,0.65)' }}
                >
                  {label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/10">
                {user ? (
                  <button className="btn-clip btn-clip-sm btn-primary" onClick={handleLogout}>Logout</button>
                ) : (
                  <>
                    <button className="btn-clip btn-clip-sm btn-outline" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn-clip btn-clip-sm btn-primary" onClick={() => navigate('/register')}>Register</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
