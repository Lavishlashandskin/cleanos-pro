import { useState } from 'react'
import {
  LogOut, MapPin, Clock, Camera, DollarSign, Star, Phone, Mail,
  CheckCircle2, AlertCircle, ChevronLeft, Upload, Home, Image, Receipt, User,
} from 'lucide-react'
import {
  clients, upcomingJobs, samplePhotos, sampleInvoices, clientPaymentSettings,
} from '../data/sampleData.js'

const DEMO_PASSWORD = 'clean123'

// portal always uses its own hardcoded light palette — ignores admin theme
const P = {
  bg:        '#F4EEE4',
  card:      '#FFFFFF',
  cardAlt:   '#FAF7F3',
  border:    '#E6DDD0',
  gold:      '#A8894E',
  goldLight: '#F5EDD8',
  goldBorder:'#D4B86A',
  text:      '#3D2B1A',
  sub:       '#6E5C47',
  muted:     '#9B887A',
  success:   '#4A7A4D',
  successBg: '#EBF5EC',
  danger:    '#A04040',
  dangerBg:  '#FAEAEA',
  warning:   '#9A7020',
  warningBg: '#FFF8EE',
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '18px 20px', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.9, color: P.muted, marginBottom: 10 }}>
      {children}
    </div>
  )
}

// ─── Login ─────────────────────────────────────────────────────────────────────
function PortalLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 850))
    const client = clients.find(c => c.email?.toLowerCase() === email.trim().toLowerCase())
    if (!client) {
      setError('No account found with that email.')
      setLoading(false)
      return
    }
    if (password !== DEMO_PASSWORD) {
      setError('Incorrect password.')
      setLoading(false)
      return
    }
    onLogin(client)
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: P.gold, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, color: '#fff8ee' }}>✦</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.text, letterSpacing: -0.3 }}>Reno Reset</div>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 2 }}>Client Portal</div>
        </div>

        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: P.text, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: P.sub, marginBottom: 22 }}>Sign in to view your appointments, photos, and invoices.</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email</label>
              <input
                type="email" required placeholder="your@email.com"
                value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = P.gold}
                onBlur={e => e.target.style.borderColor = P.border}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Password</label>
              <input
                type="password" required placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = P.gold}
                onBlur={e => e.target.style.borderColor = P.border}
              />
            </div>

            {error && (
              <div style={{ background: P.dangerBg, border: `1px solid ${P.danger}30`, color: P.danger, borderRadius: 8, padding: '9px 13px', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px 0', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
            >
              {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <button onClick={() => setHint(h => !h)} style={{ background: 'none', border: 'none', color: P.gold, fontSize: 13, cursor: 'pointer', marginTop: 14, width: '100%', fontFamily: 'inherit', textDecoration: 'underline' }}>
            {hint ? 'Hide demo hint' : 'Need help signing in?'}
          </button>

          {hint && (
            <div style={{ marginTop: 12, background: P.goldLight, border: `1px solid ${P.goldBorder}`, borderRadius: 8, padding: '11px 14px', fontSize: 12, color: P.sub, lineHeight: 1.6 }}>
              <strong>Demo credentials:</strong><br />
              Email: <code style={{ background: '#E8D8A0', padding: '1px 5px', borderRadius: 3 }}>j.walsh@example.com</code><br />
              Password: <code style={{ background: '#E8D8A0', padding: '1px 5px', borderRadius: 3 }}>clean123</code><br />
              <span style={{ opacity: 0.75 }}>Any client email works — check sampleData.js for the list</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Home tab ──────────────────────────────────────────────────────────────────
function HomeTab({ client, photos, invoices }) {
  const nextJob  = upcomingJobs.find(j => j.clientId === client.id)
  const lastPhoto = photos.filter(p => p.type === 'after')[0]
  const pendingAmt = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const issuePhotos = photos.filter(p => p.type === 'issue')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: P.text, marginBottom: 3 }}>Hi, {client.name.split(' ')[0]}! 👋</h2>
        <p style={{ fontSize: 13, color: P.muted }}>Client since {client.since} · {client.jobCount} total cleans</p>
      </div>

      {/* Next appointment */}
      {nextJob ? (
        <div style={{ background: P.gold, borderRadius: 16, padding: '20px 22px', color: '#fff8ee' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75, marginBottom: 8 }}>Next Appointment</div>
          <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 8, letterSpacing: -0.3 }}>
            {nextJob.day}, June {nextJob.date.slice(8)} · {nextJob.time}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <MapPin size={13} /> {nextJob.address}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} /> Approx. {nextJob.duration} hours
          </div>
        </div>
      ) : (
        <Card style={{ borderLeft: `3px solid ${P.gold}` }}>
          <div style={{ fontSize: 13, color: P.sub }}>No upcoming appointment scheduled. Text or call to book your next clean!</div>
        </Card>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Total Cleans', val: client.jobCount, bold: true },
          { label: 'Member Since', val: client.since.slice(0,7) },
          { label: 'Tier',         val: client.tier.charAt(0).toUpperCase() + client.tier.slice(1), gold: client.tier === 'gold' },
        ].map(s => (
          <div key={s.label} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '13px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.gold ? P.gold : P.text, letterSpacing: -0.3 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: P.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Balance due */}
      {pendingAmt > 0 && (
        <div style={{ background: P.warningBg, border: `1px solid ${P.goldBorder}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <DollarSign size={18} style={{ color: P.gold, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: P.text }}>Balance due: ${pendingAmt}</div>
            <div style={{ fontSize: 12, color: P.sub, marginTop: 2 }}>Please send via your preferred payment method when you're ready.</div>
          </div>
        </div>
      )}

      {/* Flagged issues */}
      {issuePhotos.length > 0 && (
        <Card style={{ borderLeft: `3px solid ${P.danger}` }}>
          <SectionLabel>Item Flagged by Your Cleaner</SectionLabel>
          {issuePhotos.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
              <AlertCircle size={16} style={{ color: P.danger, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, color: P.text, fontWeight: 500 }}>{p.caption}</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{p.date} · Noted by {p.addedBy}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Last clean preview */}
      {lastPhoto && (
        <Card>
          <SectionLabel>Last Clean</SectionLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 10, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {lastPhoto.dataUrl
                ? <img src={lastPhoto.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} alt="" />
                : <Camera size={20} style={{ color: P.gold, opacity: 0.5 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 2 }}>{lastPhoto.caption}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{lastPhoto.date} · Added by {lastPhoto.addedBy}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Contact */}
      <Card>
        <SectionLabel>Questions? Reach Us</SectionLabel>
        <a href="tel:+17755550100" style={{ display: 'flex', alignItems: 'center', gap: 10, color: P.text, textDecoration: 'none', marginBottom: 10, fontSize: 14 }}>
          <Phone size={16} style={{ color: P.gold }} /> (775) 555-0100
        </a>
        <a href="mailto:hello@renoreset.com" style={{ display: 'flex', alignItems: 'center', gap: 10, color: P.text, textDecoration: 'none', fontSize: 14 }}>
          <Mail size={16} style={{ color: P.gold }} /> hello@renoreset.com
        </a>
      </Card>
    </div>
  )
}

// ─── Photos tab ────────────────────────────────────────────────────────────────
function PhotosTab({ photos, clientName }) {
  const [lightbox, setLightbox] = useState(null)

  const groups = {
    issue:  photos.filter(p => p.type === 'issue'),
    after:  photos.filter(p => p.type === 'after'),
    before: photos.filter(p => p.type === 'before'),
  }

  const typeCfg = {
    issue:  { label: 'Flagged Items',   bg: P.dangerBg,  color: P.danger,  borderColor: `${P.danger}30` },
    after:  { label: 'After Clean',     bg: P.successBg, color: P.success, borderColor: `${P.success}30` },
    before: { label: 'Before Clean',    bg: P.warningBg, color: P.warning, borderColor: `${P.goldBorder}` },
  }

  if (photos.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Camera size={28} style={{ color: P.gold, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: P.muted }}>No photos yet. Your cleaner will add before/after shots after each visit.</p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {Object.entries(groups).map(([type, list]) => {
        if (!list.length) return null
        const cfg = typeCfg[type]
        return (
          <div key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: cfg.color }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: 11, color: P.muted }}>({list.length})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {list.map(photo => (
                <div key={photo.id} onClick={() => photo.dataUrl && setLightbox(photo)} style={{ cursor: photo.dataUrl ? 'zoom-in' : 'default' }}>
                  <div style={{ aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', border: `1px solid ${cfg.borderColor}`, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {photo.dataUrl
                      ? <img src={photo.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Camera size={22} style={{ color: cfg.color, opacity: 0.5 }} />}
                  </div>
                  <div style={{ fontSize: 11, color: P.sub, marginTop: 5, lineHeight: 1.4 }}>{photo.caption}</div>
                  <div style={{ fontSize: 10, color: P.muted, marginTop: 2 }}>{photo.date}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw' }}>
            <img src={lightbox.dataUrl} alt="" style={{ display: 'block', maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '10px 14px', borderRadius: '0 0 10px 10px' }}>
              <div style={{ color: '#fff', fontSize: 13 }}>{lightbox.caption}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{lightbox.date} · {lightbox.addedBy}</div>
            </div>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -12, right: -12, width: 28, height: 28, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: P.text }}>×</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Invoices tab ──────────────────────────────────────────────────────────────
function InvoicesTab({ invoices, paymentSetting }) {
  const paid    = invoices.filter(i => i.status === 'paid')
  const pending = invoices.filter(i => i.status !== 'paid')

  const STATUS = {
    paid:    { label: 'Paid',    bg: P.successBg, color: P.success },
    pending: { label: 'Pending', bg: P.warningBg, color: P.warning },
    overdue: { label: 'Overdue', bg: P.dangerBg,  color: P.danger  },
  }

  const InvoiceRow = ({ inv }) => {
    const sc = STATUS[inv.status]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: P.text }}>{inv.service}</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>
            {inv.status === 'paid' ? `Paid ${inv.paidDate}` : `Due ${inv.dueDate}`}
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: inv.status === 'paid' ? P.success : P.text }}>
          ${inv.amount}
        </div>
        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </div>
    )
  }

  const totalPaid = paid.reduce((s, i) => s + i.amount, 0)
  const totalOwed = pending.reduce((s, i) => s + i.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card style={{ textAlign: 'center', padding: '14px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: P.gold }}>${totalPaid.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Paid</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '14px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: totalOwed > 0 ? P.warning : P.text }}>{totalOwed > 0 ? `$${totalOwed}` : '—'}</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Outstanding</div>
        </Card>
      </div>

      {/* Payment method */}
      {paymentSetting && (
        <Card>
          <SectionLabel>Your Payment Method</SectionLabel>
          <div style={{ fontSize: 14, fontWeight: 600, color: P.text, textTransform: 'capitalize' }}>
            {paymentSetting.method}
            <span style={{ fontSize: 12, fontWeight: 400, color: P.muted, marginLeft: 8 }}>
              · {paymentSetting.billingType === 'recurring' ? 'Billed after each visit' : 'One-time billing'}
            </span>
          </div>
        </Card>
      )}

      {/* Pending first */}
      {pending.length > 0 && (
        <Card>
          <SectionLabel>Outstanding</SectionLabel>
          {pending.map(inv => <InvoiceRow key={inv.id} inv={inv} />)}
        </Card>
      )}

      {/* History */}
      {paid.length > 0 && (
        <Card>
          <SectionLabel>Payment History</SectionLabel>
          {paid.map(inv => <InvoiceRow key={inv.id} inv={inv} />)}
        </Card>
      )}

      {invoices.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: 14, color: P.muted }}>No invoices on file yet.</p>
        </Card>
      )}
    </div>
  )
}

// ─── My Details tab ────────────────────────────────────────────────────────────
function MyDetailsTab({ client }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleReview = async () => {
    if (!rating) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Profile */}
      <Card>
        <SectionLabel>Your Profile</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Name',    val: client.name },
            { label: 'Email',   val: client.email },
            { label: 'Phone',   val: client.phone },
            { label: 'Address', val: `${client.address}, ${client.city}` },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${P.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, width: 70, flexShrink: 0, paddingTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: P.text, flex: 1 }}>{f.val}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, width: 70, flexShrink: 0, paddingTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>Size</div>
            <div style={{ fontSize: 14, color: P.text }}>{client.bedrooms}bd / {client.bathrooms}ba · ~{client.sqft?.toLocaleString()} sq ft</div>
          </div>
        </div>
      </Card>

      {/* Service notes */}
      <Card>
        <SectionLabel>Service Notes On File</SectionLabel>
        <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderLeft: `3px solid ${P.gold}`, borderRadius: 8, padding: '12px 14px', fontSize: 14, color: P.sub, lineHeight: 1.65 }}>
          {client.notes || 'No special instructions on file.'}
        </div>
        <p style={{ fontSize: 12, color: P.muted, marginTop: 10 }}>
          Need to update these? Text Ashley at (775) 555-0100.
        </p>
      </Card>

      {/* Review */}
      <Card>
        <SectionLabel>Leave a Review</SectionLabel>

        {submitted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: P.successBg, border: `1px solid ${P.success}30`, borderRadius: 8, padding: '12px 14px' }}>
            <CheckCircle2 size={18} style={{ color: P.success, flexShrink: 0 }} />
            <div style={{ fontSize: 14, color: P.success, fontWeight: 600 }}>
              Thank you for your review, {client.name.split(' ')[0]}! It means everything to us. 🌟
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: P.sub, marginBottom: 14 }}>How was your last clean? Your feedback helps us improve and grows our small business.</p>

            {/* Stars */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s' }}
                >
                  <Star
                    size={30}
                    fill={n <= (hover || rating) ? P.gold : 'none'}
                    stroke={n <= (hover || rating) ? P.gold : P.border}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <>
                <textarea
                  placeholder="Tell us what went well or how we can do better..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                  onFocus={e => e.target.style.borderColor = P.gold}
                  onBlur={e => e.target.style.borderColor = P.border}
                />
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  style={{ padding: '10px 22px', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {submitting ? 'Submitting...' : <><Star size={14} fill="#fff8ee" stroke="none" /> Submit Review</>}
                </button>
              </>
            )}
          </>
        )}
      </Card>

      {/* Request */}
      <Card>
        <SectionLabel>Request a Change or Rebook</SectionLabel>
        <p style={{ fontSize: 13, color: P.sub, marginBottom: 12 }}>Need to reschedule, change your frequency, or add a service?</p>
        <a
          href="sms:+17755550100"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: P.gold, color: '#fff8ee', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
        >
          <Phone size={14} /> Text Us to Request
        </a>
      </Card>
    </div>
  )
}

// ─── Main portal dashboard ────────────────────────────────────────────────────
function PortalDashboard({ client, onLogout }) {
  const [tab, setTab] = useState('home')
  const photos    = samplePhotos.filter(p => p.clientId === client.id)
  const invoices  = sampleInvoices.filter(i => i.clientId === client.id)
  const payment   = clientPaymentSettings[client.id]

  const TABS = [
    { id: 'home',     Icon: Home,    label: 'Home'    },
    { id: 'photos',   Icon: Image,   label: 'Photos'  },
    { id: 'invoices', Icon: Receipt, label: 'Invoices'},
    { id: 'details',  Icon: User,    label: 'My Info' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif', color: P.text }}>
      {/* Sticky header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: P.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff8ee', fontSize: 14, flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.text, lineHeight: 1.1 }}>Reno Reset</div>
              <div style={{ fontSize: 10, color: P.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Client Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{client.name.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: P.muted, textTransform: 'capitalize' }}>{client.tier} client</div>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              style={{ width: 34, height: 34, border: `1px solid ${P.border}`, borderRadius: '50%', background: P.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.muted }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', borderTop: `1px solid ${P.border}` }}>
          {TABS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === id ? P.gold : 'transparent'}`,
                color: tab === id ? P.gold : P.muted,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'all 0.12s ease', fontFamily: 'inherit',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 40px' }}>
        {tab === 'home'     && <HomeTab      client={client} photos={photos} invoices={invoices} />}
        {tab === 'photos'   && <PhotosTab    photos={photos} clientName={client.name} />}
        {tab === 'invoices' && <InvoicesTab  invoices={invoices} paymentSetting={payment} />}
        {tab === 'details'  && <MyDetailsTab client={client} />}
      </main>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function ClientPortalApp({ onExit }) {
  const [client, setClient] = useState(null)

  return (
    <div>
      {/* Back to admin banner (demo only) */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
        <button
          onClick={onExit}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#1A1A1A', color: '#F2EDE3', border: '1px solid #333', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
        >
          <ChevronLeft size={13} /> Back to Admin
        </button>
      </div>

      {!client
        ? <PortalLogin    onLogin={setClient} />
        : <PortalDashboard client={client} onLogout={() => setClient(null)} />
      }
    </div>
  )
}
