import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

type Customer = {
  id: string
  name: string
  email: string
  phone_number: string
}

type CustomerForm = Omit<Customer, 'id'>

const emptyForm: CustomerForm = { name: '', email: '', phone_number: '' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  async function load() {
    const res = await fetch('/api/customers').catch(() => null)
    if (res?.ok) setCustomers(await res.json())
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm(emptyForm)
    setError('')
    setModal(true)
  }

  function closeModal() {
    setModal(false)
    setError('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? 'Request failed')
      await load()
      toast.success('Customer added')
      closeModal()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    const res = await fetch(`/api/customers/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body.detail ?? 'Failed to delete customer')
      return
    }
    await load()
    toast.success('Customer deleted')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <button className="button button-primary page-action" onClick={openAdd}>
          + Add customer
        </button>
      </div>

      {customers.length === 0 ? (
        <p className="empty-state">No customers yet. Add your first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Email">{c.email}</td>
                  <td data-label="Phone">{c.phone_number}</td>
                  <td className="row-actions">
                    <button className="btn-ghost btn-danger" onClick={() => setDeleteId(c.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete customer</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="button button-secondary page-action" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="button page-action" style={{ background: 'var(--red-500, #ef4444)', color: '#fff' }} onClick={confirmDelete}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add customer</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="phone_number">Phone number</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  placeholder="+1 555 000 0000"
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="button button-secondary page-action" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary page-action" disabled={loading}>
                  {loading ? 'Saving…' : 'Add customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
