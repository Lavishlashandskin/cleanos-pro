import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Phone, Clock, User, Pencil, Check, ExternalLink, CheckSquare, Square, Camera, Star, Navigation, CheckCircle } from 'lucide-react'
import { clients, workers } from '../data/sampleData.js'
import { getStoredProfile } from '../context/ProfileContext.jsx'

const TYPE_LABELS = { residential: 'Residential', commercial: 'Commercial', airbnb: 'Airbnb Turnover', moveout: 'Move-Out' }
const TYPE_COLORS = { residential: 'badge-neutral', commercial: 'badge-blue', airbnb: 'badge-gold', moveout: 'badge-warning' }

const CHECKLIST = {
  residential: [
    'All rooms dusted and surfaces wiped',
    'Bathrooms sanitized — sink, toilet, tub/shower',
    'Kitchen counters, stovetop, and sink cleaned',
    'Floors vacuumed and mopped (hard surfaces)',
    'Trash emptied and bags replaced',
    'Client notes reviewed and addressed',
  ],
  commercial: [
    'All surfaces dusted and sanitized',
    'Restrooms cleaned and supplies restocked',
    'Floors swept, vacuumed, and mopped',
    'Trash emptied throughout',
    'Entry and common areas presentable',
    'Lock-up procedure followed',
  ],
  airbnb: [
    'All linens changed and beds made fresh',
    'Bathrooms fully sanitized',
    'Kitchen cleaned — dishes, appliances, counters',
    'Floors vacuumed and mopped',
    'Welcome supplies restocked',
    'Before/after photos taken',
  ],
  moveout: [
    'All rooms cleaned top to bottom',
    'Appliances cleaned inside and out',
    'Bathrooms deep cleaned',
    'Floors vacuumed/mopped, carpets spot-treated',
    'Window tracks and baseboards wiped',
    'Before/after photos taken',
  ],
}

export default function JobDetailModal({ job, onClose, onSave, onCompleteJob, onRequestRating }) {
  const client = clients.find(c => c.id === job.clientId)
  const worker = workers.find(w => w.id === job.workerId)

  const clientName = job.clientName || client?.name || 'Unknown'
  const address    = client ? `${client.address}, ${client.city}` : job.address
  const phone      = client?.phone || null
  const notes      = client?.notes || null
  const price      = client?.rate  || null

  const [editing, setEditing]             = useState(false)
  const [form, setForm]                   = useState({ time: job.time, workerId: job.workerId, price: price || '' })
  const [showChecklist, setShowChecklist] = useState(false)
  const [checked, setChecked]             = useState({})
  const [photoCount, setPhotoCount]       = useState(0)
  const [localDone, setLocalDone]         = useState(false)
  const fileRef                           = useRef(null)

  const items    = CHECKLIST[job.type] || CHECKLIST.residential
  const allDone  = items.every((_, i) => checked[i])
  const isComplete = job.status === 'completed' || localDone

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleSave = () => {
    onSave({ ...job, time: form.time, workerId: form.workerId })
    onClose()
  }

  const handleComplete = () => {
    onCompleteJob?.(job.id, {
      checklist: items.map((label, i) => ({ label, checked: !!checked[i] })),
      photoCount,
      completedAt: new Date().toISOString(),
    })
    setShowChecklist(false)
    setLocalDone(true)
  }

  const handleRequestRating = () => {
    const email = client?.email || ''
    const first = clientName.split(' ')[0]
    const p     = getStoredProfile()
    const biz   = p.businessName || 'our team'
    const portalUrl = p.website ? `${p.website}/portal` : `${window.location.origin}/portal`
    const body  = `Hi ${first}!\n\nThank you for trusting ${biz}. We hope your space looks amazing!\n\nWe'd love to hear how we did — a quick star rating takes less than 30 seconds.\n\nLog in to your client portal at ${portalUrl} and leave a rating under "My Info."\n\nThank you!\n— ${p.ownerName ? `${p.ownerName} & the ` : ''}${biz}`
    window.open(`mailto:${email}?subject=${encodeURIComponent('How did your clean go? Quick rating appreciated!')}&body=${encodeURIComponent(body)}`)
    onRequestRating?.(job.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">{clientName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`badge ${TYPE_COLORS[job.type] || 'badge-neutral'}`}>{TYPE_LABELS[job.type] || job.type}</span>
              <span className="badge badge-neutral">{job.day} {job.date?.slice(5)}</span>
              {isComplete && <span className="badge badge-success"><Check size={10} /> Completed</span>}
              {job.clockIn && !job.clockOut && !isComplete && <span className="badge badge-blue"><Navigation size={10} /> In Progress</span>}
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
              <a href={`https://maps.apple.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="map-link">
                <ExternalLink size={11} /> Apple Maps
              </a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="map-link">
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
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="modal-field-value" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{phone}</a>
            </div>
          </div>
        )}

        {/* Time & Worker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="modal-field">
            <Clock size={14} className="modal-field-icon" />
            <div style={{ flex: 1 }}>
              <div className="modal-field-label">Time</div>
              {editing
                ? <input type="text" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }} />
                : <div className="modal-field-value">{job.time} · {job.duration}h</div>}
            </div>
          </div>
          <div className="modal-field">
            <User size={14} className="modal-field-icon" />
            <div style={{ flex: 1 }}>
              <div className="modal-field-label">Worker</div>
              {editing
                ? <select value={form.workerId} onChange={e => setForm(f => ({ ...f, workerId: Number(e.target.value) }))} style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }}>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                : <div className="modal-field-value">{worker?.name || '—'}</div>}
            </div>
          </div>
        </div>

        {/* GPS Clock Record */}
        {(job.clockIn || job.clockOut) && (
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', marginTop: 4 }}>
            <div className="modal-field-label" style={{ marginBottom: 6 }}>GPS Clock Record</div>
            {job.clockIn && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--success)', fontSize: 12, marginBottom: 3 }}>
                <Navigation size={11} /> Clocked in: {job.clockIn.time}
                {job.clockIn.lat && <span style={{ color: 'var(--text-muted)' }}>· {job.clockIn.lat.toFixed(4)}, {job.clockIn.lng.toFixed(4)}</span>}
              </div>
            )}
            {job.clockOut && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <Check size={11} /> Clocked out: {job.clockOut.time}
                {job.clockOut.lat && <span>· {job.clockOut.lat.toFixed(4)}, {job.clockOut.lng.toFixed(4)}</span>}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="modal-field" style={{ marginTop: 4 }}>
          <div style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>$</div>
          <div style={{ flex: 1 }}>
            <div className="modal-field-label">Price</div>
            {editing
              ? <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ marginTop: 4, padding: '6px 10px', fontSize: 13 }} />
              : <div className="modal-field-value" style={{ color: 'var(--gold)', fontWeight: 700 }}>{price ? `$${price}` : 'Not set'}</div>}
          </div>
        </div>

        {/* Client rating */}
        {job.clientRating && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <Star size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{'★'.repeat(job.clientRating)} {job.clientRating}.0</span>
            {job.ratingNote && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>"{job.ratingNote}"</span>}
          </div>
        )}

        {/* Client notes */}
        {notes && (
          <div style={{ marginTop: 8 }}>
            <div className="modal-field-label" style={{ marginBottom: 6 }}>Client Notes</div>
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {notes}
            </div>
          </div>
        )}

        {/* Completion checklist (inline) */}
        {showChecklist && (
          <div style={{ marginTop: 16, background: 'var(--bg-input)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckSquare size={15} style={{ color: 'var(--gold)' }} /> Completion Checklist
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13, userSelect: 'none' }}
              >
                {checked[i]
                  ? <CheckSquare size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  : <Square      size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                <span style={{ color: checked[i] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: checked[i] ? 'line-through' : 'none' }}>
                  {item}
                </span>
              </div>
            ))}

            {/* Photo attach */}
            <div style={{ marginTop: 12 }}>
              <input
                type="file" ref={fileRef} accept="image/*" multiple
                style={{ display: 'none' }}
                onChange={e => setPhotoCount(e.target.files.length)}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                <Camera size={13} />
                {photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} attached` : 'Attach Photos (optional)'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" disabled={!allDone} onClick={handleComplete}>
                <CheckCircle size={13} /> Complete Job
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowChecklist(false)}>Cancel</button>
              {!allDone && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {items.filter((_, i) => !checked[i]).length} item{items.filter((_, i) => !checked[i]).length !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {editing ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleSave}><Check size={13} /> Save Changes</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Pencil size={13} /> Edit</button>
              {!isComplete && !showChecklist && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowChecklist(true)}>
                  <CheckSquare size={13} /> Mark Complete
                </button>
              )}
              {isComplete && (
                <button className="btn btn-secondary btn-sm" onClick={handleRequestRating}>
                  <Star size={13} /> Request Rating
                </button>
              )}
              {isComplete && (
                <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3, alignSelf: 'center' }}>
                  <CheckCircle size={11} /> Job completed
                </span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
