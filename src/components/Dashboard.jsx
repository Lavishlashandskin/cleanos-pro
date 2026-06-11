import { useState, useRef, useEffect } from 'react'
import { DollarSign, Users, CalendarCheck, TrendingUp, Gift, Search, X } from 'lucide-react'
import { clients, workers, tipLog } from '../data/sampleData.js'

function getClientName(job) {
  if (job.clientName) return job.clientName
  const c = clients.find(c => c.id === job.clientId)
  return c ? c.name : 'Unknown'
}
function getWorkerName(workerId) {
  const w = workers.find(w => w.id === workerId)
  return w ? w.name.split(' ')[0] + ' ' + w.name.split(' ')[1][0] + '.' : '—'
}

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / 86400000)
}
function daysUntilBirthday(birthdayStr) {
  if (!birthdayStr) return 999
  const today = new Date()
  const bday  = new Date(birthdayStr)
  const next  = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next - today) / 86400000)
}

const TYPE_LABELS = { residential: 'Residential', commercial: 'Commercial', airbnb: 'Airbnb', moveout: 'Move-Out' }

export default function Dashboard({ jobs = [], onJobClick }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const q = query.toLowerCase()
  const matchClients = query ? clients.filter(c =>
    c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
  ).slice(0, 4) : []
  const matchWorkers = query ? workers.filter(w =>
    w.name.toLowerCase().includes(q)
  ).slice(0, 3) : []
  const matchJobs = query ? jobs.filter(j => {
    const name = (j.clientName || clients.find(c => c.id === j.clientId)?.name || '').toLowerCase()
    return name.includes(q) || j.address.toLowerCase().includes(q) || j.type.toLowerCase().includes(q)
  }).slice(0, 4) : []
  const hasResults = matchClients.length + matchWorkers.length + matchJobs.length > 0

  const totalMonthly = clients.reduce((sum, c) => {
    const mult = c.frequency === 'weekly' ? 4 : c.frequency === 'biweekly' ? 2 : 1
    return sum + c.rate * mult
  }, 0)

  const tipsThisMonth = tipLog.filter(t => t.date.startsWith('2026-06')).reduce((s, t) => s + t.amount, 0)
  const raiseAlerts   = clients.filter(c => daysSince(c.lastRaise) > 365)
  const birthdayAlerts = clients.filter(c => daysUntilBirthday(c.birthday) <= 14 && c.birthday)
  const nextJobs = jobs.slice(0, 5)

  return (
    <div>
      <div className="dash-search" ref={searchRef}>
        <div className="dash-search-input-wrap">
          <Search size={15} className="dash-search-icon" />
          <input
            className="dash-search-input"
            placeholder="Search clients, workers, jobs…"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
          />
          {query && (
            <button className="dash-search-clear" onClick={() => { setQuery(''); setOpen(false) }}>
              <X size={13} />
            </button>
          )}
        </div>

        {open && query && (
          <div className="dash-search-dropdown">
            {!hasResults && (
              <div className="dash-search-empty">No results for "{query}"</div>
            )}
            {matchClients.length > 0 && (
              <>
                <div className="dash-search-section">Clients</div>
                {matchClients.map(c => (
                  <div key={c.id} className="dash-search-result">
                    <div className="dash-search-result-name">{c.name}</div>
                    <div className="dash-search-result-sub">{c.address} · {c.frequency} · ${c.rate}/visit</div>
                  </div>
                ))}
              </>
            )}
            {matchWorkers.length > 0 && (
              <>
                <div className="dash-search-section">Workers</div>
                {matchWorkers.map(w => (
                  <div key={w.id} className="dash-search-result">
                    <div className="dash-search-result-name">{w.name}</div>
                    <div className="dash-search-result-sub">{w.jobsThisMonth} jobs this month · {w.phone}</div>
                  </div>
                ))}
              </>
            )}
            {matchJobs.length > 0 && (
              <>
                <div className="dash-search-section">Jobs</div>
                {matchJobs.map(j => (
                  <div
                    key={j.id}
                    className="dash-search-result clickable"
                    onClick={() => { onJobClick?.(j); setOpen(false); setQuery('') }}
                  >
                    <div className="dash-search-result-name">{getClientName(j)}</div>
                    <div className="dash-search-result-sub">{j.day} {j.time} · {j.address}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="page-header">
        <h1>Welcome back, Ashley</h1>
        <p>Here's what's happening with Reno Reset — as of today.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <DollarSign size={18} className="stat-icon" />
          <div className="stat-label">Est. Monthly Revenue</div>
          <div className="stat-value gold">${totalMonthly.toLocaleString()}</div>
          <div className="stat-sub up">+18% vs last month</div>
        </div>
        <div className="stat-card">
          <Users size={18} className="stat-icon" />
          <div className="stat-label">Active Clients</div>
          <div className="stat-value">{clients.length}</div>
          <div className="stat-sub">3 gold tier</div>
        </div>
        <div className="stat-card">
          <CalendarCheck size={18} className="stat-icon" />
          <div className="stat-label">Jobs This Week</div>
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-sub">Thru Jun 17</div>
        </div>
        <div className="stat-card">
          <DollarSign size={18} className="stat-icon" />
          <div className="stat-label">Tips — June</div>
          <div className="stat-value gold">${tipsThisMonth}</div>
          <div className="stat-sub">Across {workers.length} workers</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Jobs</span>
            <span className="text-xs text-muted">Click any job for details</span>
          </div>

          {nextJobs.map(job => (
            <div
              key={job.id}
              className="job-row clickable"
              onClick={() => onJobClick?.(job)}
            >
              <div className="job-time">{job.time}</div>
              <div className="job-info">
                <div className="job-name">{getClientName(job)}</div>
                <div className="job-detail">{job.address} · {TYPE_LABELS[job.type]}</div>
              </div>
              <span className="job-worker">{getWorkerName(job.workerId)}</span>
            </div>
          ))}

          {jobs.length > 5 && (
            <p className="text-xs text-muted mt-2" style={{ textAlign: 'center' }}>
              +{jobs.length - 5} more jobs this week
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Action Required</span></div>

            {raiseAlerts.length > 0 && (
              <div className="alert alert-warning">
                <TrendingUp size={15} />
                <div>
                  <strong>Raise overdue:</strong> {raiseAlerts.map(c => c.name.split(' ')[0]).join(', ')} haven't had a price increase in 12+ months.
                </div>
              </div>
            )}

            {birthdayAlerts.map(c => (
              <div key={c.id} className="alert alert-info">
                <Gift size={15} />
                <div>
                  <strong>{c.name.split(' ')[0]}'s birthday</strong> is in {daysUntilBirthday(c.birthday)} day{daysUntilBirthday(c.birthday) !== 1 ? 's' : ''} — send a note!
                </div>
              </div>
            ))}

            {raiseAlerts.length === 0 && birthdayAlerts.length === 0 && (
              <p className="text-sm text-muted">All clear — no urgent action items.</p>
            )}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Workers On Deck</span></div>
            {workers.map(w => (
              <div key={w.id} className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--gold)', color: '#fff8ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  {w.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-sm font-semibold">{w.name}</div>
                  <div className="text-xs text-muted">{w.jobsThisMonth} jobs · ${w.tipsThisMonth} tips this month</div>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
