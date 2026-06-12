import { useState } from 'react'
import { CalendarDays, Sparkles, MapPin, Clock, User, CalendarPlus, Map, Lightbulb, ChevronRight, RefreshCw, Plus, Trash2, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { clients, workers, recurringTemplates as defaultTemplates } from '../data/sampleData.js'
import { optimizeSchedule, suggestBookingDay } from '../lib/aiPlaceholders.js'
import { NEIGHBORHOODS, getJobNeighborhood, groupJobsByNeighborhood } from '../lib/neighborhoods.js'

const TYPE_COLORS = { residential: 'badge-neutral', commercial: 'badge-blue', airbnb: 'badge-gold', moveout: 'badge-warning' }
const TYPE_LABELS = { residential: 'Residential', commercial: 'Commercial', airbnb: 'Airbnb', moveout: 'Move-Out' }
const FREQ_LABELS = { weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL = { Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday' }
const WEEK_DAYS   = ['Thu Jun 11', 'Fri Jun 12', 'Sat Jun 13', 'Mon Jun 15', 'Tue Jun 16', 'Wed Jun 17']
const WEEK_ABBREVS = ['Thu', 'Fri', 'Sat', 'Mon', 'Tue', 'Wed']
const DAY_MAP = {
  'Thu Jun 11': '2026-06-11', 'Fri Jun 12': '2026-06-12', 'Sat Jun 13': '2026-06-13',
  'Mon Jun 15': '2026-06-15', 'Tue Jun 16': '2026-06-16', 'Wed Jun 17': '2026-06-17',
}

function getClientName(job) {
  if (job.clientName) return job.clientName
  const c = clients.find(c => c.id === job.clientId)
  return c ? c.name : 'Unknown'
}
function getWorkerName(workerId) {
  const w = workers.find(w => w.id === workerId)
  return w ? w.name : '—'
}
function getClientNameById(clientId) {
  const c = clients.find(c => c.id === clientId)
  return c ? c.name : '—'
}

// ── Job row shared component ──────────────────────────────────────────────────
function JobRow({ job, onJobClick, showNeighborhoodLabel = false }) {
  const neighborhood = getJobNeighborhood(job, clients)
  return (
    <div
      className="job-row clickable"
      style={{ borderLeft: `3px solid ${neighborhood?.color || 'var(--border)'}` }}
      onClick={() => onJobClick?.(job)}
    >
      <div className="job-time">{job.time}</div>
      <div className="job-info">
        <div className="job-name">{getClientName(job)}</div>
        <div className="job-detail">
          <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
          {job.address}
          <span style={{ margin: '0 5px', opacity: 0.35 }}>·</span>
          <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
          {job.duration}h
          {showNeighborhoodLabel && neighborhood && (
            <span style={{ marginLeft: 5, color: neighborhood.color, fontWeight: 600 }}>
              · {neighborhood.label}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span className={`badge ${TYPE_COLORS[job.type]}`}>{TYPE_LABELS[job.type]}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <User size={10} />{getWorkerName(job.workerId)}
        </span>
      </div>
    </div>
  )
}

// ── Schedule tab ──────────────────────────────────────────────────────────────
function ScheduleTab({ jobs, onJobClick }) {
  const [selectedDay, setSelectedDay] = useState('Thu Jun 11')
  const [optimizing, setOptimizing] = useState(false)
  const [optimizeResult, setOptimizeResult] = useState(null)

  const dateStr  = DAY_MAP[selectedDay]
  const dayJobs  = jobs.filter(j => j.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
  const totalHrs = dayJobs.reduce((s, j) => s + j.duration, 0)

  const handleOptimize = async () => {
    if (dayJobs.length < 2) return
    setOptimizing(true)
    setOptimizeResult(null)
    const res = await optimizeSchedule(dayJobs)
    setOptimizeResult(res)
    setOptimizing(false)
  }

  return (
    <div className="two-col-wide">
      <div>
        <div className="card mb-4">
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {WEEK_DAYS.map(day => {
              const count = jobs.filter(j => j.date === DAY_MAP[day]).length
              const isActive = selectedDay === day
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setOptimizeResult(null) }}
                  style={{
                    flex: '1 1 auto', minWidth: 88, padding: '10px 8px',
                    borderRadius: 'var(--radius)',
                    background: isActive ? 'var(--gold-muted)' : 'var(--bg-input)',
                    border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                    color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {day}
                  <div style={{ fontSize: 10, marginTop: 2, color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {count > 0 ? `${count} job${count !== 1 ? 's' : ''}` : 'Open'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="card-title">{selectedDay}</span>
              <div className="text-xs text-muted mt-1">{dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''} · {totalHrs}h</div>
            </div>
            {dayJobs.length >= 2 && (
              <button className="btn btn-secondary btn-sm" onClick={handleOptimize} disabled={optimizing}>
                {optimizing
                  ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Optimizing...</>
                  : <><Sparkles size={13} /> Optimize Route</>}
              </button>
            )}
          </div>

          {dayJobs.length === 0 && (
            <div className="empty-state"><CalendarDays size={28} style={{ margin: '0 auto' }} /><p>No jobs scheduled.</p></div>
          )}
          {dayJobs.map(job => <JobRow key={job.id} job={job} onJobClick={onJobClick} showNeighborhoodLabel />)}

          {optimizeResult && (
            <div className="alert alert-success mt-3" style={{ marginBottom: 0 }}>
              <Sparkles size={14} />
              <div>
                <strong>Route optimized!</strong> {optimizeResult.message}
                <div style={{ marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>Saves {optimizeResult.savings.miles} miles</span>
                  <span>{optimizeResult.savings.time}</span>
                  <span>{optimizeResult.savings.fuelCost} in fuel</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Week Overview — Jun 11–17</div>
          {WEEK_DAYS.map(day => {
            const count = jobs.filter(j => j.date === DAY_MAP[day]).length
            const hrs   = jobs.filter(j => j.date === DAY_MAP[day]).reduce((s, j) => s + j.duration, 0)
            return (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{day}</span>
                <span style={{ color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {count > 0 ? `${count} job${count !== 1 ? 's' : ''} · ${hrs}h` : 'Open'}
                </span>
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700 }}>
            <span>Total</span>
            <span className="text-gold">{jobs.length} jobs · {jobs.reduce((s, j) => s + j.duration, 0)}h</span>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-title" style={{ marginBottom: 12 }}>Workers This Week</div>
          {workers.map(w => {
            const wJobs = jobs.filter(j => j.workerId === w.id)
            return (
              <div key={w.id} style={{ marginBottom: 12 }}>
                <div className="flex justify-between text-sm" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{w.name}</span>
                  <span className="text-gold">{wJobs.length} jobs</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(wJobs.length / 5) * 100}%` }} />
                </div>
                <div className="text-xs text-muted mt-1">{wJobs.reduce((s, j) => s + j.duration, 0)}h scheduled</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Neighborhoods tab ─────────────────────────────────────────────────────────
function NeighborhoodsTab({ jobs, onJobClick }) {
  const groups = groupJobsByNeighborhood(jobs, clients)
  const activeNeighborhoods = NEIGHBORHOODS.filter(n => groups[n.id])

  return (
    <div>
      <div className="card mb-4">
        <div className="card-title" style={{ marginBottom: 12 }}>Neighborhood Legend</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {NEIGHBORHOODS.map(n => {
            const group = groups[n.id]
            return (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 20, opacity: group ? 1 : 0.38 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: n.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: group ? 'var(--text-primary)' : 'var(--text-muted)' }}>{n.label}</span>
                {group && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.jobs.length}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-title" style={{ marginBottom: 14 }}>Route Density — This Week</div>
        <p className="text-xs text-muted" style={{ marginBottom: 14 }}>Each dot = a job in that neighborhood on that day.</p>
        <div className="density-grid">
          <div className="density-label-cell" style={{ background: 'var(--bg-input)', borderRight: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)' }}>Area</span>
          </div>
          {WEEK_ABBREVS.map(day => <div key={day} className="density-header-cell">{day}</div>)}
          {NEIGHBORHOODS.map(n => {
            const group = groups[n.id]
            return (
              <div key={n.id} className="density-row-wrapper">
                <div className="density-label-cell">
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: n.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{n.label}</span>
                </div>
                {WEEK_ABBREVS.map(abbrev => {
                  if (!group) return <div key={abbrev} className="density-data-cell" />
                  const dayJobs = group.jobs.filter(j => j.day === abbrev)
                  return (
                    <div key={abbrev} className="density-data-cell">
                      {dayJobs.map((job, i) => (
                        <span key={i} className="density-dot" title={`${getClientName(job)} · ${job.time}`}
                          style={{ background: n.color, display: 'inline-block', width: 10, height: 10, borderRadius: '50%', margin: '0 1px', cursor: 'default' }} />
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="card-title mb-4" style={{ paddingLeft: 2 }}>Jobs Grouped by Neighborhood</div>
        {activeNeighborhoods.map(n => {
          const group = groups[n.id]
          return (
            <div key={n.id} className="card mb-4" style={{ borderLeft: `3px solid ${n.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: n.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{n.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[...group.days].map(day => (
                    <span key={day} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${n.color}22`, color: n.color, border: `1px solid ${n.color}44` }}>
                      {DAY_FULL[day] || day}
                    </span>
                  ))}
                </div>
              </div>
              {group.jobs.map(job => <JobRow key={job.id} job={job} onJobClick={onJobClick} />)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Smart Booking tab ─────────────────────────────────────────────────────────
function SmartBookingTab({ jobs }) {
  const groups = groupJobsByNeighborhood(jobs, clients)
  const [form, setForm] = useState({ clientName: '', address: '', neighborhoodId: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFind = async () => {
    if (!form.neighborhoodId) return
    setLoading(true); setResult(null)
    const neighborhood = NEIGHBORHOODS.find(n => n.id === form.neighborhoodId)
    const group = groups[form.neighborhoodId]
    const matchingDays = []; const dayJobSummaries = {}
    if (group) {
      for (const abbrev of WEEK_ABBREVS) {
        const dayJobsList = group.jobs.filter(j => j.day === abbrev)
        if (dayJobsList.length) {
          matchingDays.push(abbrev)
          dayJobSummaries[abbrev] = dayJobsList.map(j => {
            const c = clients.find(c => c.id === j.clientId)
            return `${c ? c.name.split(' ')[0] : j.clientName?.split(' ')[0] || 'client'} at ${j.time}`
          }).join(', ')
        }
      }
    }
    const res = await suggestBookingDay({ clientName: form.clientName, neighborhoodLabel: neighborhood?.label, matchingDays, dayJobSummaries })
    setResult({ ...res, neighborhood, matchingDays, dayJobSummaries })
    setLoading(false)
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>New Client Details</div>
        <p className="text-xs text-muted" style={{ marginBottom: 20 }}>Enter the new client's neighborhood and we'll suggest which day to schedule based on your existing route.</p>
        <div className="form-group">
          <label className="form-label">Client Name (optional)</label>
          <input type="text" placeholder="e.g. Sarah Johnson" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Street Address (optional)</label>
          <input type="text" placeholder="e.g. 8840 Autumn Hills Dr" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Neighborhood / Area <span style={{ color: 'var(--danger)' }}>*</span></label>
          <select value={form.neighborhoodId} onChange={e => { setForm(f => ({ ...f, neighborhoodId: e.target.value })); setResult(null) }}>
            <option value="">— Select area —</option>
            {NEIGHBORHOODS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          {form.neighborhoodId && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: NEIGHBORHOODS.find(n => n.id === form.neighborhoodId)?.color, display: 'inline-block' }} />
              <span className="text-xs text-muted">
                {groups[form.neighborhoodId]
                  ? `${groups[form.neighborhoodId].jobs.length} existing job${groups[form.neighborhoodId].jobs.length !== 1 ? 's' : ''} in this area`
                  : 'No existing jobs in this area this week'}
              </span>
            </div>
          )}
        </div>
        <button className="btn btn-primary w-full mt-2" style={{ justifyContent: 'center' }} onClick={handleFind} disabled={loading || !form.neighborhoodId}>
          {loading ? <><span className="spinner" /> Analyzing...</> : <><Lightbulb size={15} /> Find Best Day</>}
        </button>
        <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
          <Lightbulb size={13} />
          <span>Stacking clients by area reduces drive time and lets you take on more jobs.</span>
        </div>
      </div>

      <div>
        {!result && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Map size={32} style={{ color: 'var(--gold)', opacity: 0.25, margin: '0 auto 12px' }} />
            <p className="text-muted">Select a neighborhood and click "Find Best Day."</p>
          </div>
        )}
        {loading && <div className="card"><div className="loading-row"><span className="spinner" /> Analyzing your week…</div></div>}
        {result && (
          <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: result.neighborhood?.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{result.neighborhood?.label}</span>
              {result.suggested && (
                <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, background: `${result.neighborhood?.color}22`, color: result.neighborhood?.color, border: `1px solid ${result.neighborhood?.color}44` }}>
                  Recommend {DAY_FULL[result.suggested] || result.suggested}
                </span>
              )}
            </div>
            <div className="booking-suggestion">
              <div style={{ display: 'flex', gap: 10 }}>
                <Lightbulb size={16} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{result.text}</p>
              </div>
            </div>
            {result.matchingDays.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="card-title" style={{ marginBottom: 10 }}>Already in {result.neighborhood?.label} this week</div>
                {result.matchingDays.map(day => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${result.neighborhood?.color}22`, color: result.neighborhood?.color, border: `1px solid ${result.neighborhood?.color}44`, whiteSpace: 'nowrap' }}>
                      {DAY_FULL[day] || day}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{result.dayJobSummaries[day]}</span>
                    {day === result.suggested && <ChevronRight size={13} style={{ marginLeft: 'auto', color: result.neighborhood?.color }} />}
                  </div>
                ))}
              </div>
            )}
            {result.savings && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{result.savings.miles}</div>
                  <div className="text-xs text-muted mt-1">Est. miles saved</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{result.savings.fuel}</div>
                  <div className="text-xs text-muted mt-1">Est. fuel saved</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Recurring Jobs tab ────────────────────────────────────────────────────────
function RecurringTab() {
  const [templates, setTemplates] = useState(defaultTemplates)
  const [showForm, setShowForm] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [form, setForm] = useState({
    clientId: '', workerId: 1, dayOfWeek: 'Mon', time: '9:00 AM',
    duration: 2.5, type: 'residential', frequency: 'biweekly',
  })

  const toggle = (id) => setTemplates(t => t.map(r => r.id === id ? { ...r, active: !r.active } : r))
  const remove = (id) => setTemplates(t => t.filter(r => r.id !== id))

  const addTemplate = () => {
    const client = clients.find(c => c.id === Number(form.clientId))
    if (!client) return
    const newT = {
      id: Date.now(),
      clientId: Number(form.clientId),
      workerId: Number(form.workerId),
      dayOfWeek: form.dayOfWeek,
      time: form.time,
      duration: Number(form.duration),
      type: form.type,
      address: client.address,
      frequency: form.frequency,
      active: true,
    }
    setTemplates(t => [...t, newT])
    setShowForm(false)
    setForm({ clientId: '', workerId: 1, dayOfWeek: 'Mon', time: '9:00 AM', duration: 2.5, type: 'residential', frequency: 'biweekly' })
  }

  const generateJobs = () => {
    const active = templates.filter(t => t.active)
    const jobs = []
    const baseDate = new Date('2026-06-15')
    active.forEach(t => {
      const weeks = t.frequency === 'weekly' ? [0, 1, 2, 3] : t.frequency === 'biweekly' ? [0, 2] : [0]
      weeks.forEach(weekOffset => {
        const clientName = t.clientName || getClientNameById(t.clientId)
        const dayOffset = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(t.dayOfWeek)
        const d = new Date(baseDate)
        d.setDate(d.getDate() + dayOffset + weekOffset * 7)
        jobs.push({
          id: `r-${t.id}-${weekOffset}`,
          clientName,
          address: t.address,
          time: t.time,
          duration: t.duration,
          type: t.type,
          workerId: t.workerId,
          day: t.dayOfWeek,
          date: d.toISOString().slice(0, 10),
          recurring: true,
          frequency: t.frequency,
        })
      })
    })
    setGenerated(jobs)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Recurring Job Templates</div>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>{templates.filter(t => t.active).length} active · auto-populate your schedule</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={generateJobs}>
            <RefreshCw size={13} /> Generate 4 Weeks
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
            <Plus size={13} /> Add Template
          </button>
        </div>
      </div>

      {/* Add template form */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--gold)' }}>
          <div className="card-title" style={{ marginBottom: 14 }}>New Recurring Template</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client</label>
              <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
                <option value="">— Select client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Worker</label>
              <select value={form.workerId} onChange={e => setForm(f => ({ ...f, workerId: e.target.value }))}>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="text" placeholder="9:00 AM" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (hrs)</label>
              <input type="number" step="0.5" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="airbnb">Airbnb</option>
                <option value="moveout">Move-Out</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary btn-sm" disabled={!form.clientId} onClick={addTemplate}><Check size={13} /> Add Template</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Template list */}
      {templates.map(t => (
        <div key={t.id} className="card mb-3" style={{ opacity: t.active ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{t.clientName || getClientNameById(t.clientId)}</div>
              <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                Every {FREQ_LABELS[t.frequency]} · {t.dayOfWeek}s at {t.time} · {t.duration}h · {getWorkerName(t.workerId)}
              </div>
              <div className="text-xs text-muted">{t.address}</div>
            </div>
            <span className={`badge ${TYPE_COLORS[t.type] || 'badge-neutral'}`}>{TYPE_LABELS[t.type]}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {FREQ_LABELS[t.frequency]}
            </span>
            <button
              onClick={() => toggle(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.active ? 'var(--gold)' : 'var(--text-muted)', padding: 0 }}
              title={t.active ? 'Pause template' : 'Activate template'}
            >
              {t.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            </button>
            <button
              onClick={() => remove(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              title="Delete template"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <RefreshCw size={28} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
          <p className="text-muted">No recurring templates yet. Click "Add Template" to get started.</p>
        </div>
      )}

      {/* Generated preview */}
      {generated && (
        <div className="card mt-4" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="card-header">
            <span className="card-title">Generated Jobs — Next 4 Weeks</span>
            <span className="text-xs text-muted">{generated.length} jobs</span>
          </div>
          <p className="text-xs text-muted mb-3">Preview only — these jobs would be added to your schedule when you confirm.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Client</th><th>Date</th><th>Time</th><th>Type</th><th>Worker</th><th>Frequency</th></tr>
              </thead>
              <tbody>
                {generated.sort((a, b) => a.date.localeCompare(b.date)).map(j => (
                  <tr key={j.id}>
                    <td><strong>{j.clientName}</strong></td>
                    <td>{j.day} {j.date.slice(5)}</td>
                    <td>{j.time}</td>
                    <td><span className={`badge ${TYPE_COLORS[j.type] || 'badge-neutral'}`}>{TYPE_LABELS[j.type]}</span></td>
                    <td>{getWorkerName(j.workerId)}</td>
                    <td><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{FREQ_LABELS[j.frequency]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary btn-sm"><Check size={13} /> Confirm & Add to Schedule</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setGenerated(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ScheduleOptimizer({ jobs = [], onJobClick }) {
  const [tab, setTab] = useState('schedule')

  return (
    <div>
      <div className="page-header">
        <h1>Smart Schedule <span className="text-gold">— Week View</span></h1>
        <p>Route-aware scheduling, recurring templates, and smart booking suggestions.</p>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'schedule' ? ' active' : ''}`} onClick={() => setTab('schedule')}>
          <CalendarDays size={13} style={{ display: 'inline', marginRight: 5 }} />Schedule
        </button>
        <button className={`tab${tab === 'neighborhoods' ? ' active' : ''}`} onClick={() => setTab('neighborhoods')}>
          <Map size={13} style={{ display: 'inline', marginRight: 5 }} />Neighborhoods
        </button>
        <button className={`tab${tab === 'recurring' ? ' active' : ''}`} onClick={() => setTab('recurring')}>
          <RefreshCw size={13} style={{ display: 'inline', marginRight: 5 }} />Recurring
        </button>
        <button className={`tab${tab === 'booking' ? ' active' : ''}`} onClick={() => setTab('booking')}>
          <CalendarPlus size={13} style={{ display: 'inline', marginRight: 5 }} />Smart Booking
        </button>
      </div>

      {tab === 'schedule'      && <ScheduleTab      jobs={jobs} onJobClick={onJobClick} />}
      {tab === 'neighborhoods' && <NeighborhoodsTab jobs={jobs} onJobClick={onJobClick} />}
      {tab === 'recurring'     && <RecurringTab />}
      {tab === 'booking'       && <SmartBookingTab  jobs={jobs} />}
    </div>
  )
}
