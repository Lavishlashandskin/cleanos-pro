import { useState } from 'react'
import { DollarSign, CheckCircle2, Clock, AlertCircle, CreditCard, Banknote, Smartphone, FileText, RefreshCw, X } from 'lucide-react'
import { clients, sampleInvoices, clientPaymentSettings } from '../data/sampleData.js'

const METHOD_CONFIG = {
  venmo:   { label: 'Venmo',   Icon: Smartphone, color: '#2D96C2' },
  zelle:   { label: 'Zelle',   Icon: Smartphone, color: '#6D3FBF' },
  cash:    { label: 'Cash',    Icon: Banknote,   color: '#5CB85C' },
  card:    { label: 'Card',    Icon: CreditCard, color: '#58A6FF' },
  invoice: { label: 'Invoice', Icon: FileText,   color: '#E8A838' },
  check:   { label: 'Check',   Icon: FileText,   color: '#A0A0A0' },
}

const ALL_METHODS = Object.keys(METHOD_CONFIG)

function getClientName(clientId) {
  return clients.find(c => c.id === clientId)?.name ?? 'Unknown'
}

function MethodPill({ method }) {
  const cfg = METHOD_CONFIG[method] || METHOD_CONFIG.cash
  const { Icon } = cfg
  return (
    <span className="payment-method-pill" style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

// ── Invoices tab ──────────────────────────────────────────────────────────────
function InvoicesTab() {
  const [invoices, setInvoices] = useState(sampleInvoices)
  const [filter, setFilter] = useState('all')
  const [markingId, setMarkingId] = useState(null)

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  const totalOwed   = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const paidMonth   = invoices.filter(i => i.status === 'paid' && i.paidDate?.startsWith('2026-06')).reduce((s, i) => s + i.amount, 0)
  const overdueAmt  = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  const markPaid = async (id) => {
    setMarkingId(id)
    await new Promise(r => setTimeout(r, 600))
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'paid', paidDate: '2026-06-11' } : inv
    ))
    setMarkingId(null)
  }

  const statusConfig = {
    paid:    { label: 'Paid',    color: 'var(--success)', bg: 'var(--success-bg)', Icon: CheckCircle2 },
    pending: { label: 'Pending', color: 'var(--warning)', bg: 'var(--warning-bg)', Icon: Clock },
    overdue: { label: 'Overdue', color: 'var(--danger)',  bg: 'var(--danger-bg)',  Icon: AlertCircle },
  }

  return (
    <div>
      {/* Stats */}
      <div className="money-summary" style={{ marginBottom: 24 }}>
        <div className="money-stat">
          <div className="money-stat-val">${totalOwed.toLocaleString()}</div>
          <div className="money-stat-lbl">Total Outstanding</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val" style={{ color: 'var(--success)' }}>${paidMonth.toLocaleString()}</div>
          <div className="money-stat-lbl">Paid — June 2026</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val" style={{ color: 'var(--danger)' }}>${overdueAmt.toLocaleString()}</div>
          <div className="money-stat-lbl">Overdue</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">{invoices.filter(i => i.status === 'pending').length}</div>
          <div className="money-stat-lbl">Awaiting Payment</div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {['all', 'pending', 'overdue', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
          >
            {f === 'all' ? `All (${invoices.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${invoices.filter(i => i.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {filtered.map(inv => {
        const sc = statusConfig[inv.status]
        const { Icon: StatusIcon } = sc
        return (
          <div
            key={inv.id}
            className="invoice-row"
            style={{ borderLeft: `3px solid ${sc.color}` }}
          >
            {/* Client + service */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                {getClientName(inv.clientId)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span>{inv.service}</span>
                <span>·</span>
                <span>Sent {inv.date}</span>
                {inv.notes && <><span>·</span><span style={{ color: 'var(--warning)' }}>{inv.notes}</span></>}
              </div>
            </div>

            {/* Method */}
            <MethodPill method={inv.method} />

            {/* Amount */}
            <div style={{ fontWeight: 700, fontSize: 15, color: inv.status === 'paid' ? 'var(--success)' : 'var(--text-primary)', minWidth: 58, textAlign: 'right' }}>
              ${inv.amount}
            </div>

            {/* Status + action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 110 }}>
              <span className="badge" style={{ background: sc.bg, color: sc.color, gap: 5 }}>
                <StatusIcon size={11} />
                {sc.label}
              </span>
              {inv.status !== 'paid' && (
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: 11, padding: '3px 10px' }}
                  onClick={() => markPaid(inv.id)}
                  disabled={markingId === inv.id}
                >
                  {markingId === inv.id
                    ? <span className="spinner" style={{ width: 10, height: 10 }} />
                    : <><CheckCircle2 size={11} /> Mark Paid</>}
                </button>
              )}
              {inv.status === 'paid' && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Paid {inv.paidDate}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Client Payment Settings tab ───────────────────────────────────────────────
function ClientSettingsTab() {
  const [settings, setSettings] = useState(
    clients.reduce((acc, c) => {
      acc[c.id] = { ...(clientPaymentSettings[c.id] || { method: 'cash', billingType: 'recurring', autopay: false }) }
      return acc
    }, {})
  )
  const [saved, setSaved] = useState(false)

  const update = (clientId, field, value) => {
    setSettings(prev => ({ ...prev, [clientId]: { ...prev[clientId], [field]: value } }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted">Set how each client pays and whether they're on a recurring or one-time basis.</p>
        <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ flexShrink: 0 }}>
          {saved ? <><CheckCircle2 size={13} /> Saved!</> : 'Save All'}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 180px 100px', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-input)' }}>
          {['Client', 'Payment Method', 'Billing Type', 'Autopay'].map(h => (
            <div key={h} className="card-title">{h}</div>
          ))}
        </div>

        {clients.map((client, i) => {
          const s = settings[client.id] || {}
          return (
            <div
              key={client.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 180px 100px',
                padding: '12px 20px',
                alignItems: 'center',
                borderBottom: i < clients.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Client name */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{client.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.frequency} · ${client.rate}/visit</div>
              </div>

              {/* Payment method */}
              <select
                value={s.method || 'cash'}
                onChange={e => update(client.id, 'method', e.target.value)}
                style={{ fontSize: 12, padding: '5px 8px' }}
              >
                {ALL_METHODS.map(m => (
                  <option key={m} value={m}>{METHOD_CONFIG[m].label}</option>
                ))}
              </select>

              {/* Billing type */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['recurring', 'one-time'].map(bt => (
                  <button
                    key={bt}
                    onClick={() => update(client.id, 'billingType', bt)}
                    style={{
                      flex: 1, padding: '5px 8px', borderRadius: 'var(--radius)',
                      border: `1px solid ${s.billingType === bt ? 'var(--gold)' : 'var(--border)'}`,
                      background: s.billingType === bt ? 'var(--gold-muted)' : 'var(--bg-input)',
                      color: s.billingType === bt ? 'var(--gold)' : 'var(--text-muted)',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    {bt === 'recurring' ? <><RefreshCw size={10} /> Recurring</> : <><DollarSign size={10} /> One-Time</>}
                  </button>
                ))}
              </div>

              {/* Autopay */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => update(client.id, 'autopay', !s.autopay)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: s.autopay ? 'var(--gold)' : 'var(--border)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                  title={s.autopay ? 'Autopay on' : 'Autopay off'}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: s.autopay ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s ease',
                  }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
const TABS = ['Invoices', 'Client Settings']

export default function Payments() {
  const [tab, setTab] = useState('Invoices')

  return (
    <div>
      <div className="page-header">
        <h1>Payments <span className="text-gold">— Invoicing & Billing</span></h1>
        <p>Track invoices, set payment methods, and manage recurring vs one-time billing per client.</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Invoices'         && <InvoicesTab />}
      {tab === 'Client Settings'  && <ClientSettingsTab />}
    </div>
  )
}
