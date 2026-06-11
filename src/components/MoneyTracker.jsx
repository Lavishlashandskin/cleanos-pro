import { useState } from 'react'
import { DollarSign, Plus, TrendingUp, AlertTriangle, Car } from 'lucide-react'
import { tipLog, mileageLog, clients, workers, IRS_RATE } from '../data/sampleData.js'

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / 86400000)
}

// ─── Tips tab ────────────────────────────────────────────────────────────────
function TipsTab() {
  const [log, setLog] = useState(tipLog)
  const [form, setForm] = useState({ clientName: '', amount: '', method: 'Cash', workerName: '' })
  const [showForm, setShowForm] = useState(false)

  const thisMonth = log.filter(t => t.date.startsWith('2026-06'))
  const totalThisMonth = thisMonth.reduce((s, t) => s + t.amount, 0)
  const totalAllTime = log.reduce((s, t) => s + t.amount, 0)
  const avgTip = log.length ? (totalAllTime / log.length).toFixed(2) : '0'

  // Per-client averages
  const clientAverages = clients.map(c => {
    const tips = log.filter(t => t.clientId === c.id)
    return { name: c.name, count: tips.length, avg: tips.length ? (tips.reduce((s, t) => s + t.amount, 0) / tips.length).toFixed(2) : null }
  }).filter(c => c.count > 0).sort((a, b) => b.avg - a.avg)

  const addTip = () => {
    if (!form.clientName || !form.amount) return
    const newEntry = {
      id: Date.now(),
      date: '2026-06-10',
      clientId: null,
      clientName: form.clientName,
      amount: parseFloat(form.amount),
      method: form.method,
      workerId: null,
      workerName: form.workerName || 'Ashley',
    }
    setLog(l => [newEntry, ...l])
    setForm({ clientName: '', amount: '', method: 'Cash', workerName: '' })
    setShowForm(false)
  }

  // Tip split calculator
  const [splitTotal, setSplitTotal] = useState('')
  const [splitWorkers, setSplitWorkers] = useState('2')
  const splitAmount = splitTotal && splitWorkers ? (parseFloat(splitTotal) / parseInt(splitWorkers)).toFixed(2) : null

  return (
    <div>
      <div className="money-summary">
        <div className="money-stat">
          <div className="money-stat-val">${totalThisMonth}</div>
          <div className="money-stat-lbl">Tips — June</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">${totalAllTime}</div>
          <div className="money-stat-lbl">All-time tips</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">${avgTip}</div>
          <div className="money-stat-lbl">Avg per job</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">{log.length}</div>
          <div className="money-stat-lbl">Tips logged</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3>Tip Log</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(s => !s)}>
              <Plus size={13} /> Log Tip
            </button>
          </div>

          {showForm && (
            <div className="card mb-3" style={{ animation: 'fadeIn 0.2s ease' }}>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Client</label>
                  <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Client name" />
                </div>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Amount ($)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Method</label>
                  <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                    {['Cash','Venmo','Zelle','Other'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label">Worker</label>
                  <input value={form.workerName} onChange={e => setForm(f => ({ ...f, workerName: e.target.value }))} placeholder="Worker name" />
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={addTip}>Save Tip</button>
            </div>
          )}

          <div className="card">
            <div className="tip-log-scroll">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Client</th><th>Amount</th><th>Method</th><th>Worker</th></tr></thead>
                  <tbody>
                    {log.slice(0, 10).map(t => (
                      <tr key={t.id}>
                        <td>{t.date.slice(5)}</td>
                        <td><strong>{t.clientName}</strong></td>
                        <td><span className="text-gold font-bold">${t.amount}</span></td>
                        <td>{t.method}</td>
                        <td>{t.workerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="card-title" style={{ marginBottom: 12 }}>Per-Client Tip Averages</div>
            {clientAverages.slice(0, 6).map(c => (
              <div key={c.name} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm">{c.name}</span>
                <div className="flex gap-3 items-center">
                  <span className="text-xs text-muted">{c.count} tips</span>
                  <span className="text-gold font-bold">${c.avg}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Tip Split Calculator</div>
            <div className="form-row" style={{ marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Tip ($)</label>
                <input type="number" placeholder="0" value={splitTotal} onChange={e => setSplitTotal(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Workers</label>
                <select value={splitWorkers} onChange={e => setSplitWorkers(e.target.value)}>
                  {['2','3','4','5'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            {splitAmount && (
              <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>${splitAmount}</div>
                <div className="text-xs text-muted mt-1">per worker ({splitWorkers} workers splitting ${splitTotal})</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mileage tab ─────────────────────────────────────────────────────────────
function MileageTab() {
  const [log, setLog] = useState(mileageLog)
  const [form, setForm] = useState({ from: '', to: '', miles: '', purpose: 'Residential cleaning' })
  const [showForm, setShowForm] = useState(false)

  const totalMiles = log.reduce((s, m) => s + m.miles, 0)
  const totalDeduction = (totalMiles * IRS_RATE).toFixed(2)
  const juneMiles = log.filter(m => m.date.startsWith('2026-06')).reduce((s, m) => s + m.miles, 0)

  const addEntry = () => {
    if (!form.from || !form.to || !form.miles) return
    setLog(l => [{ id: Date.now(), date: '2026-06-10', ...form, miles: parseFloat(form.miles) }, ...l])
    setForm({ from: '', to: '', miles: '', purpose: 'Residential cleaning' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="money-summary">
        <div className="money-stat">
          <div className="money-stat-val">{juneMiles.toFixed(1)}</div>
          <div className="money-stat-lbl">Miles — June</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">{totalMiles.toFixed(1)}</div>
          <div className="money-stat-lbl">Total miles logged</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">${totalDeduction}</div>
          <div className="money-stat-lbl">Est. deduction (IRS)</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val">${IRS_RATE}/mi</div>
          <div className="money-stat-lbl">2026 IRS rate</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3>Mileage Log</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={13} /> Log Trip
        </button>
      </div>

      {showForm && (
        <div className="card mb-3" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">From</label>
              <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="e.g. Home" />
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">To</label>
              <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} placeholder="e.g. Client address" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Miles</label>
              <input type="number" step="0.1" value={form.miles} onChange={e => setForm(f => ({ ...f, miles: e.target.value }))} placeholder="0.0" />
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Purpose</label>
              <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={addEntry}>Save Trip</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>From</th><th>To</th><th>Miles</th><th>Deduction</th></tr></thead>
            <tbody>
              {log.map(m => (
                <tr key={m.id}>
                  <td>{m.date.slice(5)}</td>
                  <td>{m.from}</td>
                  <td><strong>{m.to}</strong></td>
                  <td>{m.miles}</td>
                  <td><span className="text-gold">${(m.miles * IRS_RATE).toFixed(2)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Tax snapshot tab ─────────────────────────────────────────────────────────
function TaxTab() {
  const [annualRevenue, setAnnualRevenue] = useState(52000)
  const mileageDeduction = mileageLog.reduce((s, m) => s + m.miles, 0) * IRS_RATE
  const supplyEstimate = annualRevenue * 0.08
  const phoneDeduction = 600
  const softwareDeduction = 240
  const totalDeductions = mileageDeduction + supplyEstimate + phoneDeduction + softwareDeduction
  const netIncome = Math.max(0, annualRevenue - totalDeductions)
  const seTax = netIncome * 0.1413
  const federalTax = netIncome > 44725 ? (netIncome - 44725) * 0.22 + 44725 * 0.12 : netIncome * 0.12
  const totalTax = seTax + federalTax
  const quarterlyPayment = totalTax / 4

  return (
    <div>
      <div className="two-col">
        <div>
          <div className="card mb-4">
            <div className="card-title" style={{ marginBottom: 14 }}>Annual Revenue Estimate</div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Est. Annual Revenue</label>
              <input
                type="number"
                value={annualRevenue}
                onChange={e => setAnnualRevenue(Number(e.target.value))}
                placeholder="52000"
              />
            </div>
            <p className="text-xs text-muted">Adjust this number to see how your tax picture changes.</p>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Estimated Deductions</div>
            {[
              { label: 'Mileage deduction', val: mileageDeduction.toFixed(2) },
              { label: `Supplies (est. 8% of revenue)`, val: supplyEstimate.toFixed(2) },
              { label: 'Phone / software', val: (phoneDeduction + softwareDeduction).toFixed(2) },
            ].map(d => (
              <div key={d.label} className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span className="text-secondary">{d.label}</span>
                <span className="text-success">-${d.val}</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ paddingTop: 10, fontWeight: 700 }}>
              <span>Total Deductions</span>
              <span className="text-success">-${totalDeductions.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ borderColor: 'var(--gold)', borderWidth: 1 }}>
            <div className="card-title" style={{ marginBottom: 16, color: 'var(--gold)' }}>Tax Snapshot</div>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)' }}>
                ${quarterlyPayment.toFixed(0)}
              </div>
              <div className="text-sm text-muted">Estimated quarterly payment</div>
            </div>

            {[
              { label: 'Net taxable income', val: `$${netIncome.toFixed(0)}` },
              { label: 'Self-employment tax (14.13%)', val: `$${seTax.toFixed(0)}` },
              { label: 'Federal income tax (est.)', val: `$${federalTax.toFixed(0)}` },
              { label: 'Total annual tax est.', val: `$${totalTax.toFixed(0)}`, bold: true },
            ].map(r => (
              <div key={r.label} className="flex justify-between" style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span className={r.bold ? 'font-semibold' : 'text-secondary'}>{r.label}</span>
                <span className={r.bold ? 'text-gold font-bold' : 'text-primary'}>{r.val}</span>
              </div>
            ))}

            <div className="alert alert-info mt-3" style={{ marginBottom: 0, fontSize: 12 }}>
              <AlertTriangle size={13} />
              Estimate only — consult a tax professional. Due dates: Apr 15, Jun 16, Sep 15, Jan 15.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Raise detector tab ───────────────────────────────────────────────────────
function RaiseDetectorTab() {
  const withDays = clients.map(c => ({
    ...c,
    daysSinceRaise: daysSince(c.lastRaise),
  })).sort((a, b) => b.daysSinceRaise - a.daysSinceRaise)

  const flagged = withDays.filter(c => c.daysSinceRaise > 365)
  const warning = withDays.filter(c => c.daysSinceRaise >= 270 && c.daysSinceRaise <= 365)
  const ok = withDays.filter(c => c.daysSinceRaise < 270)

  const RaiseRow = ({ client, status }) => (
    <div className={`raise-row${status === 'flagged' ? ' flagged' : status === 'warning' ? ' warning' : ''}`}>
      <div>
        <div className="text-sm font-semibold">{client.name}</div>
        <div className="text-xs text-muted">{client.frequency} · ${client.rate}/visit</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="text-sm font-bold" style={{ color: status === 'flagged' ? 'var(--danger)' : status === 'warning' ? 'var(--warning)' : 'var(--success)' }}>
          {client.daysSinceRaise} days
        </div>
        <div className="text-xs text-muted">since last raise</div>
      </div>
      <div>
        <span className={`badge ${status === 'flagged' ? 'badge-danger' : status === 'warning' ? 'badge-warning' : 'badge-success'}`}>
          {status === 'flagged' ? 'Overdue' : status === 'warning' ? 'Watch' : 'OK'}
        </span>
      </div>
      <div>
        <span className="text-xs text-muted">
          Suggest: <strong style={{ color: 'var(--text-primary)' }}>${Math.ceil(client.rate * 1.1 / 5) * 5}/visit</strong>
        </span>
      </div>
    </div>
  )

  return (
    <div>
      <div className="money-summary">
        <div className="money-stat">
          <div className="money-stat-val" style={{ color: 'var(--danger)' }}>{flagged.length}</div>
          <div className="money-stat-lbl">Raise overdue</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val" style={{ color: 'var(--warning)' }}>{warning.length}</div>
          <div className="money-stat-lbl">Watch closely</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val" style={{ color: 'var(--success)' }}>{ok.length}</div>
          <div className="money-stat-lbl">Up to date</div>
        </div>
        <div className="money-stat">
          <div className="money-stat-val text-gold">
            ${flagged.reduce((s, c) => s + Math.ceil(c.rate * 0.1 / 5) * 5, 0) * 2}/mo
          </div>
          <div className="money-stat-lbl">Potential recovery</div>
        </div>
      </div>

      {flagged.length > 0 && (
        <>
          <div className="card-title mb-2" style={{ color: 'var(--danger)' }}>Overdue — Raise Now</div>
          {flagged.map(c => <RaiseRow key={c.id} client={c} status="flagged" />)}
        </>
      )}

      {warning.length > 0 && (
        <>
          <div className="card-title mb-2 mt-4" style={{ color: 'var(--warning)' }}>Watch — Coming Up</div>
          {warning.map(c => <RaiseRow key={c.id} client={c} status="warning" />)}
        </>
      )}

      {ok.length > 0 && (
        <>
          <div className="card-title mb-2 mt-4" style={{ color: 'var(--success)' }}>Good — No Action Needed</div>
          {ok.map(c => <RaiseRow key={c.id} client={c} status="ok" />)}
        </>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
const TABS = ['Tips', 'Mileage', 'Tax Snapshot', 'Raise Detector']

export default function MoneyTracker() {
  const [activeTab, setActiveTab] = useState('Tips')

  return (
    <div>
      <div className="page-header">
        <h1>Money Tracker</h1>
        <p>Tips, mileage, taxes, and raise alerts — all in one place.</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'Tips' && <TipsTab />}
      {activeTab === 'Mileage' && <MileageTab />}
      {activeTab === 'Tax Snapshot' && <TaxTab />}
      {activeTab === 'Raise Detector' && <RaiseDetectorTab />}
    </div>
  )
}
