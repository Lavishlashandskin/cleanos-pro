import { useState } from 'react'
import { Users, Star, Phone } from 'lucide-react'
import { workers, upcomingJobs, clients } from '../data/sampleData.js'

function Stars({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span className="text-gold text-sm">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{rating}</span>
    </span>
  )
}

function getClientName(job) {
  if (job.clientName) return job.clientName
  const c = clients.find(c => c.id === job.clientId)
  return c ? c.name : 'Unknown'
}

export default function WorkerDashboard() {
  const [selectedWorker, setSelectedWorker] = useState(null)

  const workerJobs = (workerId) =>
    upcomingJobs.filter(j => j.workerId === workerId)

  return (
    <div>
      <div className="page-header">
        <h1>Workers</h1>
        <p>Performance, schedules, and stats for your team.</p>
      </div>

      <div className="worker-grid mb-6">
        {workers.map(w => {
          const jobs = workerJobs(w.id)
          const isSelected = selectedWorker === w.id

          return (
            <div
              key={w.id}
              className="worker-card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--gold)' : 'var(--border)',
                transition: 'border-color var(--transition)',
              }}
              onClick={() => setSelectedWorker(isSelected ? null : w.id)}
            >
              <div className="worker-avatar">{w.initials}</div>
              <div className="worker-name">{w.name}</div>
              <Stars rating={w.rating} />

              <div className="worker-stats">
                <div className="wstat">
                  <div className="wstat-val">{w.jobsThisMonth}</div>
                  <div className="wstat-lbl">Jobs this month</div>
                </div>
                <div className="wstat">
                  <div className="wstat-val text-gold">${w.tipsThisMonth}</div>
                  <div className="wstat-lbl">Tips this month</div>
                </div>
                <div className="wstat">
                  <div className="wstat-val">{w.hoursThisMonth}h</div>
                  <div className="wstat-lbl">Hours this month</div>
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

      {selectedWorker && (
        <div className="card" style={{ animation: 'fadeIn 0.2s ease' }}>
          {(() => {
            const w = workers.find(w => w.id === selectedWorker)
            const jobs = workerJobs(selectedWorker)
            return (
              <>
                <div className="card-header">
                  <span className="card-title">{w.name} — Upcoming Jobs</span>
                  <span className="text-xs text-muted">{jobs.length} jobs scheduled</span>
                </div>
                {jobs.length === 0 && <p className="text-muted text-sm">No upcoming jobs assigned.</p>}
                {jobs.map(job => (
                  <div key={job.id} className="job-row">
                    <div className="job-time">{job.time}</div>
                    <div className="job-info">
                      <div className="job-name">{getClientName(job)}</div>
                      <div className="job-detail">{job.address} · {job.duration}h · {job.day} {job.date.slice(5)}</div>
                    </div>
                    <span className={`badge badge-${job.type === 'commercial' ? 'blue' : job.type === 'airbnb' ? 'gold' : 'neutral'}`}>
                      {job.type}
                    </span>
                  </div>
                ))}
              </>
            )
          })()}
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <span className="card-title">Team Summary</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Rating</th>
                <th>Jobs This Month</th>
                <th>Tips This Month</th>
                <th>Total Jobs</th>
                <th>Hours This Month</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td><strong>{w.name}</strong></td>
                  <td><span className="text-gold">{w.rating} ★</span></td>
                  <td>{w.jobsThisMonth}</td>
                  <td><span className="text-gold">${w.tipsThisMonth}</span></td>
                  <td>{w.jobsTotal}</td>
                  <td>{w.hoursThisMonth}h</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
