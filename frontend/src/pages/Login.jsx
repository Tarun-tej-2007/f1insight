import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormInput } from '../components/common/index'

function AuthLayout({ tag, title, sub, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at center, rgba(238,63,44,0.07) 0%, transparent 70%)' }}>
      <div className="w-full max-w-md glass-card p-12">
        <div className="mb-10">
          <div className="section-tag">{tag}</div>
          <h1 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>{title}</h1>
          {sub && <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
        </div>
        {children}
        {footer && <div className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{footer}</div>}
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(email, password)
      toast('Welcome back!', 'success')
      navigate(u.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      toast(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      tag="Welcome Back"
      title="Sign In"
      sub="Access your F1 Insight dashboard"
      footer={<>Don't have an account? <Link to="/register" style={{ color: 'var(--red)', fontWeight: 700 }}>Register</Link></>}
    >
      <form onSubmit={submit}>
        <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <FormInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
        <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Demo user: user@demo.com / password123
        </p>
        <button className="btn-clip btn-primary w-full justify-center" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password)
      toast('Account created!', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      tag="Join F1 Insight"
      title="Create Account"
      sub="Start tracking your favourite drivers and teams"
      footer={<>Already have an account? <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700 }}>Sign In</Link></>}
    >
      <form onSubmit={submit}>
        <FormInput label="Full Name" value={name} onChange={setName} placeholder="Max Verstappen" required />
        <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <FormInput label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" required />
        <button className="btn-clip btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
