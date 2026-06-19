import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { apiUrl } from '../lib/api'

type TrendPoint = { date: string; orders: number; revenue: number }
type TopProduct = { name: string; orders: number; revenue: number }
type RecentOrder = {
  id: string
  customer: string
  product: string
  qty: number
  amount: number
  date: string
}

type LowStockProduct = { id: string; name: string; sku: string; price: number; quantity: number }

type Stats = {
  total_products: number
  total_customers: number
  total_orders: number
  low_stock_products: number
  total_revenue: number
  revenue_trend: TrendPoint[]
  top_products: TopProduct[]
  recent_orders: RecentOrder[]
  low_stock_list: LowStockProduct[]
}

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`
}

function PackageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function ShoppingBagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

const AREA_COLORS = { revenue: 'var(--chart-area-primary)', orders: 'var(--chart-area-secondary)' }
const BAR_COLOR = 'var(--chart-bar)'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'low-stock'>('recent')

  useEffect(() => {
    fetch(apiUrl('/api/dashboard'))
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="dash-skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="skel-card" />)}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="page"><p className="empty-state">Failed to load dashboard</p></div>
  }

  const summaryCards = [
    { label: 'Total Revenue', value: fmt(stats.total_revenue), icon: <DollarIcon />, color: 'indigo', tooltip: 'Sum of all completed order payments' },
    { label: 'Total Orders', value: stats.total_orders, icon: <ShoppingBagIcon />, color: 'violet', tooltip: 'Number of orders placed across all customers' },
    { label: 'Total Customers', value: stats.total_customers, icon: <UsersIcon />, color: 'emerald', tooltip: 'Total number of registered customers' },
    { label: 'Total Products', value: stats.total_products, icon: <PackageIcon />, color: 'sky', tooltip: 'Total number of products in your catalog' },
    { label: 'Low Stock', value: stats.low_stock_products, icon: <AlertIcon />, color: 'orange', tooltip: 'Products with 5 or fewer units remaining' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="dash-subtitle">Overview of your business</span>
      </div>

      {/* Summary cards */}
      <div className="dash-stat-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className={`dash-stat-card dash-stat-card--${card.color}`}>
            <div className="dash-stat-icon">{card.icon}</div>
            <div className="dash-stat-body">
              <div className="dash-stat-label-row">
                <span className="dash-stat-label">{card.label}</span>
                <span className="stat-info-wrap" data-tooltip={card.tooltip}>
                  <InfoIcon />
                </span>
              </div>
              <strong className="dash-stat-value">{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="dash-charts-row">
        {/* Revenue & Orders trend */}
        <div className="dash-chart-card dash-chart-card--wide">
          <div className="dash-chart-header">
            <h3 className="dash-chart-title">Revenue &amp; Orders — last 7 days</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.revenue_trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AREA_COLORS.revenue} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={AREA_COLORS.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AREA_COLORS.orders} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={AREA_COLORS.orders} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-grid)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--dash-tick)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: 'var(--dash-tick)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={48} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: 'var(--dash-tick)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: 'var(--dash-tooltip-bg)', border: '1px solid var(--dash-tooltip-border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--dash-tooltip-label)', fontWeight: 600, marginBottom: 4 }}
                formatter={(value, name) =>
                  name === 'revenue' ? [`$${Number(value).toFixed(2)}`, 'Revenue'] : [value, 'Orders']
                }
              />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke={AREA_COLORS.revenue} strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
              <Area yAxisId="ord" type="monotone" dataKey="orders" stroke={AREA_COLORS.orders} strokeWidth={2} fill="url(#gradOrders)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="dash-chart-legend">
            <span className="legend-dot" style={{ background: AREA_COLORS.revenue }} />Revenue
            <span className="legend-dot" style={{ background: AREA_COLORS.orders }} />Orders
          </div>
        </div>

        {/* Top products */}
        <div className="dash-chart-card">
          <div className="dash-chart-header">
            <h3 className="dash-chart-title">Top products by revenue</h3>
          </div>
          {stats.top_products.length === 0 ? (
            <p className="dash-empty">No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.top_products} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-grid)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--dash-tick)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--dash-tick)' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ background: 'var(--dash-tooltip-bg)', border: '1px solid var(--dash-tooltip-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabbed bottom section */}
      <div className="dash-table-card">
        <div className="dash-tabs">
          <button
            className={`dash-tab${activeTab === 'recent' ? ' dash-tab--active' : ''}`}
            onClick={() => setActiveTab('recent')}
            type="button"
          >
            Recent Orders
          </button>
          <button
            className={`dash-tab${activeTab === 'low-stock' ? ' dash-tab--active' : ''}`}
            onClick={() => setActiveTab('low-stock')}
            type="button"
          >
            Low Stock
            {stats.low_stock_products > 0 && (
              <span className="dash-tab-badge">{stats.low_stock_products}</span>
            )}
          </button>
        </div>

        {activeTab === 'recent' && (
          stats.recent_orders.length === 0 ? (
            <p className="dash-empty">No orders yet</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td data-label="Order ID"><span className="dash-order-id">#{o.id}</span></td>
                      <td data-label="Customer">{o.customer}</td>
                      <td data-label="Product">{o.product}</td>
                      <td data-label="Qty">{o.qty}</td>
                      <td data-label="Amount"><strong>${o.amount.toFixed(2)}</strong></td>
                      <td data-label="Date" className="dash-date">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'low-stock' && (
          stats.low_stock_list.length === 0 ? (
            <p className="dash-empty">All products are well stocked</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_list.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Product">{p.name}</td>
                      <td data-label="SKU"><span className="dash-order-id">{p.sku}</span></td>
                      <td data-label="Price"><strong>${p.price.toFixed(2)}</strong></td>
                      <td data-label="Stock">{p.quantity}</td>
                      <td data-label="Status">
                        <span className={`dash-stock-badge${p.quantity === 0 ? ' dash-stock-badge--out' : ' dash-stock-badge--low'}`}>
                          {p.quantity === 0 ? 'Out of stock' : 'Low stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}
