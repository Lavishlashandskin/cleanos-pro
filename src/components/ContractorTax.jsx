import { useState } from 'react'
import { FileText, AlertTriangle, Check, Download, ChevronDown, ChevronUp, DollarSign, Users } from 'lucide-react'
import { workers, tipLog } from '../data/sampleData.js'

const THRESHOLD_1099 = 600
const TAX_YEAR = 2026

// Estimated contractor pay rate per hour (what owner pays workers, not client price)
const CONTRACTOR_HOURLY = { 1: 28, 2: 25, 3: 22 }

function calcWorkerEarnings(worker) {
  const workerTips = tipLog
    .filter(t => t.workerId === worker.id)
    .reduce((sum, t) => sum + t.amount, 0)

  const annualHours = worker.hoursThisMonth * 12
  const laborPay = (CONTRACTOR_HOURLY[worker.id] || 25) * annualHours

  return {
    laborPay,
    tips: workerTips,
    total: laborPay + workerTips,
    flag: laborPay + workerTips >= THRESHOLD_1099,
  }
}

function WorkerReport({ worker, open, onToggle }) {
  const { laborPay, tips, total, flag } = calcWorkerEarnings(worker)
  const workerTipItems = tipLog.filter(t => t.workerId === worker.id)

  return (
    <div className="card mb-4" style={{ borderLeft: `3px solid ${flag ? 'var(--gold)' : 'var(--border)'}` }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)', color: '#fff8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
          {worker.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{worker.name}</div>
          <div className="text-xs text-muted">{worker.phone}</div>
        </div>
        <div style={{ textAlign: 'right', marginRight: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: flag ? 'var(--gold)' : 'var(--text-primary)' }}>
            ${total.toLocaleString()}
          </div>
          <div className="text-xs text-muted">est. {TAX_YEAR} comp</div>
        </div>
        {flag
          ? <span className="badge badge-warning" style={{ flexShrink: 0 }}><AlertTriangle size={10} /> 1099 Required</span>
          : <span className="badge badge-neutral" style={{ flexShrink: 0 }}>Under $600</span>}
        {open ? <ChevronUp size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />}
      </div>

      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {/* Earnings breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Labor Pay', val: `$${laborPay.toLocaleString()}`, sub: `${worker.hoursThisMonth * 12}h × $${CONTRACTOR_HOURLY[worker.id] || 25}/hr` },
              { label: 'Tips (all time)', val: `$${tips}`, sub: `${workerTipItems.length} tips recorded` },
              { label: 'Total Comp', val: `$${total.toLocaleString()}`, sub: flag ? '1099-NEC required' : `Below $${THRESHOLD_1099} threshold`, gold: flag },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: s.gold ? 'var(--gold)' : 'var(--text-primary)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tip detail */}
          {workerTipItems.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-muted mb-2" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tip Records</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Client</th><th>Amount</th><th>Method</th></tr>
                  </thead>
                  <tbody>
                    {workerTipItems.map(t => (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td>{t.clientName}</td>
                        <td><span className="text-gold">${t.amount}</span></td>
                        <td>{t.method}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td colSpan={2}><strong>Total tips</strong></td>
                      <td><strong className="text-gold">${tips}</strong></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1099-NEC preview */}
          {flag && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} style={{ color: 'var(--gold)' }} /> 1099-NEC Summary — {TAX_YEAR}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                {[
                  ['Payer (you)', 'Reno Reset / Ashley Montgomery'],
                  ['Payer EIN/SSN', 'XX-XXXXXXX (your EIN)'],
                  ['Contractor', worker.name],
                  ['Contractor SSN', 'XXX-XX-XXXX (collect W-9)'],
                  ['Box 1 — NEC', `$${total.toLocaleString()}`],
                  ['Tax Year', String(TAX_YEAR)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: val.startsWith('$') ? 700 : 500 }}>{val}</div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary btn-sm mt-4"
                onClick={() => window.print()}
                style={{ marginTop: 14 }}
              >
                <Download size={13} /> Print / Save as PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContractorTax() {
  const [openWorker, setOpenWorker] = useState(null)
  const [showDemo, setShowDemo] = useState(false)

  const allEarnings = workers.map(w => ({ worker: w, ...calcWorkerEarnings(w) }))
  const flagged = allEarnings.filter(e => e.flag)
  const totalPaid = allEarnings.reduce((sum, e) => sum + e.total, 0)

  return (
    <div>
      <div className="page-header">
        <h1>1099 Contractor Tracking</h1>
        <p>Annual earnings per contractor, 1099-NEC threshold alerts, and year-end summaries.</p>
      </div>

      {/* Tax year summary */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <DollarSign size={18} className="stat-icon" />
          <div className="stat-label">Est. Total Contractor Comp</div>
          <div className="stat-value gold">${totalPaid.toLocaleString()}</div>
          <div className="stat-sub">All workers · {TAX_YEAR}</div>
        </div>
        <div className="stat-card">
          <Users size={18} className="stat-icon" />
          <div className="stat-label">Active Contractors</div>
          <div className="stat-value">{workers.length}</div>
          <div className="stat-sub">W-9 on file required</div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={18} className="stat-icon" />
          <div className="stat-label">1099-NEC Required</div>
          <div className="stat-value" style={{ color: flagged.length > 0 ? 'var(--gold)' : 'var(--success)' }}>{flagged.length}</div>
          <div className="stat-sub">Workers over $600</div>
        </div>
        <div className="stat-card">
          <FileText size={18} className="stat-icon" />
          <div className="stat-label">Due Date</div>
          <div className="stat-value text-sm" style={{ fontSize: 16 }}>Jan 31, 2027</div>
          <div className="stat-sub">File to IRS + mail to contractor</div>
        </div>
      </div>

      {/* Alert banner */}
      {flagged.length > 0 && (
        <div className="alert alert-warning mb-4">
          <AlertTriangle size={16} />
          <div>
            <strong>{flagged.length} contractor{flagged.length !== 1 ? 's' : ''} exceeded $600</strong> in {TAX_YEAR} — 1099-NEC required.
            File with the IRS and provide copy to each contractor by <strong>January 31, 2027</strong>.
            Make sure you have a signed W-9 on file for each.
          </div>
        </div>
      )}

      {/* IRS guidance */}
      <div className="alert alert-info mb-6">
        <FileText size={14} />
        <div style={{ fontSize: 12 }}>
          <strong>What to file:</strong> Form 1099-NEC for any contractor paid $600+ in non-employee compensation.
          {' '}<strong>Threshold includes:</strong> labor payments + cash tips you direct to contractors.
          {' '}<strong>Penalty:</strong> $60–$310 per missed form. Collect W-9 from each contractor before first payment.
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Contractor Reports — {TAX_YEAR}</h2>

      {workers.map(w => (
        <WorkerReport
          key={w.id}
          worker={w}
          open={openWorker === w.id}
          onToggle={() => setOpenWorker(openWorker === w.id ? null : w.id)}
        />
      ))}

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>Disclaimer:</strong> Earnings shown are estimates based on recorded hours and tips. Actual compensation may vary. Consult a tax professional or CPA for filing guidance. IRS thresholds and deadlines are based on current regulations and may change.
      </div>
    </div>
  )
}
