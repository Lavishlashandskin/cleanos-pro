import { useState, useRef, useEffect } from 'react'
import { DollarSign, Users, CalendarCheck, TrendingUp, Gift, Search, X, Mail, ShieldCheck, Clock, Bell, MessageSquare } from 'lucide-react'
import { clients, workers, tipLog } from '../data/sampleData.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useService } from '../context/ServiceContext.jsx'

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

function WaiverBadge({ job, onSendWaiver }) {
  const { waiverStatus } = job
  if (waiverStatus === 'signed') {
    return (
      <span className="waiver-badge waiver-signed" title={`Signed by ${job.signedBy}`}>
        <ShieldCheck size={11} /> Signed
      </span>
    )
  }
  if (waiverStatus === 'sent') {
    return (
      <span className="waiver-badge waiver-sent" title="Waiver sent — awaiting signature">
        <Clock size={11} /> Pending
      </span>
    )
  }
  return (
    <button
      className="waiver-badge waiver-none"
      title="Send waiver to client"
      onClick={(e) => {
        e.stopPropagation()
        const client = clients.find(c => c.id === job.clientId)
        const email  = client?.email || ''
        const name   = getClientName(job)
        const first  = name.split(' ')[0]
        const biz    = profile?.businessName || 'our team'
        const body   = `Hi ${first},\n\nYour upcoming service appointment requires a signed agreement before we arrive.\n\nPlease log in to the client portal and navigate to the "Waivers" tab to review and sign.\n\nThank you!\n${biz}`
        window.open(`mailto:${email}?subject=${encodeURIComponent('Service Agreement — Please Sign')}&body=${encodeURIComponent(body)}`)
        onSendWaiver?.(job.id)
      }}
    >
      <Mail size={11} /> Send
    </button>
  )
}

export default function Dashboard({ jobs = [], onJobClick, onSendWaiver }) {
  const { profile } = useProfile()
  const { serviceType } = useService()
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const searchRef         = useRef(null)

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
  const matchWorkers = query ? workers.filter(w => w.name.toLowerCase().includes(q)).slice(0, 3) : []
  const matchJobs = query ? jobs.filter(j => {
    const name = (j.clientName || clients.find(c => c.id === j.clientId)?.name || '').toLowerCase()
    return name.includes(q) || j.address.toLowerCase().includes(q) || j.type.toLowerCase().includes(q)
  }).slice(0, 4) : []
  const hasResults = matchClients.length + matchWorkers.length + matchJobs.length > 0

  const pendingBookings = (() => {
    try { return JSON.parse(localStorage.getItem('cleanos_bookings') || '[]').filter(b => b.status === 'pending') } catch { return [] }
  })()

  const totalMonthly = clients.reduce((sum, c) => {
    const mult = c.frequency === 'weekly' ? 4 : c.frequency === 'biweekly' ? 2 : 1
    return sum + c.rate * mult
  }, 0)
  const tipsThisMonth  = tipLog.filter(t => t.date.startsWith('2026-06')).reduce((s, t) => s + t.amount, 0)
  const raiseAlerts    = clients.filter(c => daysSince(c.lastRaise) > 365)
  const birthdayAlerts = clients.filter(c => daysUntilBirthday(c.birthday) <= 14 && c.birthday)

  // Comms due today
  const TODAY    = '2026-06-12'
  const TOMORROW = '2026-06-13'
  const commsDue = jobs.filter(j =>
    (j.date === TODAY || j.date === TOMORROW) &&
    j.status !== 'completed' &&
    j.commsLog?.reminder !== 'sent'
  )
  const reviewsDue = jobs.filter(j => j.status === 'completed' && j.commsLog?.review !== 'sent')

  const nextJobs = jobs.slice(0, 5)

  return (
    <div>
      {/* Global search */}
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
            {!hasResults && <div className="dash-search-empty">No results for "{query}"</div>}
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
                  <div key={j.id} className="dash-search-result clickable" onClick={() => { onJobClick?.(j); setOpen(false); setQuery('') }}>
                    <div className="dash-search-result-name">{getClientName(j)}</div>
                    <div className="dash-search-result-sub">{j.day} {j.time} · {j.address}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {pendingBookings.length > 0 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--gold-muted)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
              {pendingBookings.length} new online booking request{pendingBookings.length !== 1 ? 's' : ''} — {pendingBookings[0].clientName}{pendingBookings.length > 1 ? ` + ${pendingBookings.length - 1} more` : ''}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View in Schedule</span>
        </div>
      )}

      <div className="page-header">
        <h1>Welcome back, {profile.ownerName}</h1>
        <p>Here's what's happening with {profile.businessName || 'your business'} — as of today.</p>
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
            <span className="text-xs text-muted">Click for details</span>
          </div>

          {nextJobs.map(job => (
            <div key={job.id} className="job-row clickable" onClick={() => onJobClick?.(job)}>
              <div className="job-time">{job.time}</div>
              <div className="job-info">
                <div className="job-name">{getClientName(job)}</div>
                <div className="job-detail">{job.address} · {TYPE_LABELS[job.type]}</div>
              </div>
              <WaiverBadge job={job} onSendWaiver={onSendWaiver} />
              <span className="job-worker" style={{ marginLeft: 4 }}>{getWorkerName(job.workerId)}</span>
            </div>
          ))}

          {jobs.length > 5 && (
            <p className="text-xs text-muted mt-2" style={{ textAlign: 'center' }}>
              +{jobs.length - 5} more jobs this week
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Comms due card */}
          {(commsDue.length > 0 || reviewsDue.length > 0) && (
            <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
              <div className="card-header">
                <span className="card-title">
                  <MessageSquare size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--gold)' }} />
                  Comms Due
                </span>
                <span style={{ fontSize: 11, background: 'var(--gold)', color: '#fff8ee', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>
                  {commsDue.length + reviewsDue.length}
                </span>
              </div>
              {commsDue.length > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: 8 }}>
                  <Bell size={13} />
                  <div>
                    <strong>{commsDue.length} reminder{commsDue.length !== 1 ? 's' : ''} due</strong> — {commsDue.map(j => getClientName(j).split(' ')[0]).join(', ')}
                  </div>
                </div>
              )}
              {reviewsDue.length > 0 && (
                <div className="alert alert-info" style={{ marginBottom: 0 }}>
                  <MessageSquare size={13} />
                  <div>
                    <strong>{reviewsDue.length} review request{reviewsDue.length !== 1 ? 's' : ''} ready</strong> to send after completed jobs.
                  </div>
                </div>
              )}
            </div>
          )}

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
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: '#fff8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
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
