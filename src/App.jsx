import { useState } from 'react'
import './App.css'

const initialSubscriptions = [
  {
    id: 1,
    employee: 'Ahmed Saleh',
    email: 'ahmed@example.com',
    department: 'Sales',
    service: 'ChatGPT Plus',
    plan: 'Monthly',
    start: '2026-09-20',
    renewal: '2026-10-20',
    price: 20,
    currency: 'USD',
    payment: 'Bank Transfer',
    status: 'Active',
  },
  {
    id: 2,
    employee: 'Sara Ali',
    email: 'sara@example.com',
    department: 'CS',
    service: 'Claude Pro',
    plan: 'Monthly',
    start: '2026-09-12',
    renewal: '2026-10-12',
    price: 20,
    currency: 'USD',
    payment: 'Bank Transfer',
    status: 'Active',
  },
  {
    id: 3,
    employee: 'Omar Khaled',
    email: 'omar@example.com',
    department: 'Development',
    service: 'Gemini Pro',
    plan: 'Annual',
    start: '2026-01-05',
    renewal: '2027-01-05',
    price: 800,
    currency: 'USD',
    payment: 'Bank Transfer',
    status: 'Active',
  },
  {
    id: 4,
    employee: 'Mariam Noor',
    email: 'mariam@example.com',
    department: 'CS',
    service: 'Canva Pro',
    plan: 'Monthly',
    start: '2026-09-28',
    renewal: '2026-10-28',
    price: 65,
    currency: 'LYD',
    payment: 'Card',
    status: 'Pending',
  },
  {
    id: 5,
    employee: 'Yousef Omar',
    email: 'yousef@example.com',
    department: 'Development',
    service: 'ChatGPT Plus',
    plan: 'Monthly',
    start: '2026-08-01',
    renewal: '2026-09-01',
    price: 20,
    currency: 'USD',
    payment: 'Cash',
    status: 'Expired',
  },
]

const departments = ['Sales', 'CS', 'Development']

const icons = {
  overview: '◫',
  subscriptions: '▤',
  employees: '♙',
  payments: '↔',
  settings: '⚙',
}

const money = (amount, currency = 'LYD') => {
  const numericAmount = Number(amount)
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0
  return `${currency} ${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

// A plan's entered price is the full charge for its selected billing cycle.
// For dashboard cost summaries, convert annual charges to a monthly equivalent.
function monthlyEquivalent(subscription) {
  const price = Number(subscription.price)
  if (!Number.isFinite(price) || price < 0) return 0

  const plan = String(subscription.plan || 'Monthly').trim().toLowerCase()
  return plan === 'annual' || plan === 'yearly' ? price / 12 : price
}

// Keep each currency in its own bucket. Never add LYD and USD together.
function calculateCurrencyTotals(items) {
  return items.reduce((totals, subscription) => {
    const currency = String(subscription.currency || 'LYD').toUpperCase()
    totals[currency] = (totals[currency] || 0) + monthlyEquivalent(subscription)
    return totals
  }, {})
}

function App() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState('Overview')
  const [showForm, setShowForm] = useState(false)

  const filtered = subscriptions.filter((subscription) => {
    const searchableText = [
      subscription.employee,
      subscription.service,
      subscription.email,
      subscription.department || '',
    ].join(' ').toLowerCase()

    const matchesSearch = searchableText.includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || subscription.status === filter

    return matchesSearch && matchesFilter
  })

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'Active',
  )
  const active = activeSubscriptions.length
  const pending = subscriptions.filter(
    (subscription) => subscription.status === 'Pending',
  ).length
  const expired = subscriptions.filter(
    (subscription) => subscription.status === 'Expired',
  ).length

  // Dashboard monthly cost includes Active subscriptions only.
  // Annual plans are divided by 12; currencies are never combined.
  const monthlyCost = calculateCurrencyTotals(activeSubscriptions)

  // Count distinct, non-empty employee email addresses.
  const totalEmployees = new Set(
    subscriptions
      .map((subscription) => String(subscription.email || '').trim().toLowerCase())
      .filter(Boolean),
  ).size

  // Department summaries use exactly the department stored on each subscription.
  // Missing departments are not silently assigned to Sales.
  const departmentTotals = departments.map((department) => {
    const departmentSubscriptions = activeSubscriptions.filter(
      (subscription) => subscription.department === department,
    )

    return {
      department,
      activeCount: departmentSubscriptions.length,
      totals: calculateCurrencyTotals(departmentSubscriptions),
    }
  })

  function addSubscription(event) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const price = Number(form.get('price'))

    if (!Number.isFinite(price) || price < 0) {
      return
    }

    const item = {
      id: Date.now(),
      employee: String(form.get('employee') || '').trim(),
      email: String(form.get('email') || '').trim(),
      department: String(form.get('department') || 'Sales'),
      service: String(form.get('service') || 'ChatGPT Plus'),
      plan: String(form.get('plan') || 'Monthly'),
      start: String(form.get('start') || ''),
      renewal: String(form.get('renewal') || ''),
      price,
      currency: String(form.get('currency') || 'LYD'),
      payment: String(form.get('payment') || 'Other'),
      status: 'Active',
    }

    setSubscriptions((current) => [item, ...current])
    setShowForm(false)
    setPage('Subscriptions')
    setFilter('All')
    setSearch('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✳</div>
          <div>
            <strong>subly<span>.</span></strong>
            <small>SUBSCRIPTION MANAGER</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        {['Overview', 'Subscriptions', 'Employees', 'Payments'].map((item) => (
          <button
            key={item}
            className={`nav-item ${page === item ? 'selected' : ''}`}
            onClick={() => {
              setPage(item)
              setFilter('All')
              setSearch('')
            }}
          >
            <span className="nav-icon">{icons[item.toLowerCase()]}</span>
            {item}
            {item === 'Subscriptions' && (
              <span className="nav-count">{subscriptions.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="help-card">
            <span>✦</span>
            <strong>Need a hand?</strong>
            <p>Your subscription workspace, all in one place.</p>
          </div>
          <button
            className={`nav-item ${page === 'Settings' ? 'selected' : ''}`}
            onClick={() => setPage('Settings')}
          >
            <span className="nav-icon">{icons.settings}</span>
            Settings
          </button>
          <div className="profile">
            <div className="avatar">AD</div>
            <div>
              <strong>Admin Demo</strong>
              <small>Workspace owner</small>
            </div>
            <span className="dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className="today">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <button className="icon-button" title="Notifications" type="button">
              ♧<i />
            </button>
            <div className="avatar small-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">YOUR WORKSPACE</div>
              <h1>{page === 'Overview' ? 'Good morning, Admin' : page}</h1>
              <p>
                {page === 'Overview'
                  ? 'Here’s what’s happening with your subscriptions today.'
                  : `Manage your ${page.toLowerCase()} in one place.`}
              </p>
            </div>
            <button className="primary-button" onClick={() => setShowForm(true)}>
              <span>＋</span> Add subscription
            </button>
          </div>

          {page === 'Overview' && (
            <>
              <div className="stats-grid">
                <StatCard
                  label="Active subscriptions"
                  value={active}
                  note="Currently running"
                  icon="▤"
                  color="purple"
                />
                <StatCard
                  label="Monthly subscription cost"
                  value={<CurrencyAmounts totals={monthlyCost} />}
                  note="Active plans; annual prices divided by 12"
                  icon="↗"
                  color="green"
                />
                <StatCard
                  label="Pending payments"
                  value={pending}
                  note="Awaiting confirmation"
                  icon="◷"
                  color="orange"
                />
                <StatCard
                  label="Total employees"
                  value={totalEmployees}
                  note="Unique email addresses"
                  icon="♙"
                  color="blue"
                />
              </div>

              <div className="content-card">
                <div className="card-heading">
                  <div>
                    <h2>Department costs</h2>
                    <p>Monthly equivalent cost for active subscriptions in each department.</p>
                  </div>
                </div>
                <div className="department-grid">
                  {departmentTotals.map(({ department, activeCount, totals }) => (
                    <div className="stat-card" key={department}>
                      <div className="stat-label">{department}</div>
                      <div className="stat-value">
                        <CurrencyAmounts totals={totals} emptyLabel="LYD 0" />
                      </div>
                      <div className="stat-note">
                        {activeCount} active {activeCount === 1 ? 'subscription' : 'subscriptions'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="content-card">
                <div className="card-heading">
                  <div>
                    <h2>Recent subscriptions</h2>
                    <p>A quick look at your latest employee plans.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage('Subscriptions')}>
                    View all subscriptions <span>→</span>
                  </button>
                </div>
                <SubscriptionTable items={subscriptions.slice(0, 4)} money={money} />
              </div>

              <div className="bottom-grid">
                <div className="content-card renewal-card">
                  <div className="section-heading">
                    <div className="mini-icon orange">◷</div>
                    <div>
                      <h2>Keep an eye on renewals</h2>
                      <p>Upcoming renewals for active subscriptions.</p>
                    </div>
                  </div>
                  {activeSubscriptions
                    .slice()
                    .sort((a, b) => a.renewal.localeCompare(b.renewal))
                    .slice(0, 3)
                    .map((subscription) => (
                      <div className="renewal-row" key={subscription.id}>
                        <div className="service-dot">{subscription.service.charAt(0)}</div>
                        <div className="renewal-info">
                          <strong>{subscription.service}</strong>
                          <small>{subscription.employee}</small>
                        </div>
                        <div className="renewal-date">{subscription.renewal}</div>
                      </div>
                    ))}
                  {activeSubscriptions.length === 0 && (
                    <p className="settings-note">No active subscriptions to show.</p>
                  )}
                </div>

                <div className="content-card mix-card">
                  <div>
                    <h2>Subscription health</h2>
                    <p>Your current subscription breakdown.</p>
                  </div>
                  {[
                    ['Active', active, '#7561e8'],
                    ['Pending', pending, '#f0a64b'],
                    ['Expired', expired, '#d8d8e2'],
                  ].map(([label, count, color]) => (
                    <div className="health-row" key={label}>
                      <div className="health-label">
                        <span><i style={{ background: color }} />{label}</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          style={{
                            width: `${subscriptions.length ? (count / subscriptions.length) * 100 : 0}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === 'Subscriptions' && (
            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>All subscriptions</h2>
                  <p>Manage plans, payment methods, departments, and renewal dates.</p>
                </div>
                <span className="total-pill">{filtered.length} records</span>
              </div>
              <Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
              <SubscriptionTable items={filtered} money={money} />
            </div>
          )}

          {page === 'Employees' && (
            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Employees / employees</h2>
                  <p>People associated with your subscriptions.</p>
                </div>
              </div>
              <div className="employee-grid">
                {[...new Map(
                  subscriptions.map((subscription) => [
                    subscription.email.trim().toLowerCase(),
                    subscription,
                  ]),
                ).values()].map((subscription) => (
                  <div className="employee-card" key={subscription.email.toLowerCase()}>
                    <div className="avatar">
                      {subscription.employee.split(' ').map((part) => part[0]).join('')}
                    </div>
                    <strong>{subscription.employee}</strong>
                    <span>{subscription.email}</span>
                    <small>{subscription.department || 'No department'}</small>
                    <small>
                      {subscriptions.filter(
                        (item) => item.email.toLowerCase() === subscription.email.toLowerCase(),
                      ).length}{' '}
                      subscription(s)
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'Payments' && (
            <div className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Payment records</h2>
                  <p>Review payment methods, amounts, and subscription status.</p>
                </div>
              </div>
              <SubscriptionTable items={subscriptions} money={money} showPayment />
            </div>
          )}

          {page === 'Settings' && (
            <div className="content-card settings-card">
              <h2>Workspace settings</h2>
              <p>Demo workspace preferences.</p>
              <label>
                Workspace name
                <input defaultValue="Subly Workspace" />
              </label>
              <label>
                Display currency
                <select defaultValue="LYD">
                  <option>LYD</option>
                  <option>USD</option>
                </select>
              </label>
              <p className="settings-note">
                Costs are shown in their original currencies. LYD and USD are kept separate;
                no exchange rate is assumed. Annual plan prices are divided by 12 in monthly
                cost summaries, while the subscriptions table shows the full plan price.
              </p>
            </div>
          )}
        </div>

        <footer>
          © {new Date().getFullYear()} Subly Workspace
          <span>Made for simpler subscription management.</span>
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false)
          }}
        >
          <form className="modal" onSubmit={addSubscription}>
            <div className="modal-heading">
              <div>
                <h2>Add subscription</h2>
                <p>Enter the details for a new employee plan.</p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <label>
              Employee name
              <input name="employee" placeholder="e.g. Ahmed Saleh" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" placeholder="employee@example.com" required />
            </label>

            <div className="form-row">
              <label>
                Department
                <select name="department" defaultValue="Sales" required>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>
              </label>
              <label>
                AI service
                <select name="service" defaultValue="ChatGPT Plus">
                  <option>ChatGPT Plus</option>
                  <option>Claude Pro</option>
                  <option>Gemini Pro</option>
                  <option>Canva Pro</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Billing cycle
                <select name="plan" defaultValue="Monthly">
                  <option>Monthly</option>
                  <option>Annual</option>
                </select>
              </label>
              <label>
                Currency
                <select name="currency" defaultValue="LYD">
                  <option value="LYD">LYD</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Start date
                <input name="start" type="date" required />
              </label>
              <label>
                Renewal date
                <input name="renewal" type="date" required />
              </label>
            </div>

            <div className="form-row">
              <label>
                Plan price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 95"
                />
              </label>
              <label>
                Payment method
                <select name="payment" defaultValue="Bank Transfer">
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="primary-button" type="submit">Save subscription</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function CurrencyAmounts({ totals, emptyLabel = '—' }) {
  const currencies = Object.keys(totals || {})
    .filter((currency) => Number.isFinite(Number(totals[currency])) && Number(totals[currency]) !== 0)
    .sort((a, b) => {
      const preferred = ['LYD', 'USD']
      const aIndex = preferred.indexOf(a)
      const bIndex = preferred.indexOf(b)
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
      }
      return a.localeCompare(b)
    })

  if (currencies.length === 0) {
    return <span>{emptyLabel}</span>
  }

  return (
    <span className="currency-amounts">
      {currencies.map((currency) => (
        <span key={currency}>{money(totals[currency], currency)}</span>
      ))}
    </span>
  )
}

function StatCard({ label, value, note, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}

function Toolbar({ search, setSearch, filter, setFilter }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employees, departments, or services..."
        />
      </div>
      <select
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        aria-label="Filter by status"
      >
        <option>All</option>
        <option>Active</option>
        <option>Pending</option>
        <option>Expired</option>
      </select>
    </div>
  )
}

function SubscriptionTable({ items, money, showPayment = false }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <span>⌕</span>
        <strong>No subscriptions found</strong>
        <p>Try another search or change your filters.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>SUBSCRIPTION</th>
            <th>EMPLOYEE</th>
            <th>DEPARTMENT</th>
            <th>RENEWAL DATE</th>
            {showPayment && <th>PAYMENT METHOD</th>}
            <th>PLAN PRICE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((subscription) => (
            <tr key={subscription.id}>
              <td>
                <div className="service-cell">
                  <div className={`service-logo ${subscription.service.split(' ')[0].toLowerCase()}`}>
                    {subscription.service.charAt(0)}
                  </div>
                  <div>
                    <strong>{subscription.service}</strong>
                    <small>{subscription.plan} plan</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="employee-cell">
                  <strong>{subscription.employee}</strong>
                  <small>{subscription.email}</small>
                </div>
              </td>
              <td>{subscription.department || 'Sales'}</td>
              <td><span className="date-text">{subscription.renewal}</span></td>
              {showPayment && <td>{subscription.payment}</td>}
              <td className="amount">
                {money(subscription.price, subscription.currency || 'LYD')}
              </td>
              <td>
                <span className={`status-badge ${subscription.status.toLowerCase()}`}>
                  <i />{subscription.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App