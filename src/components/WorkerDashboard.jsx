import { useState } from 'react'
import { Phone, Navigation, CheckCircle, Clock, Loader } from 'lucide-react'
import { workers, upcomingJobs as defaultJobs, clients } from '../data/sampleData.js'

function Stars({ rating, count }) {
  if (!rating) return <span className="text-xs text-muted">No ratings yet</span>
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="text-gold text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span>{'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
        {Number(rating).toFixed(1)}{count !== undefined && ` (${count})`}
      </span>
    </span>
  )
}

function getClientName(job) {
  if (job.clientName) return job.clientName
  const c = clients.find(c => c.id === job.clientId)
  return c ? c.name : 'Unknown'
}

function GPSClockButton({ job, onClockIn, onClockOut }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getLocation = (cb) => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        cb({ lat: pos.coords.latitude, lng: pos.coords.longitude, time })
      },
      (err) => {
        setLoading(false)
        if (err.code === 1) setError('Location permission denied — please allow access in browser settings')
        else setError('Could not get location — try again')
      },
      { timeout: 10000, maximumAge: 0 }
    )
  }

  if (job.status === 'completed') {
    return (
      <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}>
        <CheckCircle size={11} /> Completed
      </span>
    )
  }

  return (
    <div>
      {loading && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Loader size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> Getting location…
        </span>
      )}
      {error && <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 4 }}>{error}</div>}
      {!loading && !job.clockIn && (
        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => getLocation(loc => onClockIn?.(job.id, loc))}>
          <Navigation size={11} /> Clock In
        </button>
      )}
      {!loading && job.clockIn && !job.clockOut && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckCircle size={11} /> In since {job.clockIn.time}
            {job.clockIn.lat && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                ({job.clockIn.lat.toFixed(4)}, {job.clockIn.lng.toFixed(4)})
              </span>
            )}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => getLocation(loc => onClockOut?.(job.id, loc))}>
            <Clock size={11} /> Clock Out
          </button>
        </div>
      )}
      {job.clockIn && job.clockOut && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <CheckCircle size={11} style={{ color: 'var(--success)' }} />
          {job.clockIn.time} → {job.clockOut.time}
        </span>
      )}
    </div>
  )
}

export default function WorkerDashboard({ jobs = defaultJobs, onClockIn, onClockOut }) {
  const [selectedWorker, setSelectedWorker] = useState(null)

  // Compute per-worker ratings from actual job data
  const ratingsByWorker = {}
  jobs.forEach(j => {
    if (j.clientRating && j.workerId) {
      if (!ratingsByWorker[j.workerId]) ratingsByWorker[j.workerId] = { sum: 0, count: 0 }
      ratingsByWorker[j.workerId].sum += j.clientRating
      ratingsByWorker[j.workerId].count++
    }
  })

  const workerJobs = (workerId) => jobs.filter(j => j.workerId === workerId)

  return (
    <div>
      <div className="page-header">
        <h1>Workers</h1>
        <p>Performance, GPS clock-ins, client ratings, and team overview.</p>
      </div>

      <div className="worker-grid mb-6">
        {workers.map(w => {
          const wJobs    = workerJobs(w.id)
          const rd       = ratingsByWorker[w.id]
          const avg      = rd ? (rd.sum / rd.count) : w.rating
          const rCount   = rd ? rd.count : null
          const active   = wJobs.filter(j => j.clockIn && !j.clockOut).length
          const isSelected = selectedWorker === w.id

          return (
            <div
              key={w.id}
              className="worker-card"
              style={{ cursor: 'pointer', borderColor: isSelected ? 'var(--gold)' : 'var(--border)', transition: 'border-color var(--transition)' }}
              onClick={() => setSelectedWorker(isSelected ? null : w.id)}
            >
              <div className="worker-avatar">{w.initials}</div>
              <div className="worker-name">{w.name}</div>
              <Stars rating={avg} count={rCount} />

              {active > 0 && (
                <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Navigation size={11} /> {active} job in progress
                </div>
              )}

              <div className="worker-stats">
                <div className="wstat">
                  <div className="wstat-val">{w.jobsThisMonth}</div>
                  <div className="wstat-lbl">Jobs / month</div>
                </div>
                <div className="wstat">
                  <div className="wstat-val text-gold">${w.tipsThisMonth}</div>
                  <div className="wstat-lbl">Tips / month</div>
                </div>
                <div className="wstat">
                  <div className="wstat-val">{w.hoursThisMonth}h</div>
                  <div className="wstat-lbl">Hours / month</div>
                </div>
                <div className="wstat">
                  <div className="wstat-val">{w.jobsTotal}</div>
                  <div className="wstat-lbl">Total jobs</div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div className="flex gap-2 items-center">
                  <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs text-muted">{w.phone}</span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs text-muted">Hired {w.hireDate}</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Active</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded worker job list + GPS controls */}
      {selectedWorker && (() => {
        const w = workers.find(w => w.id === selectedWorker)
        const wJobs = workerJobs(selectedWorker)
        return (
          <div className="card mb-4" style={{ animation: 'fadeIn 0.2s ease' }}>
            <div className="card-header">
              <span className="card-title">{w.name} — Jobs & Clock Status</span>
              <span className="text-xs text-muted">{wJobs.length} jobs</span>
            </div>
            {wJobs.length === 0 && <p className="text-muted text-sm">No jobs assigned.</p>}
            {wJobs.map(job => (
              <div key={job.id} className="job-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <div className="job-time">{job.time}</div>
                  <div className="job-info" style={{ flex: 1 }}>
                    <div className="job-name">{getClientName(job)}</div>
                    <div className="job-detail">{job.address} · {job.duration}h · {job.day} {job.date.slice(5)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                    <span className={`badge badge-${job.type === 'commercial' ? 'blue' : job.type === 'airbnb' ? 'gold' : 'neutral'}`}>
                      {job.type}
                    </span>
                    {job.clientRating && (
                      <span style={{ fontSize: 11, color: 'var(--gold)' }}>{'★'.repeat(job.clientRating)} {job.clientRating}.0</span>
                    )}
                  </div>
                </div>
                <div style={{ paddingLeft: 52 }}>
                  <GPSClockButton job={job} onClockIn={onClockIn} onClockOut={onClockOut} />
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Team summary table */}
      <div className="card mt-4">
        <div className="card-header"><span className="card-title">Team Summary</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Rating</th>
                <th>Jobs This Month</th>
                <th>Tips This Month</th>
                <th>Total Jobs</th>
                <th>Hours / Month</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => {
                const rd  = ratingsByWorker[w.id]
                const avg = rd ? (rd.sum / rd.count).toFixed(1) : w.rating
                return (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong></td>
                    <td><span className="text-gold">{avg} ★{rd && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> ({rd.count})</span>}</span></td>
                    <td>{w.jobsThisMonth}</td>
                    <td><span className="text-gold">${w.tipsThisMonth}</span></td>
                    <td>{w.jobsTotal}</td>
                    <td>{w.hoursThisMonth}h</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
