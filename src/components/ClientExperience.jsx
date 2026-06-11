import { useState, useRef } from 'react'
import { Heart, Sparkles, Copy, Check, Gift, Star, Camera, Upload, X, ZoomIn, AlertTriangle, CheckCircle, Circle } from 'lucide-react'
import { clients, samplePhotos } from '../data/sampleData.js'
import { generateWowNote } from '../lib/aiPlaceholders.js'

function daysUntilBirthday(birthdayStr) {
  if (!birthdayStr) return 999
  const today = new Date()
  const bday = new Date(birthdayStr)
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next - today) / 86400000)
}

function formatBirthday(str) {
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

// ─── Wow Notes tab ────────────────────────────────────────────────────────────
function WowNotesTab() {
  const [clientId, setClientId] = useState('')
  const [jobType, setJobType] = useState('residential')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const selectedClient = clients.find(c => c.id === Number(clientId))

  const handleGenerate = async () => {
    if (!selectedClient) return
    setLoading(true)
    setResult(null)
    const res = await generateWowNote(selectedClient, jobType)
    setResult(res.note)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>Generate Thank-You Note</div>

        <div className="form-group">
          <label className="form-label">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">Select a client...</option>
            {clients.filter(c => c.birthday !== null || c.type === 'residential').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Job Type</label>
          <select value={jobType} onChange={e => setJobType(e.target.value)}>
            <option value="residential">Residential Clean</option>
            <option value="commercial">Commercial Clean</option>
            <option value="airbnb">Airbnb Turnover</option>
            <option value="moveout">Move-Out Clean</option>
          </select>
        </div>

        <button
          className="btn btn-primary w-full"
          style={{ justifyContent: 'center' }}
          onClick={handleGenerate}
          disabled={loading || !clientId}
        >
          {loading ? <><span className="spinner" /> Crafting note...</> : <><Sparkles size={14} /> Generate Wow Note</>}
        </button>
      </div>

      <div>
        {!result && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Heart size={28} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
            <p className="text-muted">Pick a client and job type to generate a personalized thank-you that'll make them want to rebook immediately.</p>
          </div>
        )}

        {loading && (
          <div className="card">
            <div className="loading-row"><span className="spinner" /> Writing your note...</div>
          </div>
        )}

        {result && (
          <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex justify-between items-center mb-3">
              <div className="ai-result-label" style={{ margin: 0 }}>
                <Sparkles size={12} /> Wow Note for {selectedClient?.name?.split(' ')[0]}
              </div>
              <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.75,
              fontSize: 14,
              color: 'var(--text-secondary)',
            }}>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Loyalty Tiers tab ────────────────────────────────────────────────────────
function LoyaltyTiersTab() {
  const gold   = clients.filter(c => c.tier === 'gold')
  const silver = clients.filter(c => c.tier === 'silver')
  const bronze = clients.filter(c => c.tier === 'bronze')

  const TierSection = ({ tier, list, desc }) => (
    <div style={{ marginBottom: 28 }}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`badge badge-${tier}`} style={{ fontSize: 13, padding: '4px 12px' }}>
          {tier === 'gold' ? '★ Gold' : tier === 'silver' ? '◆ Silver' : '● Bronze'}
        </span>
        <span className="text-xs text-muted">{desc}</span>
      </div>
      <div className="client-grid">
        {list.map(c => (
          <div key={c.id} className="client-card">
            <div className="client-name">{c.name}</div>
            <div className="client-meta">{c.frequency} · ${c.rate}/visit</div>
            <div className="client-meta mt-1">${c.totalSpend.toLocaleString()} lifetime · {c.jobCount} jobs</div>
            <div style={{ marginTop: 10 }}>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Loyalty score</span>
                <span>{Math.min(100, Math.round(c.jobCount / 50 * 100))}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(c.jobCount / 50 * 100))}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <TierSection tier="gold" list={gold} desc="Weekly or biweekly clients, 12+ months, highest spend" />
      <TierSection tier="silver" list={silver} desc="Regular clients, 6–12 months, growing loyalty" />
      <TierSection tier="bronze" list={bronze} desc="Newer clients, building toward Silver" />
    </div>
  )
}

// ─── Birthdays tab ────────────────────────────────────────────────────────────
function BirthdaysTab() {
  const [generated, setGenerated] = useState({})
  const [loading, setLoading] = useState({})
  const [copied, setCopied] = useState({})

  const withDays = clients
    .filter(c => c.birthday)
    .map(c => ({ ...c, daysUntil: daysUntilBirthday(c.birthday) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const upcoming = withDays.filter(c => c.daysUntil <= 60)
  const later = withDays.filter(c => c.daysUntil > 60)

  const handleGenerate = async (client) => {
    setLoading(l => ({ ...l, [client.id]: true }))
    await new Promise(r => setTimeout(r, 1100))
    const name = client.name.split(' ')[0]
    setGenerated(g => ({
      ...g,
      [client.id]: `Hi ${name}! Wishing you the happiest of birthdays! It's always such a pleasure taking care of your home, and today we want to take care of YOU. As a little birthday gift from us, your next clean is on the house — our treat. Enjoy your special day! 🎉\n\nWith love,\nAshley & the Reno Reset team`,
    }))
    setLoading(l => ({ ...l, [client.id]: false }))
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopied(c => ({ ...c, [id]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [id]: false })), 2000)
  }

  const BirthdayRow = ({ client }) => (
    <div className="card mb-3">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="font-semibold">{client.name}</div>
          <div className="text-xs text-muted">{formatBirthday(client.birthday)} · {client.daysUntil} day{client.daysUntil !== 1 ? 's' : ''} away</div>
        </div>
        <div className="flex gap-2 items-center">
          {client.daysUntil <= 7 && <span className="badge badge-danger">This week!</span>}
          {client.daysUntil > 7 && client.daysUntil <= 14 && <span className="badge badge-warning">Coming up</span>}
          {client.daysUntil > 14 && <span className="badge badge-neutral">{client.daysUntil}d</span>}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleGenerate(client)}
            disabled={loading[client.id]}
          >
            {loading[client.id] ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <><Sparkles size={12} /> Message</>}
          </button>
        </div>
      </div>

      {generated[client.id] && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--gold)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
            whiteSpace: 'pre-wrap',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: 8,
          }}>
            {generated[client.id]}
          </div>
          <button
            className={`copy-btn${copied[client.id] ? ' copied' : ''}`}
            onClick={() => handleCopy(client.id, generated[client.id])}
          >
            {copied[client.id] ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Message</>}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <div className="card-title mb-3" style={{ color: 'var(--gold)' }}>
            <Gift size={14} style={{ display: 'inline', marginRight: 6 }} />
            Upcoming Birthdays (next 60 days)
          </div>
          {upcoming.map(c => <BirthdayRow key={c.id} client={c} />)}
        </>
      )}
      {later.length > 0 && (
        <>
          <div className="card-title mb-3 mt-4">Further Out</div>
          {later.map(c => <BirthdayRow key={c.id} client={c} />)}
        </>
      )}
    </div>
  )
}

// ─── Client Portal tab ─────────────────────────────────────────────────────────
function ClientPortalTab() {
  const [selected, setSelected] = useState('')
  const client = clients.find(c => c.id === Number(selected))

  return (
    <div>
      <div className="form-group mb-4" style={{ maxWidth: 360 }}>
        <label className="form-label">Select Client</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Choose a client to preview their portal...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!client && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Heart size={28} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
          <p className="text-muted">Select a client to preview their unique portal view.</p>
        </div>
      )}

      {client && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Portal preview — simulates what the client would see at their unique link */}
          <div style={{
            background: '#0F0F0F',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            maxWidth: 480,
          }}>
            {/* Portal header */}
            <div style={{ background: '#111', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Client Portal — cleanospro.com/portal/{client.name.split(' ')[0].toLowerCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Hi, {client.name.split(' ')[0]}!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Reno Reset Cleaning Co. · Client since {client.since}
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Next appointment */}
              <div style={{ background: 'var(--gold-muted)', border: '1px solid rgba(200,169,81,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Next Appointment</div>
                <div style={{ fontWeight: 700 }}>
                  {client.frequency === 'weekly' ? 'Next Monday' : client.frequency === 'biweekly' ? 'Next visit in ~2 weeks' : 'Monthly — see calendar'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{client.address}, {client.city}</div>
                <button style={{ marginTop: 10, background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Rebook / Request Change
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Total Cleans', val: client.jobCount },
                  { label: 'Client Since', val: client.since.slice(0, 7) },
                  { label: 'Tier', val: client.tier.charAt(0).toUpperCase() + client.tier.slice(1) },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent job */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>LAST CLEAN</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{client.lastClean} — Standard clean</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{client.address}</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '7px 0', fontSize: 12, cursor: 'pointer' }}>View Photos</button>
                  <button style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 6, padding: '7px 0', fontSize: 12, cursor: 'pointer' }}>Leave a Review</button>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                This is a preview of what {client.name.split(' ')[0]} sees at their private link.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Photos tab ───────────────────────────────────────────────────────────────
const PHOTO_TYPE = {
  after:  { label: 'After',  Icon: CheckCircle,    color: 'var(--success)', bg: 'var(--success-bg)' },
  before: { label: 'Before', Icon: Circle,          color: 'var(--warning)', bg: 'var(--warning-bg)' },
  issue:  { label: 'Issue',  Icon: AlertTriangle,   color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
}

function PhotosTab() {
  const [selectedClientId, setSelectedClientId] = useState('')
  const [photos, setPhotos] = useState(samplePhotos)
  const [lightbox, setLightbox] = useState(null)
  const [addForm, setAddForm] = useState({ type: 'after', caption: '', dataUrl: null, fileName: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const fileRef = useRef()

  const clientPhotos = photos.filter(p => p.clientId === Number(selectedClientId))
  const client = clients.find(c => c.id === Number(selectedClientId))

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAddForm(f => ({ ...f, dataUrl: ev.target.result, fileName: file.name }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!selectedClientId) return
    const newPhoto = {
      id: Date.now(),
      clientId: Number(selectedClientId),
      date: '2026-06-11',
      type: addForm.type,
      caption: addForm.caption || `${PHOTO_TYPE[addForm.type].label} clean photo`,
      addedBy: 'Ashley',
      dataUrl: addForm.dataUrl,
    }
    setPhotos(prev => [newPhoto, ...prev])
    setAddForm({ type: 'after', caption: '', dataUrl: null, fileName: '' })
    setShowAddForm(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id))

  const PhotoCard = ({ photo }) => {
    const cfg = PHOTO_TYPE[photo.type]
    const { Icon } = cfg
    return (
      <div className="photo-card">
        {/* Thumbnail */}
        <div
          className="photo-thumb"
          onClick={() => photo.dataUrl && setLightbox(photo)}
          style={{ cursor: photo.dataUrl ? 'zoom-in' : 'default' }}
        >
          {photo.dataUrl
            ? <img src={photo.dataUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{
                width: '100%', height: '100%', background: cfg.bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon size={22} style={{ color: cfg.color, opacity: 0.7 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo</span>
              </div>
            )
          }
          {/* Type badge */}
          <span className="photo-type-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            <Icon size={9} />
            {cfg.label}
          </span>
          {/* Remove button */}
          <button
            className="photo-remove-btn"
            onClick={e => { e.stopPropagation(); removePhoto(photo.id) }}
            title="Remove"
          >
            <X size={11} />
          </button>
        </div>
        <div className="photo-caption">{photo.caption}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{photo.date} · {photo.addedBy}</div>
      </div>
    )
  }

  const grouped = {
    issue:  clientPhotos.filter(p => p.type === 'issue'),
    before: clientPhotos.filter(p => p.type === 'before'),
    after:  clientPhotos.filter(p => p.type === 'after'),
  }

  return (
    <div>
      {/* Client selector + add button */}
      <div className="flex gap-3 items-center mb-6" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', maxWidth: 360 }}>
          <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setShowAddForm(false) }}>
            <option value="">Select a client to view their photos...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedClientId && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(s => !s)}>
            <Camera size={13} /> {showAddForm ? 'Cancel' : 'Add Photo'}
          </button>
        )}
      </div>

      {/* Add photo form */}
      {showAddForm && (
        <div className="card mb-5" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="card-title" style={{ marginBottom: 14 }}>Add Photo for {client?.name}</div>

          {/* Type selector */}
          <div className="form-group">
            <label className="form-label">Photo Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(PHOTO_TYPE).map(([key, cfg]) => {
                const { Icon } = cfg
                return (
                  <button
                    key={key}
                    onClick={() => setAddForm(f => ({ ...f, type: key }))}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)',
                      border: `1px solid ${addForm.type === key ? cfg.color : 'var(--border)'}`,
                      background: addForm.type === key ? cfg.bg : 'var(--bg-input)',
                      color: addForm.type === key ? cfg.color : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Icon size={13} />{cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* File upload */}
          <div className="form-group">
            <label className="form-label">Photo</label>
            <div
              className="photo-upload-zone"
              onClick={() => fileRef.current?.click()}
            >
              {addForm.dataUrl
                ? <img src={addForm.dataUrl} alt="preview" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }} />
                : (
                  <>
                    <Upload size={22} style={{ color: 'var(--gold)', opacity: 0.5 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to choose a photo from your device</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, HEIC · Before, after, or issue</span>
                  </>
                )
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>

          {/* Caption */}
          <div className="form-group">
            <label className="form-label">Caption / Notes (optional)</label>
            <input
              type="text"
              placeholder={addForm.type === 'issue' ? 'Describe what was found...' : 'e.g. Kitchen counters and stovetop'}
              value={addForm.caption}
              onChange={e => setAddForm(f => ({ ...f, caption: e.target.value }))}
            />
          </div>

          {addForm.type === 'issue' && (
            <div className="alert alert-warning" style={{ marginBottom: 12 }}>
              <AlertTriangle size={13} />
              <span>Issue photos are flagged for both you and the client to see. Good for documenting pre-existing damage.</span>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={!addForm.dataUrl && !addForm.caption}>
              <Camera size={14} /> Save Photo
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowAddForm(false); setAddForm({ type: 'after', caption: '', dataUrl: null, fileName: '' }) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No client selected */}
      {!selectedClientId && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Camera size={30} style={{ color: 'var(--gold)', opacity: 0.25, margin: '0 auto 12px' }} />
          <p className="text-muted">Select a client to view their before/after photos and any issues flagged during service.</p>
        </div>
      )}

      {/* Photo gallery */}
      {selectedClientId && clientPhotos.length === 0 && !showAddForm && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Camera size={28} style={{ color: 'var(--gold)', opacity: 0.25, margin: '0 auto 12px' }} />
          <p className="text-muted">No photos yet for {client?.name}. Add before/after shots after each visit.</p>
          <button className="btn btn-secondary btn-sm mt-3" style={{ margin: '12px auto 0', display: 'flex' }} onClick={() => setShowAddForm(true)}>
            <Camera size={13} /> Add First Photo
          </button>
        </div>
      )}

      {selectedClientId && clientPhotos.length > 0 && (
        <div>
          {/* Issues first — flagged prominently */}
          {grouped.issue.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--danger)' }}>
                  Flagged Issues ({grouped.issue.length})
                </span>
              </div>
              <div className="photo-grid">
                {grouped.issue.map(p => <PhotoCard key={p.id} photo={p} />)}
              </div>
            </div>
          )}

          {/* Before photos */}
          {grouped.before.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="card-title mb-3">Before ({grouped.before.length})</div>
              <div className="photo-grid">
                {grouped.before.map(p => <PhotoCard key={p.id} photo={p} />)}
              </div>
            </div>
          )}

          {/* After photos */}
          {grouped.after.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div className="card-title mb-3">After ({grouped.after.length})</div>
              <div className="photo-grid">
                {grouped.after.map(p => <PhotoCard key={p.id} photo={p} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.dataUrl}
              alt={lightbox.caption}
              style={{ display: 'block', maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '10px 14px', borderRadius: '0 0 10px 10px' }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{lightbox.caption}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{lightbox.date} · {lightbox.addedBy}</div>
            </div>
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: -12, right: -12, width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
const TABS = ['Wow Notes', 'Loyalty Tiers', 'Birthdays', 'Client Portal', 'Photos']

export default function ClientExperience() {
  const [activeTab, setActiveTab] = useState('Wow Notes')

  return (
    <div>
      <div className="page-header">
        <h1>Client Experience</h1>
        <p>Tools that make clients loyal, happy, and talking about you.</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'Wow Notes'      && <WowNotesTab />}
      {activeTab === 'Loyalty Tiers'  && <LoyaltyTiersTab />}
      {activeTab === 'Birthdays'      && <BirthdaysTab />}
      {activeTab === 'Client Portal'  && <ClientPortalTab />}
      {activeTab === 'Photos'         && <PhotosTab />}
    </div>
  )
}
