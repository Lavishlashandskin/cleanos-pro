import { useState, useCallback } from 'react'
import { Car, MapPin, Plus, Download, Navigation, Pencil, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import { workers, mileageLog as initialLog, IRS_RATE } from '../data/sampleData.js'
import { getDistanceMiles, getCurrentPosition, isConfigured } from '../lib/googleMaps.js'

const PURPOSES = [
  'Residential cleaning', 'Commercial cleaning', 'Airbnb turnover',
  'Move-out clean', 'Supply run', 'Client consultation', 'Other',
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmt(n) { return n.toFixed(1) }
function fmtMoney(n) { return '$' + n.toFixed(2) }
function fmtDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${MONTHS[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`
}

// ── Add Entry Form ─────────────────────────────────────────────────────────────
function AddEntryForm({ onAdd, defaultWorkerId }) {
  const [form, setForm] = useState({
    workerId: defaultWorkerId || workers[0]?.id || 1,
    date: new Date().toISOString().slice(0, 10),
    from: '',
    to: '',
    miles: '',
    purpose: 'Residential cleaning',
    method: 'manual',
  })
  const [gpsState, setGpsState] = useState('idle') // idle | locating | calculating | done | error
  const [gpsMsg, setGpsMsg] = useState('')
  const mapsEnabled = isConfigured()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGpsCalculate = useCallback(async () => {
    if (!form.to) { setGpsMsg('Enter a destination address first.'); return }
    setGpsState('locating')
    setGpsMsg('Getting your current location…')
    try {
      const pos = await getCurrentPosition()
      setGpsState('calculating')
      setGpsMsg('Calculating distance via Google Maps…')
      const originLatLng = `${pos.lat},${pos.lng}`
      const result = await getDistanceMiles(originLatLng, form.to)
      if (result) {
        set('miles', String(result.miles))
        set('from', 'Current GPS location')
        set('method', 'gps')
        setGpsState('done')
        setGpsMsg(`${result.miles} mi · ${result.durationText} drive`)
      } else {
        setGpsState('error')
        setGpsMsg('Could not calculate distance — enter miles manually.')
      }
    } catch (e) {
      setGpsState('error')
      setGpsMsg(e.message?.includes('User denied') ? 'Location access denied — enter miles manually.' : 'Location unavailable — enter miles manually.')
    }
  }, [form.to])

  const handleAddressCalculate = useCallback(async () => {
    if (!form.from || !form.to) { setGpsMsg('Enter both From and To addresses first.'); return }
    setGpsState('calculating')
    setGpsMsg('Calculating distance via Google Maps…')
    try {
      const result = await getDistanceMiles(form.from, form.to)
      if (result) {
        set('miles', String(result.miles))
        set('method', 'gps')
        setGpsState('done')
        setGpsMsg(`${result.miles} mi · ${result.durationText} drive`)
      } else {
        setGpsState('error')
        setGpsMsg('Could not calculate distance — enter miles manually.')
      }
    } catch {
      setGpsState('error')
      setGpsMsg('Error calculating distance.')
    }
  }, [form.from, form.to])

  const handleAdd = () => {
    if (!form.miles || isNaN(parseFloat(form.miles))) return
    onAdd({
      id: Date.now(),
      workerId: Number(form.workerId),
      date: form.date,
      from: form.from || 'Home',
      to: form.to,
      miles: parseFloat(form.miles),
      purpose: form.purpose,
      method: form.method,
    })
    setForm(f => ({ ...f, from: '', to: '', miles: '', method: 'manual' }))
    setGpsState('idle')
    setGpsMsg('')
  }

  const calculating = gpsState === 'locating' || gpsState === 'calculating'

  return (
    <div className="card mb-4" style={{ borderLeft: '3px solid var(--gold)' }}>
      <div className="card-title" style={{ marginBottom: 14 }}>Log Mileage Entry</div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Worker</label>
          <select value={form.workerId} onChange={e => set('workerId', e.target.value)}>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">From Address (or "Home")</label>
        <input type="text" placeholder="e.g. Home, or 123 Main St" value={form.from} onChange={e => set('from', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">To Address <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input type="text" placeholder="e.g. 4821 Meadow Creek Dr, Reno NV 89519" value={form.to} onChange={e => set('to', e.target.value)} />
      </div>

      {mapsEnabled && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleGpsCalculate}
            disabled={calculating || !form.to}
            title="Use your current GPS location as origin"
          >
            {calculating ? <><Loader size={12} className="spin" /> Calculating…</> : <><Navigation size={12} /> GPS → Destination</>}
          </button>
          {form.from && form.from !== 'Home' && form.from !== 'Current GPS location' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleAddressCalculate}
              disabled={calculating || !form.from || !form.to}
            >
              {calculating ? <><Loader size={12} className="spin" /> Calculating…</> : <><MapPin size={12} /> Calculate from Addresses</>}
            </button>
          )}
        </div>
      )}

      {gpsMsg && (
        <div className="alert" style={{
          marginBottom: 12,
          background: gpsState === 'done' ? 'var(--bg-card)' : gpsState === 'error' ? '#FAEAEA' : 'var(--bg-input)',
          border: `1px solid ${gpsState === 'done' ? 'var(--success)' : gpsState === 'error' ? 'var(--danger)' : 'var(--border)'}`,
          color: gpsState === 'done' ? 'var(--success)' : gpsState === 'error' ? 'var(--danger)' : 'var(--text-muted)',
          padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: 12, display: 'flex', gap: 6, alignItems: 'center',
        }}>
          {gpsState === 'done' ? <CheckCircle2 size={13} /> : gpsState === 'error' ? <AlertCircle size={13} /> : <Loader size={13} />}
          {gpsMsg}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Miles <span style={{ color: 'var(--danger)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              type="number" min="0" step="0.1"
              placeholder="0.0"
              value={form.miles}
              onChange={e => { set('miles', e.target.value); set('method', 'manual') }}
              style={{ paddingRight: 50 }}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>
              {form.method === 'gps' ? 'GPS' : 'mi'}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Purpose</label>
          <select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
            {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {!mapsEnabled && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', gap: 5, alignItems: 'center' }}>
          <AlertCircle size={11} /> Add VITE_GOOGLE_MAPS_KEY to .env to enable GPS distance calculation
        </div>
      )}

      <button
        className="btn btn-primary btn-sm"
        disabled={!form.to || !form.miles || isNaN(parseFloat(form.miles))}
        onClick={handleAdd}
        style={{ marginTop: 4 }}
      >
        <Plus size={13} /> Add Entry
      </button>
    </div>
  )
}

// ── Log Tab ────────────────────────────────────────────────────────────────────
function LogTab({ log, setLog }) {
  const [selectedWorker, setSelectedWorker] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const filtered = selectedWorker === 'all'
    ? log
    : log.filter(e => e.workerId === Number(selectedWorker))

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50)

  const handleAdd = (entry) => {
    setLog(prev => [entry, ...prev])
    setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedWorker}
            onChange={e => setSelectedWorker(e.target.value)}
            style={{ fontSize: 13 }}
          >
            <option value="all">All Workers</option>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={13} /> {showForm ? 'Cancel' : 'Log Mileage'}
        </button>
      </div>

      {showForm && <AddEntryForm onAdd={handleAdd} defaultWorkerId={selectedWorker !== 'all' ? Number(selectedWorker) : null} />}

      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Car size={28} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
          <p className="text-muted">No mileage entries yet.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Worker</th>
                  <th>From → To</th>
                  <th>Purpose</th>
                  <th style={{ textAlign: 'right' }}>Miles</th>
                  <th style={{ textAlign: 'right' }}>Deduction</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(entry => {
                  const worker = workers.find(w => w.id === entry.workerId)
                  const deduction = entry.miles * IRS_RATE
                  return (
                    <tr key={entry.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDate(entry.date)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)', color: '#fff8ee', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {worker?.initials || '?'}
                          </div>
                          <span style={{ fontSize: 12 }}>{worker?.name.split(' ')[0] || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.from}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>→ {entry.to}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.purpose}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {fmt(entry.miles)} mi
                        {entry.method === 'gps' && (
                          <span style={{ display: 'block', fontSize: 9, color: 'var(--success)', fontWeight: 600 }}>GPS</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--gold)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {fmtMoney(deduction)}
                      </td>
                      <td>
                        <button
                          onClick={() => setLog(prev => prev.filter(e => e.id !== entry.id))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                          title="Remove entry"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reports Tab ────────────────────────────────────────────────────────────────
function MonthlyReport({ entries, workerName, year, month }) {
  const totalMiles = entries.reduce((s, e) => s + e.miles, 0)
  const totalDeduction = totalMiles * IRS_RATE

  if (entries.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)' }}>
        {MONTH_FULL[month - 1]} {year}
      </div>
      <div className="table-wrap">
        <table style={{ fontSize: 12 }}>
          <thead>
            <tr><th>Date</th><th>From</th><th>To</th><th>Purpose</th><th style={{ textAlign: 'right' }}>Miles</th></tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(e.date)}</td>
                <td>{e.from}</td>
                <td>{e.to}</td>
                <td style={{ color: 'var(--text-muted)' }}>{e.purpose}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(e.miles)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td colSpan={4}><strong>{MONTH_FULL[month - 1]} Total</strong></td>
              <td style={{ textAlign: 'right' }}><strong>{fmt(totalMiles)} mi</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(totalMiles)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Business Miles</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>{fmtMoney(totalDeduction)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>IRS Deduction @ ${IRS_RATE}/mi</div>
        </div>
      </div>
    </div>
  )
}

function ReportsTab({ log }) {
  const currentYear = 2026
  const [selectedWorker, setSelectedWorker] = useState(String(workers[0]?.id || 1))
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [viewMode, setViewMode] = useState('annual') // annual | monthly

  const workerId = Number(selectedWorker)
  const year = Number(selectedYear)
  const worker = workers.find(w => w.id === workerId)

  const workerLog = log.filter(e => e.workerId === workerId && e.date.startsWith(String(year)))

  const totalMiles = workerLog.reduce((s, e) => s + e.miles, 0)
  const totalDeduction = totalMiles * IRS_RATE

  // Group by month
  const byMonth = {}
  for (const entry of workerLog) {
    const m = parseInt(entry.date.split('-')[1], 10)
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(entry)
  }

  const handlePrint = () => window.print()

  return (
    <div>
      {/* Controls */}
      <div className="card mb-4">
        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Worker</label>
            <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tax Year</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${viewMode === 'annual' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('annual')}
          >Annual Summary</button>
          <button
            className={`btn btn-sm ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('monthly')}
          >Monthly Detail</button>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={handlePrint}>
            <Download size={13} /> Export / Print
          </button>
        </div>
      </div>

      {/* IRS Header */}
      <div className="card mb-4" style={{ borderLeft: '3px solid var(--gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
              IRS Standard Mileage Report — {year}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{worker?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              IRS standard rate: ${IRS_RATE}/mile · Schedule C / Form 2106
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{fmtMoney(totalDeduction)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total deduction</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Total Business Miles', val: `${fmt(totalMiles)} mi`, gold: false },
            { label: 'IRS Rate ({year})'.replace('{year}', year), val: `$${IRS_RATE}/mile`, gold: false },
            { label: 'Estimated Deduction', val: fmtMoney(totalDeduction), gold: true },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.gold ? 'var(--gold)' : 'var(--text-primary)' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {workerLog.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <Car size={28} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
          <p className="text-muted">No mileage recorded for {worker?.name} in {year}.</p>
        </div>
      ) : viewMode === 'annual' ? (
        /* Annual: monthly summary table */
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Monthly Breakdown — {year}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: 'right' }}>Trips</th>
                  <th style={{ textAlign: 'right' }}>Miles</th>
                  <th style={{ textAlign: 'right' }}>Deduction</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => {
                  const monthNum = i + 1
                  const monthEntries = byMonth[monthNum] || []
                  if (monthEntries.length === 0) return null
                  const miles = monthEntries.reduce((s, e) => s + e.miles, 0)
                  return (
                    <tr key={m}>
                      <td>{MONTH_FULL[i]}</td>
                      <td style={{ textAlign: 'right' }}>{monthEntries.length}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(miles)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>{fmtMoney(miles * IRS_RATE)}</td>
                    </tr>
                  )
                }).filter(Boolean)}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td><strong>Annual Total</strong></td>
                  <td style={{ textAlign: 'right' }}><strong>{workerLog.length}</strong></td>
                  <td style={{ textAlign: 'right' }}><strong>{fmt(totalMiles)}</strong></td>
                  <td style={{ textAlign: 'right' }}><strong style={{ color: 'var(--gold)' }}>{fmtMoney(totalDeduction)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Monthly: full detail by month */
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Monthly Detail — {year}</div>
          {Object.entries(byMonth)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([month, entries]) => (
              <MonthlyReport
                key={month}
                entries={entries}
                workerName={worker?.name}
                year={year}
                month={Number(month)}
              />
            ))}
        </div>
      )}

      <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong>IRS Note:</strong> The {year} standard mileage rate is ${IRS_RATE} per mile for business use of a vehicle.
        Keep this log and original receipts/records. Report on Schedule C (self-employed) or Form 2106 (employees).
        Consult a tax professional for guidance on your specific situation.
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MileageTracker() {
  const [log, setLog] = useState(initialLog)
  const [tab, setTab] = useState('log')

  const totalMilesThisMonth = log
    .filter(e => e.date.startsWith('2026-06'))
    .reduce((s, e) => s + e.miles, 0)

  const totalDeductionThisMonth = totalMilesThisMonth * IRS_RATE

  return (
    <div>
      <div className="page-header">
        <h1>Mileage Tracker <span className="text-gold">— IRS Reports</span></h1>
        <p>GPS-tracked business miles per worker with IRS standard mileage deduction reports.</p>
      </div>

      {/* Summary stats */}
      <div className="stat-grid mb-6">
        <div className="stat-card">
          <Car size={18} className="stat-icon" />
          <div className="stat-label">Miles This Month</div>
          <div className="stat-value gold">{fmt(totalMilesThisMonth)}</div>
          <div className="stat-sub">All workers · Jun 2026</div>
        </div>
        <div className="stat-card">
          <MapPin size={18} className="stat-icon" />
          <div className="stat-label">IRS Deduction This Month</div>
          <div className="stat-value gold">{fmtMoney(totalDeductionThisMonth)}</div>
          <div className="stat-sub">@ ${IRS_RATE}/mile</div>
        </div>
        <div className="stat-card">
          <Navigation size={18} className="stat-icon" />
          <div className="stat-label">Trips Logged</div>
          <div className="stat-value">{log.filter(e => e.date.startsWith('2026-06')).length}</div>
          <div className="stat-sub">This month</div>
        </div>
        <div className="stat-card">
          <Pencil size={18} className="stat-icon" />
          <div className="stat-label">Annual Deduction (YTD)</div>
          <div className="stat-value gold">{fmtMoney(log.filter(e => e.date.startsWith('2026')).reduce((s, e) => s + e.miles, 0) * IRS_RATE)}</div>
          <div className="stat-sub">2026 tax year</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'log' ? ' active' : ''}`} onClick={() => setTab('log')}>
          <Plus size={13} style={{ display: 'inline', marginRight: 5 }} />Log Mileage
        </button>
        <button className={`tab${tab === 'reports' ? ' active' : ''}`} onClick={() => setTab('reports')}>
          <Download size={13} style={{ display: 'inline', marginRight: 5 }} />IRS Reports
        </button>
      </div>

      {tab === 'log'     && <LogTab     log={log} setLog={setLog} />}
      {tab === 'reports' && <ReportsTab log={log} />}
    </div>
  )
}
