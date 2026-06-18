import { useState, useLayoutEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Step = 'login' | 'otp-phone' | 'otp-code'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState<Step>('login')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [phoneHint, setPhoneHint] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('oms_theme') === 'dark')

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('oms_theme', dark ? 'dark' : 'light')
  }, [dark])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail ?? 'Login failed')
      setUser(data.user)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError('')
    setLoading(true)
    try {
      if (form.email) {
        const res = await fetch('/api/auth/get-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setOtpPhone(data.phone_number ?? '')
        } else {
          setOtpPhone('')
        }
      } else {
        setOtpPhone('')
      }
      setStep('otp-phone')
    } finally {
      setLoading(false)
    }
  }

  async function sendOtp(phone: string) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail ?? 'Failed to send OTP')
      setOtpPhone(phone)
      setPhoneHint(data.phone_hint ?? phone)
      setStep('otp-code')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault()
    await sendOtp(otpPhone)
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: otpPhone, otp: otpCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail ?? 'OTP verification failed')
      setUser(data.user)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function backToLogin() {
    setStep('login')
    setOtpPhone('')
    setOtpCode('')
    setPhoneHint('')
    setError('')
  }

  const themeBtn = (
    <button
      type="button"
      className="theme-toggle-btn"
      aria-label="Toggle theme"
      onClick={() => setDark((d) => !d)}
      style={{ position: 'fixed', top: 16, right: 16 }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  )

  if (step === 'otp-phone') {
    return (
      <div className="auth-shell">
        {themeBtn}
        <div className="auth-card">
          <p className="eyebrow">Order Management System</p>
          <h1 className="auth-heading">Forgot password</h1>
          <p className="auth-switch" style={{ marginBottom: 20 }}>
            Confirm your registered phone number and we'll send an OTP to it.
          </p>

          <form className="auth-form" onSubmit={handleRequestOtp} noValidate>
            <div className="field">
              <label htmlFor="otp-phone">Phone number</label>
              <input
                id="otp-phone"
                name="otp-phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+1234567890"
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="button button-primary auth-submit" type="submit" disabled={loading || !otpPhone}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>

          <p className="auth-switch">
            <button type="button" className="link-button" onClick={backToLogin}>
              Back to login
            </button>
          </p>
        </div>
      </div>
    )
  }

  if (step === 'otp-code') {
    return (
      <div className="auth-shell">
        {themeBtn}
        <div className="auth-card">
          <p className="eyebrow">Order Management System</p>
          <h1 className="auth-heading">Enter OTP</h1>
          <p className="auth-switch" style={{ marginBottom: 20 }}>
            A 6-digit OTP was sent to <strong>{phoneHint}</strong>. It expires in 10 minutes.
          </p>

          <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
            <div className="field">
              <label htmlFor="otp-code">OTP code</label>
              <input
                id="otp-code"
                name="otp-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="button button-primary auth-submit" type="submit" disabled={loading || otpCode.length !== 6}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>

          <p className="auth-switch">
            <button type="button" className="link-button" onClick={() => { sendOtp(otpPhone); setOtpCode('') }}>
              Resend OTP
            </button>
            {' · '}
            <button type="button" className="link-button" onClick={backToLogin}>
              Back to login
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      {themeBtn}
      <div className="auth-card">
        <p className="eyebrow">Order Management System</p>
        <h1 className="auth-heading">Welcome back</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password</span>
              <button
                type="button"
                className="link-button"
                style={{ fontSize: 13 }}
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            </label>
            <div className="pw-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="pw-toggle"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
