import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Clock, User, Pencil, Check, ExternalLink } from 'lucide-react'
import { clients, workers } from '../data/sampleData.js'

const TYPE_LABELS = { residential: 'Residential', commercial: 'Commercial', airbnb: 'Airbnb Turnover', moveout: 'Move-Out' }
const TYPE_COLORS = { residential: 'badge-neutral', commercial: 'badge-blue', airbnb: 'badge-gold', moveout: 'badge-warning' }

export default function JobDetailModal({ job, onClose, onSave }) {
  const client = clients.find(c => c.id === job.clientId)
  const worker = workers.find(w => w.id === job.workerId)

  const clientName = job.clientName || client?.name || 'Unknown'
  const address = client ? `${client.address}, ${client.city}` : job.address
  const phone = client?.phone || null
  const notes = client?.notes || null
  const price = client?.rate || null

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    time: job.time,
    workerId: job.workerId,
    customNote: '',
    price: price || '',
  })

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`
  const appleMapsUrl  = `https://maps.apple.com/?q=${encodeURIComponent(address)}`

  const handleSave = () => {
    onSave({ ...job, time: form.time, workerId: form.workerId })
    onClose()
  }

  const workerName = (id) => {
    const w = workers.find(w => w.id === id)
    return w ? w.name : '—'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">{clientName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`badge ${TYPE_COLORS[job.type] || 'badge-neutral'}`}>
                {TYPE_LABELS[job.type] || job.type}
              </span>
              <span className="badge badge-neutral">{job.day} {job.date?.slice(5)}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="divider" style={{ margin: '14px 0' }} />

        {/* Address */}
        <div className="modal-field">
          <MapPin size={14} className="modal-field-icon" />
          <div style={{ flex: 1 }}>
            <div className="modal-field-label">Address</div>
            <div className="modal-field-value">{address}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <a href={appleMapsUrl} target="_blank" rel="noreferrer" className="map-link">
                <ExternalLink size={11} /> Apple Maps
              </a>
              <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="map-link">
                <ExternalLink size={11} /> Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Phone */}
        {phone && (
          <div className="modal-field">
            <Phone size={14} className="modal-field-icon" />
            <div>
              <div className="modal-field-label">Phone</div>
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="modal-field-value" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                {phone}
              </a>
            </div>
          </div>
        )}

        {/* Time & worker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="modal-field">
            <Clock size={14} className="modal-field-icon" />
            <div style={{ flex: 1 }}>
              <div className="modal-field-label">Time</div>
              {editing ? (
                <input
                  type="text"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }}
                />
              ) : (
                <div className="modal-field-value">{job.time} · {job.duration}h</div>
              )}
            </div>
          </div>

          <div className="modal-field">
            <User size={14} className="modal-field-icon" />
            <div style={{ flex: 1 }}>
              <div className="modal-field-label">Worker</div>
              {editing ? (
                <select
                  value={form.workerId}
                  onChange={e => setForm(f => ({ ...f, workerId: Number(e.target.value) }))}
                  style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }}
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              ) : (
                <div className="modal-field-value">{workerName(job.workerId)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="modal-field">
          <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>$</div>
          <div style={{ flex: 1 }}>
            <div className="modal-field-label">Price</div>
            {editing ? (
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }}
              />
            ) : (
              <div className="modal-field-value" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                {price ? `$${price}` : 'Not set'}
              </div>
            )}
          </div>
        </div>

        {/* Client notes */}
        {notes && (
          <div style={{ marginTop: 2 }}>
            <div className="modal-field-label" style={{ marginBottom: 6 }}>Client Notes</div>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              {notes}
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {editing ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                <Check size={13} /> Save Changes
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Pencil size={13} /> Edit Job
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
