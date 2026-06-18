import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import PhoneField from '../components/PhoneField'

function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
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

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? '',
  })
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPw, setShowPw] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess('')

    if (passwords.new_password && passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match')
      return
    }
    if (!passwords.current_password) {
      setError('Current password is required to save changes')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, string> = {
        email: user.email,
        current_password: passwords.current_password,
        name: form.name,
        phone_number: form.phone_number,
      }
      if (form.email !== user.email) {
        body.new_email = form.email
      }
      if (passwords.new_password) {
        body.new_password = passwords.new_password
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail ?? 'Failed to update profile')

      setUser(data.user)
      setForm({ name: data.user.name, email: data.user.email, phone_number: data.user.phone_number })
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      setSuccess('Profile updated successfully')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-layout">
        {/* Left card — live preview */}
        <div className="profile-card">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-identity">
            <strong className="profile-display-name">{form.name || user?.name}</strong>
            <span className="profile-display-email">{form.email || user?.email}</span>
          </div>
          <dl className="profile-meta">
            <div className="profile-meta-row">
              <dt>Phone</dt>
              <dd>{form.phone_number || user?.phone_number || '—'}</dd>
            </div>
            <div className="profile-meta-row">
              <dt>Account ID</dt>
              <dd className="mono">{user?.id?.slice(0, 8)}…</dd>
            </div>
          </dl>
          <button type="button" className="profile-logout-btn" onClick={logout}>
            <LogOutIcon />
            Log out
          </button>
        </div>

        {/* Right form */}
        <form className="profile-form" onSubmit={handleSave} noValidate>
          <h2 className="profile-section-title">Personal information</h2>

          <div className="profile-fields">
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field" style={{ maxWidth: '320px' }}>
              <label htmlFor="phone_number">Phone number</label>
              <PhoneField
                id="phone_number"
                name="phone_number"
                value={form.phone_number}
                onChange={(val) => setForm((prev) => ({ ...prev, phone_number: val }))}
              />
            </div>
          </div>

          <h2 className="profile-section-title" style={{ marginTop: '28px' }}>
            Change password
          </h2>

          <div className="profile-fields">
            <div className="field">
              <label htmlFor="current_password">
                Current password{' '}
                <span className="required-note">(required to save any changes)</span>
              </label>
              <div className="pw-input-wrap">
                <input
                  id="current_password"
                  name="current_password"
                  type={showPw.current_password ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw((s) => ({ ...s, current_password: !s.current_password }))}
                  tabIndex={-1}
                >
                  {showPw.current_password ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="new_password">New password</label>
                <div className="pw-input-wrap">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPw.new_password ? 'text' : 'password'}
                    placeholder="Add new password"
                    value={passwords.new_password}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((s) => ({ ...s, new_password: !s.new_password }))}
                    tabIndex={-1}
                  >
                    {showPw.new_password ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="confirm_password">Confirm new password</label>
                <div className="pw-input-wrap">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showPw.confirm_password ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={passwords.confirm_password}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((s) => ({ ...s, confirm_password: !s.confirm_password }))}
                    tabIndex={-1}
                  >
                    {showPw.confirm_password ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="auth-error" style={{ marginTop: '16px' }}>{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          <div className="profile-form-footer">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
