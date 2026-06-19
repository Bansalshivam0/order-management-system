import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { apiUrl } from '../lib/api'

type Product = {
  id: string
  product_name: string
  sku_code: string
  price: number
  quantity: number
}

type ProductFormState = {
  product_name: string
  sku_code: string
  price: string
  quantity: string
}

function generateSKU() {
  return crypto.randomUUID()
}

function newForm(): ProductFormState {
  return { product_name: '', sku_code: generateSKU(), price: '', quantity: '' }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormState>(newForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  async function load() {
    const res = await fetch(apiUrl('/api/products')).catch(() => null)
    if (res?.ok) setProducts(await res.json())
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm(newForm())
    setEditTarget(null)
    setError('')
    setModal('add')
  }

  function openEdit(p: Product) {
    setForm({ product_name: p.product_name, sku_code: p.sku_code, price: String(p.price), quantity: String(p.quantity) })
    setEditTarget(p)
    setError('')
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setError('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = modal === 'edit' ? apiUrl(`/api/products/${editTarget!.id}`) : apiUrl('/api/products')
      const payload = {
        product_name: form.product_name,
        sku_code: form.sku_code,
        price: parseFloat(form.price) || 0,
        quantity: parseInt(form.quantity, 10) || 0,
      }
      const res = await fetch(url, {
        method: modal === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? 'Request failed')
      await load()
      toast.success(modal === 'edit' ? 'Product updated' : 'Product added')
      closeModal()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    const res = await fetch(apiUrl(`/api/products/${deleteId}`), { method: 'DELETE' })
    setDeleteId(null)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body.detail ?? 'Failed to delete product')
      return
    }
    await load()
    toast.success('Product deleted')
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Products</h2>
        <button className="button button-primary page-action" onClick={openAdd}>
          + Add product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="empty-state">No products yet. Add your first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td data-label="Name">{p.product_name}</td>
                  <td data-label="SKU"><code className="sku">{p.sku_code}</code></td>
                  <td data-label="Price">${Number(p.price).toFixed(2)}</td>
                  <td data-label="Stock">
                    <span className={`badge ${p.quantity <= 5 ? 'badge-warn' : 'badge-ok'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-ghost btn-danger" onClick={() => setDeleteId(p.id)}>Delete</button>
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
            <h3 className="modal-title">Delete product</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to delete this product? This action cannot be undone.
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
            <h3 className="modal-title">{modal === 'add' ? 'Add product' : 'Edit product'}</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="product_name">Product name</label>
                <input
                  id="product_name"
                  name="product_name"
                  required
                  placeholder="Enter your product name"
                  value={form.product_name}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="sku_code" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>SKU code</span>
                </label>
                <input
                  id="sku_code"
                  name="sku_code"
                  required
                  value={form.sku_code}
                  onChange={handleChange}
                  readOnly={modal === 'add'}
                  className={modal === 'add' ? 'sku-readonly' : ''}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    required
                    value={form.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="button button-secondary page-action" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary page-action" disabled={loading}>
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
