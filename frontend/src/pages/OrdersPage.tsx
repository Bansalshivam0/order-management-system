import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import CustomSelect from '../components/CustomSelect'
import { apiUrl } from '../lib/api'

type Customer = { id: string; name: string }
type Product = { id: string; product_name: string; price: number }

type Order = {
  id: string
  customer_id: string
  product_id: string
  quantity_ordered: number
  total_amount_paid: number
  customer_name?: string
  product_name?: string
}

type OrderForm = {
  customer_id: string
  product_id: string
  quantity_ordered: number
}

const emptyForm: OrderForm = { customer_id: '', product_id: '', quantity_ordered: 1 }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [createModal, setCreateModal] = useState(false)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [form, setForm] = useState<OrderForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancelId, setCancelId] = useState<string | null>(null)

  async function load() {
    const [oRes, cRes, pRes] = await Promise.all([
      fetch(apiUrl('/api/orders')).catch(() => null),
      fetch(apiUrl('/api/customers')).catch(() => null),
      fetch(apiUrl('/api/products')).catch(() => null),
    ])
    if (oRes?.ok) setOrders(await oRes.json())
    if (cRes?.ok) setCustomers(await cRes.json())
    if (pRes?.ok) setProducts(await pRes.json())
  }

  useEffect(() => { load() }, [])

  const selectedProduct = products.find((p) => p.id === form.product_id)
  const estimatedTotal = selectedProduct
    ? (selectedProduct.price * form.quantity_ordered).toFixed(2)
    : '—'

  function openCreate() {
    setForm(emptyForm)
    setError('')
    setCreateModal(true)
  }

  function closeCreate() {
    setCreateModal(false)
    setError('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity_ordered' ? Number(value) : value,
    }))
  }

  async function confirmCancel() {
    if (!cancelId) return
    await fetch(apiUrl(`/api/orders/${cancelId}`), { method: 'DELETE' })
    setCancelId(null)
    await load()
    toast.success('Order cancelled — stock restored')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail ?? 'Request failed')
      await load()
      toast.success('Order created')
      closeCreate()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? id.slice(0, 8) + '…'
  }

  function productName(id: string) {
    return products.find((p) => p.id === id)?.product_name ?? id.slice(0, 8) + '…'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Orders</h2>
        <button className="button button-primary page-action" onClick={openCreate}>
          + Create order
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="empty-state">No orders yet. Create your first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td data-label="Customer">{o.customer_name ?? customerName(o.customer_id)}</td>
                  <td data-label="Product">{o.product_name ?? productName(o.product_id)}</td>
                  <td data-label="Qty">{o.quantity_ordered}</td>
                  <td data-label="Total">${Number(o.total_amount_paid).toFixed(2)}</td>
                  <td className="row-actions">
                    <button className="btn-ghost" onClick={() => setDetailOrder(o)}>
                      View details
                    </button>
                    <button className="btn-ghost btn-danger" onClick={() => setCancelId(o.id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create order modal */}
      {createModal && (
        <div className="modal-backdrop" onClick={closeCreate}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Create order</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="customer_id">Customer</label>
                <CustomSelect
                  id="customer_id"
                  value={form.customer_id}
                  placeholder="Select a customer..."
                  required
                  options={customers.map((c) => ({ value: c.id, label: c.name }))}
                  onChange={(value) => setForm((prev) => ({ ...prev, customer_id: value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="product_id">Product</label>
                <CustomSelect
                  id="product_id"
                  value={form.product_id}
                  placeholder="Select a product..."
                  required
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.product_name} — $${Number(p.price).toFixed(2)}`,
                  }))}
                  onChange={(value) => setForm((prev) => ({ ...prev, product_id: value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="quantity_ordered">Quantity</label>
                <input
                  id="quantity_ordered"
                  name="quantity_ordered"
                  type="number"
                  min="1"
                  required
                  value={form.quantity_ordered}
                  onChange={handleChange}
                />
              </div>
              <div className="total-preview">
                <span className="stat-label">Estimated total</span>
                <strong>${estimatedTotal}</strong>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="button button-secondary page-action" onClick={closeCreate}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary page-action" disabled={loading}>
                  {loading ? 'Creating…' : 'Create order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelId && (
        <div className="modal-backdrop" onClick={() => setCancelId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Cancel order</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to cancel this order? The stock will be restored.
            </p>
            <div className="modal-actions">
              <button className="button button-secondary page-action" onClick={() => setCancelId(null)}>
                Keep order
              </button>
              <button className="button page-action" style={{ background: 'var(--red-500, #ef4444)', color: '#fff' }} onClick={confirmCancel}>
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {detailOrder && (
        <div className="modal-backdrop" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Order details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Order ID</span>
                <span className="detail-value mono">{detailOrder.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer</span>
                <span className="detail-value">
                  {detailOrder.customer_name ?? customerName(detailOrder.customer_id)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Product</span>
                <span className="detail-value">
                  {detailOrder.product_name ?? productName(detailOrder.product_id)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quantity ordered</span>
                <span className="detail-value">{detailOrder.quantity_ordered}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total amount paid</span>
                <span className="detail-value">
                  ${Number(detailOrder.total_amount_paid).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button
                className="button button-secondary page-action"
                onClick={() => setDetailOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
