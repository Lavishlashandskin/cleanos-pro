import { useState, useEffect, useCallback } from 'react'
import {
  LogOut, MapPin, Clock, Camera, DollarSign, Star, Phone, Mail,
  CheckCircle2, AlertCircle, ChevronLeft, Home, Receipt, User,
  ShieldCheck, CalendarDays, Edit3, Save, X, CreditCard,
  Fingerprint, Smartphone,
} from 'lucide-react'
import {
  clients, upcomingJobs as defaultJobs, samplePhotos, sampleInvoices, clientPaymentSettings,
} from '../data/sampleData.js'
import { getStoredProfile } from '../context/ProfileContext.jsx'

const DEMO_PASSWORD = 'clean123'
const TOKEN_KEY     = 'cleanos_portal_token'
const WEBAUTHN_KEY  = 'cleanos_webauthn_cred'
const TOKEN_TTL_MS  = 30 * 24 * 60 * 60 * 1000 // 30 days

// ── Auth token helpers ────────────────────────────────────────────────────────
function saveToken(client) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify({
    clientId: client.id,
    email: client.email,
    expiry: Date.now() + TOKEN_TTL_MS,
  }))
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}
function loadToken() {
  try {
    const t = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null')
    if (t && t.expiry > Date.now()) return t
  } catch {}
  clearToken()
  return null
}

// ── WebAuthn helpers ──────────────────────────────────────────────────────────
function webAuthnSupported() {
  return !!(window.PublicKeyCredential && navigator.credentials)
}

async function registerWebAuthn(client) {
  if (!webAuthnSupported()) throw new Error('WebAuthn not supported')
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId    = new TextEncoder().encode(client.email)

  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'CleanOS Pro', id: window.location.hostname },
      user: { id: userId, name: client.email, displayName: client.name },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  })

  if (!cred) throw new Error('Credential creation cancelled')
  const stored = {
    id: Array.from(new Uint8Array(cred.rawId)),
    clientId: client.id,
  }
  localStorage.setItem(WEBAUTHN_KEY, JSON.stringify(stored))
  return stored
}

async function authenticateWebAuthn() {
  const stored = JSON.parse(localStorage.getItem(WEBAUTHN_KEY) || 'null')
  if (!stored || !webAuthnSupported()) return null

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{
        type: 'public-key',
        id: new Uint8Array(stored.id).buffer,
      }],
      userVerification: 'required',
      timeout: 60000,
    },
  })
  if (!assertion) return null
  return clients.find(c => c.id === stored.clientId) || null
}

// ── Portal color palette ──────────────────────────────────────────────────────
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

// ── Shared card ───────────────────────────────────────────────────────────────
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

// ── Login ─────────────────────────────────────────────────────────────────────
function PortalLogin({ onLogin }) {
  const profile = getStoredProfile()
  const biz = profile.businessName || 'CleanOS'

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [hint, setHint]           = useState(false)

  const [hasBiometric, setHasBiometric] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricError, setBiometricError] = useState('')

  useEffect(() => {
    const cred = localStorage.getItem(WEBAUTHN_KEY)
    setHasBiometric(!!cred && webAuthnSupported())
  }, [])

  const handleBiometric = async () => {
    setBiometricError('')
    setBiometricLoading(true)
    try {
      const client = await authenticateWebAuthn()
      if (client) {
        saveToken(client)
        onLogin(client)
      } else {
        setBiometricError('Biometric auth failed — please sign in with your password.')
      }
    } catch (err) {
      setBiometricError('Biometric auth cancelled or not available.')
    } finally {
      setBiometricLoading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 750))
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
    if (rememberMe) saveToken(client)
    onLogin(client, { firstLogin: true })
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1px solid ${P.border}`, background: P.bg, color: P.text,
    fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: P.gold, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, color: '#fff8ee' }}>✦</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.text, letterSpacing: -0.3 }}>{biz}</div>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 2 }}>Client Portal</div>
        </div>

        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: P.text, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: P.sub, marginBottom: 22 }}>Sign in to view your appointments and invoices.</p>

          {/* Biometric button */}
          {hasBiometric && (
            <div style={{ marginBottom: 18 }}>
              <button
                type="button"
                onClick={handleBiometric}
                disabled={biometricLoading}
                style={{
                  width: '100%', padding: '12px 0', background: P.goldLight,
                  border: `1px solid ${P.goldBorder}`, borderRadius: 10, fontSize: 14,
                  fontWeight: 700, cursor: biometricLoading ? 'not-allowed' : 'pointer',
                  color: P.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, fontFamily: 'inherit', opacity: biometricLoading ? 0.7 : 1,
                }}
              >
                <Fingerprint size={18} />
                {biometricLoading ? 'Verifying…' : 'Sign in with Face ID / Touch ID'}
              </button>
              {biometricError && (
                <div style={{ fontSize: 12, color: P.danger, marginTop: 6, textAlign: 'center' }}>{biometricError}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: P.border }} />
                <span style={{ fontSize: 11, color: P.muted, fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: P.border }} />
              </div>
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email</label>
              <input type="email" required placeholder="your@email.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                style={inputStyle} onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = P.border} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                style={inputStyle} onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = P.border} />
            </div>

            {/* Remember Me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: P.gold, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: P.sub }}>Remember me for 30 days</span>
            </label>

            {error && (
              <div style={{ background: P.dangerBg, border: `1px solid ${P.danger}30`, color: P.danger, borderRadius: 8, padding: '9px 13px', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px 0', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          <button onClick={() => setHint(h => !h)} style={{ background: 'none', border: 'none', color: P.gold, fontSize: 13, cursor: 'pointer', marginTop: 14, width: '100%', fontFamily: 'inherit', textDecoration: 'underline' }}>
            {hint ? 'Hide demo hint' : 'Need help signing in?'}
          </button>
          {hint && (
            <div style={{ marginTop: 12, background: P.goldLight, border: `1px solid ${P.goldBorder}`, borderRadius: 8, padding: '11px 14px', fontSize: 12, color: P.sub, lineHeight: 1.6 }}>
              <strong>Demo credentials:</strong><br />
              Email: <code style={{ background: '#E8D8A0', padding: '1px 5px', borderRadius: 3 }}>j.walsh@example.com</code><br />
              Password: <code style={{ background: '#E8D8A0', padding: '1px 5px', borderRadius: 3 }}>clean123</code>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Home tab ──────────────────────────────────────────────────────────────────
function HomeTab({ client, photos, invoices, jobs }) {
  const nextJob    = jobs.find(j => j.clientId === client.id)
  const pendingAmt = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const issuePhotos = photos.filter(p => p.type === 'issue')
  const lastPhoto   = photos.filter(p => p.type === 'after')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: P.text, marginBottom: 3 }}>Hi, {client.name.split(' ')[0]}!</h2>
        <p style={{ fontSize: 13, color: P.muted }}>Client since {client.since} · {client.jobCount} total cleans</p>
      </div>

      {nextJob ? (
        <div style={{ background: P.gold, borderRadius: 16, padding: '20px 22px', color: '#fff8ee' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75, marginBottom: 8 }}>Next Appointment</div>
          <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 8, letterSpacing: -0.3 }}>
            {nextJob.day}, {nextJob.date?.slice(5)} · {nextJob.time}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Total Cleans', val: client.jobCount, bold: true },
          { label: 'Member Since', val: client.since?.slice(0,7) },
          { label: 'Tier',         val: client.tier?.charAt(0).toUpperCase() + client.tier?.slice(1), gold: client.tier === 'gold' },
        ].map(s => (
          <div key={s.label} style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: '13px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.gold ? P.gold : P.text, letterSpacing: -0.3 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: P.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {pendingAmt > 0 && (
        <div style={{ background: P.warningBg, border: `1px solid ${P.goldBorder}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <DollarSign size={18} style={{ color: P.gold, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: P.text }}>Balance due: ${pendingAmt}</div>
            <div style={{ fontSize: 12, color: P.sub, marginTop: 2 }}>Please send via your preferred payment method when you're ready.</div>
          </div>
        </div>
      )}

      {issuePhotos.length > 0 && (
        <Card style={{ borderLeft: `3px solid ${P.danger}` }}>
          <SectionLabel>Item Flagged by Your Cleaner</SectionLabel>
          {issuePhotos.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
              <AlertCircle size={16} style={{ color: P.danger, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, color: P.text, fontWeight: 500 }}>{p.caption}</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{p.date} · {p.addedBy}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {lastPhoto && (
        <Card>
          <SectionLabel>Last Clean</SectionLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 10, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {lastPhoto.dataUrl
                ? <img src={lastPhoto.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} alt="" />
                : <Camera size={20} style={{ color: P.gold, opacity: 0.5 }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: P.text, marginBottom: 2 }}>{lastPhoto.caption}</div>
              <div style={{ fontSize: 11, color: P.muted }}>{lastPhoto.date} · {lastPhoto.addedBy}</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <SectionLabel>Questions? Reach Us</SectionLabel>
        {(() => {
          const p = getStoredProfile()
          return (
            <>
              {p.phone && <a href={`tel:${p.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: P.text, textDecoration: 'none', marginBottom: 10, fontSize: 14 }}><Phone size={16} style={{ color: P.gold }} /> {p.phone}</a>}
              {p.email && <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: P.text, textDecoration: 'none', fontSize: 14 }}><Mail size={16} style={{ color: P.gold }} /> {p.email}</a>}
              {!p.phone && !p.email && <p style={{ fontSize: 13, color: P.muted }}>Contact info not yet configured.</p>}
            </>
          )
        })()}
      </Card>
    </div>
  )
}

// ── Appointments tab ──────────────────────────────────────────────────────────
function AppointmentsTab({ client, jobs }) {
  const today     = new Date().toISOString().split('T')[0]
  const clientJobs = jobs.filter(j => j.clientId === client.id)
  const upcoming   = clientJobs.filter(j => j.date >= today && j.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date))
  const past       = clientJobs.filter(j => j.date < today || j.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))

  const STATUS = {
    scheduled:    { bg: P.warningBg,  color: P.warning },
    'in-progress': { bg: P.successBg, color: P.success },
    completed:    { bg: P.successBg,  color: P.success },
    pending:      { bg: P.warningBg,  color: P.warning },
  }

  const JobCard = ({ job, upcoming: isUp }) => {
    const sc = STATUS[job.status] || STATUS.pending
    return (
      <Card style={{ marginBottom: 10, borderLeft: `3px solid ${isUp ? P.gold : P.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: P.text, marginBottom: 4 }}>{job.day}, {job.date?.slice(5)} at {job.time}</div>
            <div style={{ fontSize: 13, color: P.sub, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><MapPin size={12} /> {job.address}</div>
            <div style={{ fontSize: 12, color: P.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} /> ~{job.duration} hrs {job.type && <> · <span style={{ textTransform: 'capitalize' }}>{job.type}</span></>}
            </div>
          </div>
          <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, flexShrink: 0, textTransform: 'capitalize' }}>
            {job.status || 'Scheduled'}
          </span>
        </div>
        {job.waiverStatus === 'sent' && job.waiverStatus !== 'signed' && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: P.warningBg, border: `1px solid ${P.goldBorder}`, borderRadius: 8, fontSize: 12, color: P.warning, fontWeight: 600 }}>
            Waiver signature required — see Account tab
          </div>
        )}
      </Card>
    )
  }

  if (clientJobs.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <CalendarDays size={28} style={{ color: P.gold, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: P.muted }}>No appointments on file yet.</p>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: P.gold, marginBottom: 12 }}>Upcoming ({upcoming.length})</div>
          {upcoming.map(j => <JobCard key={j.id} job={j} upcoming />)}
        </div>
      )}
      {past.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: P.muted, marginBottom: 12 }}>Past ({past.length})</div>
          {past.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  )
}

// ── Invoices tab ──────────────────────────────────────────────────────────────
function InvoicesTab({ invoices, paymentSetting }) {
  const paid    = invoices.filter(i => i.status === 'paid')
  const pending = invoices.filter(i => i.status !== 'paid')

  const STATUS = {
    paid:    { label: 'Paid',    bg: P.successBg, color: P.success },
    pending: { label: 'Pending', bg: P.warningBg, color: P.warning },
    overdue: { label: 'Overdue', bg: P.dangerBg,  color: P.danger  },
  }

  const Row = ({ inv }) => {
    const sc = STATUS[inv.status]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: P.text }}>{inv.service}</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{inv.status === 'paid' ? `Paid ${inv.paidDate}` : `Due ${inv.dueDate}`}</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, color: inv.status === 'paid' ? P.success : P.text }}>${inv.amount}</div>
        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{sc.label}</span>
      </div>
    )
  }

  const totalPaid = paid.reduce((s, i) => s + i.amount, 0)
  const totalOwed = pending.reduce((s, i) => s + i.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      {paymentSetting && (
        <Card>
          <SectionLabel>Payment Method</SectionLabel>
          <div style={{ fontSize: 14, fontWeight: 600, color: P.text, textTransform: 'capitalize' }}>
            {paymentSetting.method}
            <span style={{ fontSize: 12, fontWeight: 400, color: P.muted, marginLeft: 8 }}>
              · {paymentSetting.billingType === 'recurring' ? 'Billed after each visit' : 'One-time billing'}
            </span>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <Card>
          <SectionLabel>Outstanding</SectionLabel>
          {pending.map(inv => <Row key={inv.id} inv={inv} />)}
        </Card>
      )}

      {paid.length > 0 && (
        <Card>
          <SectionLabel>Payment History</SectionLabel>
          {paid.map(inv => <Row key={inv.id} inv={inv} />)}
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

// ── Account tab (Profile + Waivers + Biometrics + Review) ────────────────────
const WAIVER_TEXT = `SERVICE AGREEMENT & LIABILITY WAIVER

1. AUTHORIZATION — You authorize us to access and perform services at your property on the scheduled date(s).

2. ACCESS — You agree to provide safe, reasonable access. Any known hazards (chemicals, fragile items, pets) will be disclosed prior to service.

3. EXISTING CONDITIONS — We are not responsible for pre-existing damage or normal wear. Our team will note any issues found on arrival.

4. LIABILITY — We carry general liability insurance. Any damage claims must be reported within 24 hours of service completion.

5. CANCELLATION — 24-hour notice required to cancel or reschedule without a fee.

By typing your full name and clicking "I Agree," you confirm you have read and accept these terms.`

function AccountTab({ client, jobs, onSignWaiver, hadFirstLogin }) {
  const profile = getStoredProfile()
  const biz = profile.businessName || 'us'

  const [editing, setEditing]       = useState(false)
  const [contactForm, setContactForm] = useState({ name: client.name, email: client.email, phone: client.phone || '', notes: client.notes || '' })
  const [contactSaved, setContactSaved] = useState(false)
  const [sigName, setSigName]       = useState('')
  const [signed, setSigned]         = useState({})
  const [waiverError, setWaiverError] = useState('')
  const [rating, setRating]         = useState(0)
  const [hover, setHover]           = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [biometricRegistered, setBiometricRegistered] = useState(!!localStorage.getItem(WEBAUTHN_KEY))
  const [biometricStatus, setBiometricStatus] = useState('')
  const [registeringBiometric, setRegisteringBiometric] = useState(false)

  const pendingWaivers = jobs.filter(j => j.clientId === client.id && j.waiverStatus === 'sent')
  const signedWaivers  = jobs.filter(j => j.clientId === client.id && j.waiverStatus === 'signed')

  const inputStyle = {
    width: '100%', padding: '9px 11px', borderRadius: 8, border: `1px solid ${P.border}`,
    background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  const handleSaveContact = async () => {
    await new Promise(r => setTimeout(r, 600))
    setContactSaved(true)
    setEditing(false)
    setTimeout(() => setContactSaved(false), 3000)
  }

  const handleSign = (job) => {
    if (!sigName.trim()) { setWaiverError('Please type your full name to sign.'); return }
    if (sigName.trim().toLowerCase() !== client.name.toLowerCase()) { setWaiverError('Name must match your account name exactly.'); return }
    setWaiverError('')
    onSignWaiver?.(job.id, sigName.trim())
    setSigned(s => ({ ...s, [job.id]: true }))
  }

  const handleRegisterBiometric = async () => {
    setRegisteringBiometric(true)
    setBiometricStatus('')
    try {
      await registerWebAuthn(client)
      setBiometricRegistered(true)
      setBiometricStatus('Face ID / Touch ID registered successfully!')
    } catch (err) {
      setBiometricStatus(err.message?.includes('cancel') || err.name === 'NotAllowedError'
        ? 'Registration cancelled.'
        : 'Biometric registration failed. Your device may not support this.')
    } finally {
      setRegisteringBiometric(false)
    }
  }

  const handleRemoveBiometric = () => {
    localStorage.removeItem(WEBAUTHN_KEY)
    setBiometricRegistered(false)
    setBiometricStatus('Biometric login removed.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Profile */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionLabel>Your Profile</SectionLabel>
          <button
            onClick={() => setEditing(e => !e)}
            style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 12, color: P.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}
          >
            {editing ? <><X size={12} /> Cancel</> : <><Edit3 size={12} /> Edit</>}
          </button>
        </div>

        {contactSaved && (
          <div style={{ background: P.successBg, border: `1px solid ${P.success}30`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: P.success, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> Contact info update requested — we'll confirm shortly.
          </div>
        )}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[{ key: 'name', label: 'Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' }].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} value={contactForm[f.key]} onChange={e => setContactForm(c => ({ ...c, [f.key]: e.target.value }))}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = P.border} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>Special Instructions</label>
              <textarea rows={3} value={contactForm.notes} onChange={e => setContactForm(c => ({ ...c, notes: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = P.border} />
            </div>
            <button onClick={handleSaveContact} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Save size={14} /> Submit Update Request
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[{ label: 'Name', val: contactForm.name }, { label: 'Email', val: contactForm.email }, { label: 'Phone', val: contactForm.phone }, { label: 'Address', val: `${client.address}, ${client.city}` }].map(f => (
              <div key={f.label} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, width: 70, flexShrink: 0, paddingTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{f.label}</div>
                <div style={{ fontSize: 14, color: P.text, flex: 1 }}>{f.val}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, width: 70, flexShrink: 0, paddingTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>Home</div>
              <div style={{ fontSize: 14, color: P.text }}>{client.bedrooms}bd / {client.bathrooms}ba · ~{client.sqft?.toLocaleString()} sq ft</div>
            </div>
          </div>
        )}
      </Card>

      {/* Face ID / Biometrics */}
      {webAuthnSupported() && (
        <Card>
          <SectionLabel>Security & Login</SectionLabel>
          {biometricRegistered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: P.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fingerprint size={18} style={{ color: P.success }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: P.text }}>Face ID / Touch ID enabled</div>
                  <div style={{ fontSize: 12, color: P.muted }}>Sign in with biometrics on this device</div>
                </div>
              </div>
              <button onClick={handleRemoveBiometric} style={{ alignSelf: 'flex-start', background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, color: P.danger, cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove Biometric Login
              </button>
              {biometricStatus && <div style={{ fontSize: 12, color: P.muted }}>{biometricStatus}</div>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: P.sub }}>Enable Face ID or Touch ID to sign in faster on this device without a password.</p>
              <button
                onClick={handleRegisterBiometric}
                disabled={registeringBiometric}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: P.goldLight, border: `1px solid ${P.goldBorder}`, borderRadius: 10, fontSize: 14, fontWeight: 700, color: P.gold, cursor: registeringBiometric ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: registeringBiometric ? 0.7 : 1 }}
              >
                <Fingerprint size={16} /> {registeringBiometric ? 'Setting up…' : 'Set Up Face ID / Touch ID'}
              </button>
              {biometricStatus && <div style={{ fontSize: 12, color: biometricStatus.includes('success') ? P.success : P.muted }}>{biometricStatus}</div>}
            </div>
          )}
        </Card>
      )}

      {/* Pending Waivers */}
      {(pendingWaivers.length > 0 || signedWaivers.length > 0) && (
        <Card>
          <SectionLabel>Service Agreements {pendingWaivers.length > 0 && <span style={{ color: P.gold, marginLeft: 4 }}>({pendingWaivers.length} pending)</span>}</SectionLabel>

          {pendingWaivers.map(job => (
            <div key={job.id} style={{ marginBottom: 16, padding: '14px', background: P.bg, border: `1px solid ${P.goldBorder}`, borderRadius: 10 }}>
              {signed[job.id] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} style={{ color: P.success }} />
                  <div style={{ fontWeight: 700, color: P.success }}>Waiver signed — thank you!</div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 14, color: P.text, marginBottom: 4 }}>
                    Service Agreement · {job.day}, {job.date?.slice(5)} at {job.time}
                  </div>
                  <div style={{ fontSize: 12, color: P.sub, marginBottom: 12 }}>{job.address}</div>
                  <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 12, color: P.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
                    {WAIVER_TEXT}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Type your full name to sign</label>
                    <input type="text" placeholder={client.name} value={sigName} onChange={e => { setSigName(e.target.value); setWaiverError('') }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${waiverError ? P.danger : P.border}`, background: P.card, color: P.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = waiverError ? P.danger : P.border} />
                    {waiverError && <div style={{ fontSize: 12, color: P.danger, marginTop: 6 }}>{waiverError}</div>}
                  </div>
                  <button onClick={() => handleSign(job)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <ShieldCheck size={15} /> I Agree & Sign
                  </button>
                </>
              )}
            </div>
          ))}

          {signedWaivers.length > 0 && (
            <div>
              {pendingWaivers.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 }}>Previously Signed</div>}
              {signedWaivers.map(job => (
                <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: P.successBg, border: `1px solid ${P.success}30`, borderRadius: 10, marginBottom: 8 }}>
                  <CheckCircle2 size={16} style={{ color: P.success, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{job.day}, {job.date?.slice(5)}</div>
                    <div style={{ fontSize: 11, color: P.muted }}>Signed by: {job.signedBy}</div>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: P.successBg, color: P.success, border: `1px solid ${P.success}30` }}>Signed</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Leave a Review */}
      <Card>
        <SectionLabel>Leave a Review</SectionLabel>
        {reviewSubmitted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: P.successBg, border: `1px solid ${P.success}30`, borderRadius: 8, padding: '12px 14px' }}>
            <CheckCircle2 size={18} style={{ color: P.success }} />
            <div style={{ fontSize: 14, color: P.success, fontWeight: 600 }}>Thank you for your review! It means everything to us.</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: P.sub, marginBottom: 14 }}>How was your last clean?</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star size={30} fill={n <= (hover || rating) ? P.gold : 'none'} stroke={n <= (hover || rating) ? P.gold : P.border} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <>
                <textarea placeholder="Tell us what went well or how we can do better..." value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                  onFocus={e => e.target.style.borderColor = P.gold} onBlur={e => e.target.style.borderColor = P.border} />
                <button onClick={async () => { await new Promise(r => setTimeout(r, 900)); setReviewSubmitted(true) }}
                  style={{ padding: '10px 22px', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={14} fill="#fff8ee" stroke="none" /> Submit Review
                </button>
              </>
            )}
          </>
        )}
      </Card>

      {/* Rebook */}
      <Card>
        <SectionLabel>Request a Change or Rebook</SectionLabel>
        <p style={{ fontSize: 13, color: P.sub, marginBottom: 12 }}>Need to reschedule, change your frequency, or add a service?</p>
        {(() => {
          const p = getStoredProfile()
          return (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {p.phone && <a href={`sms:${p.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: P.gold, color: '#fff8ee', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}><Phone size={14} /> Text Us</a>}
              {p.email && <a href={`mailto:${p.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'transparent', border: `1px solid ${P.goldBorder}`, color: P.gold, borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}><Mail size={14} /> Email Us</a>}
              {!p.phone && !p.email && <p style={{ fontSize: 13, color: P.muted }}>Contact your service provider to request changes.</p>}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}

// ── Portal Dashboard ──────────────────────────────────────────────────────────
function PortalDashboard({ client, onLogout, jobs, onSignWaiver, hadFirstLogin }) {
  const profile = getStoredProfile()
  const biz     = profile.businessName || 'CleanOS'
  const [tab, setTab] = useState('home')

  const photos   = samplePhotos.filter(p => p.clientId === client.id)
  const invoices = sampleInvoices.filter(i => i.clientId === client.id)
  const payment  = clientPaymentSettings[client.id]
  const pendingWaivers = jobs.filter(j => j.clientId === client.id && j.waiverStatus === 'sent').length

  const TABS = [
    { id: 'home',     Icon: Home,         label: 'Home'         },
    { id: 'appts',    Icon: CalendarDays, label: 'Appointments' },
    { id: 'invoices', Icon: Receipt,      label: 'Invoices'     },
    { id: 'account',  Icon: User,         label: 'Account', badge: pendingWaivers },
  ]

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif', color: P.text }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: P.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff8ee', fontSize: 14, flexShrink: 0 }}>✦</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: P.text, lineHeight: 1.1 }}>{biz}</div>
              <div style={{ fontSize: 10, color: P.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Client Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{client.name.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: P.muted, textTransform: 'capitalize' }}>{client.tier} client</div>
            </div>
            <button onClick={onLogout} title="Sign out"
              style={{ width: 34, height: 34, border: `1px solid ${P.border}`, borderRadius: '50%', background: P.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.muted }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', borderTop: `1px solid ${P.border}` }}>
          {TABS.map(({ id, Icon, label, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === id ? P.gold : 'transparent'}`,
                color: tab === id ? P.gold : P.muted,
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: 'inherit', position: 'relative', transition: 'all 0.12s',
              }}>
              <Icon size={16} />
              {label}
              {badge > 0 && (
                <span style={{ position: 'absolute', top: 6, right: '18%', width: 14, height: 14, borderRadius: '50%', background: P.gold, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 40px' }}>
        {tab === 'home'     && <HomeTab         client={client} photos={photos} invoices={invoices} jobs={jobs} />}
        {tab === 'appts'    && <AppointmentsTab client={client} jobs={jobs} />}
        {tab === 'invoices' && <InvoicesTab     invoices={invoices} paymentSetting={payment} />}
        {tab === 'account'  && <AccountTab      client={client} jobs={jobs} onSignWaiver={onSignWaiver} hadFirstLogin={hadFirstLogin} />}
      </main>
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function ClientPortalApp({ onExit, jobs = defaultJobs, onSignWaiver }) {
  const [client, setClient]         = useState(null)
  const [hadFirstLogin, setHadFirstLogin] = useState(false)

  // Auto-login from 30-day token
  useEffect(() => {
    const token = loadToken()
    if (token) {
      const found = clients.find(c => c.id === token.clientId)
      if (found) setClient(found)
    }
  }, [])

  const handleLogin = useCallback((c, opts = {}) => {
    setClient(c)
    setHadFirstLogin(!!opts.firstLogin)
  }, [])

  const handleLogout = useCallback(() => {
    clearToken()
    setClient(null)
    setHadFirstLogin(false)
  }, [])

  return (
    <div>
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
        <button
          onClick={onExit}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', background: '#1A1A1A', color: '#F2EDE3', border: '1px solid #333', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
        >
          <ChevronLeft size={13} /> Back to Admin
        </button>
      </div>

      {!client
        ? <PortalLogin onLogin={handleLogin} />
        : <PortalDashboard client={client} onLogout={handleLogout} jobs={jobs} onSignWaiver={onSignWaiver} hadFirstLogin={hadFirstLogin} />
      }
    </div>
  )
}
