import { useState } from 'react'
import { MapPin, Clock, Check, ChevronRight, Sparkles, Truck, Wrench, AlertCircle, Zap } from 'lucide-react'
import { getStoredProfile } from '../context/ProfileContext.jsx'

const P = {
  bg: '#F4EEE4', card: '#FFFFFF', border: '#E6DDD0',
  gold: '#A8894E', goldLight: '#F5EDD8', goldBorder: '#D4B86A',
  text: '#3D2B1A', sub: '#6E5C47', muted: '#9B887A',
  success: '#4A7A4D', successBg: '#EBF5EC',
  danger: '#A04040', dangerBg: '#FAEAEA',
}

const SERVICES = {
  cleaning: {
    Icon: Sparkles, label: 'House Cleaning',
    options: [
      { id: 'standard',  label: 'Standard Clean',     desc: 'Regular cleaning of all main areas', durationHr: 2.5 },
      { id: 'deep',      label: 'Deep Clean',          desc: 'Top-to-bottom detail including appliances', durationHr: 4 },
      { id: 'moveout',   label: 'Move-In / Move-Out',  desc: 'Comprehensive clean for property handovers', durationHr: 5 },
      { id: 'airbnb',    label: 'Airbnb Turnover',     desc: 'Fast-turn reset between guests', durationHr: 2 },
    ],
  },
  moving: {
    Icon: Truck, label: 'Moving Services',
    options: [
      { id: 'local',     label: 'Local Move',          desc: 'Same-city relocation', durationHr: 4 },
      { id: 'pack',      label: 'Pack & Move',         desc: 'Full packing plus transport', durationHr: 6 },
      { id: 'unpack',    label: 'Delivery & Unpack',   desc: 'Unload and organize at new location', durationHr: 3 },
    ],
  },
  handyman: {
    Icon: Wrench, label: 'Handyman Services',
    options: [
      { id: 'general',   label: 'General Repairs',     desc: 'Misc. fixes and installations', durationHr: 2 },
      { id: 'plumbing',  label: 'Plumbing',            desc: 'Faucets, drains, minor leaks', durationHr: 2 },
      { id: 'electrical',label: 'Electrical',          desc: 'Outlets, fixtures, switches', durationHr: 2 },
      { id: 'painting',  label: 'Painting',            desc: 'Interior walls and trim', durationHr: 4 },
    ],
  },
}

const TIMES = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM']

function Card({ children, style = {} }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: '20px 22px', ...style }}>
      {children}
    </div>
  )
}

function Step({ n, label, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? P.success : active ? P.gold : P.border,
        color: done || active ? '#fff' : P.muted,
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {done ? <Check size={14} /> : n}
      </div>
      <span style={{ fontSize: 13, fontWeight: active || done ? 700 : 400, color: active ? P.text : P.muted }}>{label}</span>
    </div>
  )
}

export default function BookingPage() {
  const profile = getStoredProfile()
  const biz     = profile.businessName || 'CleanOS Pro'
  const phone   = profile.phone || ''
  const email   = profile.email || ''

  // Detect which service types the business has enabled — default to all
  const activeServices = Object.entries(SERVICES).filter(() => true)

  const [step, setStep]         = useState(1)
  const [serviceType, setSvc]   = useState(null)
  const [serviceOpt, setOpt]    = useState(null)
  const [date, setDate]         = useState('')
  const [time, setTime]         = useState('')
  const [form, setForm]         = useState({ name: '', email: '', phone: '', address: '', notes: '', heardFrom: '', prefComm: 'email' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const minDate = new Date().toISOString().split('T')[0]

  const handleSelectService = (type, opt) => {
    setSvc(type)
    setOpt(opt)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.address || !date || !time) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setSubmitting(true)

    // Save booking to localStorage so admin dashboard can pick it up
    const booking = {
      id: 'book-' + Date.now(),
      clientName: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      notes: form.notes,
      heardFrom: form.heardFrom,
      prefComm: form.prefComm,
      serviceType,
      service: serviceOpt.label,
      date,
      time,
      status: 'pending',
      source: 'online_booking',
      createdAt: new Date().toISOString(),
    }

    const existing = (() => {
      try { return JSON.parse(localStorage.getItem('cleanos_bookings') || '[]') } catch { return [] }
    })()
    localStorage.setItem('cleanos_bookings', JSON.stringify([booking, ...existing]))

    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: P.successBg, border: `2px solid ${P.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} style={{ color: P.success }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: P.text, marginBottom: 10 }}>Booking Request Sent!</h1>
          <p style={{ fontSize: 15, color: P.sub, marginBottom: 24, lineHeight: 1.6 }}>
            Thanks, {form.name.split(' ')[0]}! We've received your booking request for{' '}
            <strong>{serviceOpt?.label}</strong> on <strong>{date}</strong> at <strong>{time}</strong>.
            We'll confirm shortly via {form.prefComm}.
          </p>
          <Card style={{ textAlign: 'left', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: P.muted, marginBottom: 12 }}>Your Booking Summary</div>
            {[
              ['Service',  serviceOpt?.label],
              ['Date',     date],
              ['Time',     time],
              ['Address',  form.address],
              ['Contact',  form.email],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${P.border}`, fontSize: 13 }}>
                <span style={{ color: P.muted }}>{label}</span>
                <span style={{ color: P.text, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </Card>
          {(phone || email) && (
            <p style={{ fontSize: 13, color: P.muted }}>
              Questions?{phone && <> Call us at <a href={`tel:${phone}`} style={{ color: P.gold }}>{phone}</a></>}
              {phone && email && ' · '}
              {email && <><a href={`mailto:${email}`} style={{ color: P.gold }}>{email}</a></>}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif', color: P.text }}>
      {/* Header */}
      <header style={{ background: P.card, borderBottom: `1px solid ${P.border}`, padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: P.gold, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff8ee', flexShrink: 0 }}>
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.text, lineHeight: 1 }}>{biz}</div>
              <div style={{ fontSize: 11, color: P.muted }}>Online Booking</div>
            </div>
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ fontSize: 13, color: P.gold, fontWeight: 600, textDecoration: 'none' }}>{phone}</a>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          <Step n={1} label="Choose Service" active={step === 1} done={step > 1} />
          <ChevronRight size={14} style={{ color: P.border }} />
          <Step n={2} label="Pick a Time"    active={step === 2} done={step > 2} />
          <ChevronRight size={14} style={{ color: P.border }} />
          <Step n={3} label="Your Details"   active={step === 3} done={submitted} />
        </div>

        {/* Step 1: Choose service */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: P.text }}>What can we help with?</h2>
            <p style={{ fontSize: 14, color: P.muted, marginBottom: 20 }}>Select a service to get started.</p>

            {activeServices.map(([type, cfg]) => {
              const Icon = cfg.Icon
              return (
                <div key={type} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon size={16} style={{ color: P.gold }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: P.text }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                    {cfg.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectService(type, opt)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                          background: P.card, border: `1px solid ${P.border}`, borderRadius: 12,
                          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                          transition: 'border-color 0.12s, box-shadow 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = P.gold; e.currentTarget.style.boxShadow = `0 0 0 3px ${P.goldBorder}30` }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 3 }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.5 }}>{opt.desc}</div>
                          <div style={{ fontSize: 11, color: P.gold, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> Approx. {opt.durationHr} hrs
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: P.border, marginTop: 2, flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 2: Date + Time */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: P.gold, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: P.text }}>Choose a date & time</h2>
            <p style={{ fontSize: 14, color: P.muted, marginBottom: 20 }}>
              Service: <strong style={{ color: P.text }}>{serviceOpt?.label}</strong> · ~{serviceOpt?.durationHr} hrs
            </p>

            <Card style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.sub, marginBottom: 8 }}>
                Preferred Date <span style={{ color: P.danger }}>*</span>
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = P.gold}
                onBlur={e => e.target.style.borderColor = P.border}
              />
            </Card>

            {date && (
              <Card style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.sub, marginBottom: 12 }}>
                  Preferred Time <span style={{ color: P.danger }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                  {TIMES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      style={{
                        padding: '9px 6px', borderRadius: 8, border: `1px solid ${time === t ? P.gold : P.border}`,
                        background: time === t ? P.goldLight : P.bg,
                        color: time === t ? P.gold : P.text,
                        fontWeight: time === t ? 700 : 400,
                        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            <button
              disabled={!date || !time}
              onClick={() => setStep(3)}
              style={{ padding: '12px 28px', background: date && time ? P.gold : P.border, color: '#fff', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: date && time ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Client details */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <button type="button" onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: P.gold, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: P.text }}>Your details</h2>
            <p style={{ fontSize: 14, color: P.muted, marginBottom: 20 }}>
              {serviceOpt?.label} · {date} at {time}
            </p>

            {error && (
              <div style={{ background: P.dangerBg, border: `1px solid ${P.danger}30`, color: P.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.muted, marginBottom: 14 }}>Contact Info</div>
              {[
                { key: 'name',    label: 'Full Name',    type: 'text',  req: true,  ph: 'Jane Smith' },
                { key: 'email',   label: 'Email',        type: 'email', req: true,  ph: 'jane@example.com' },
                { key: 'phone',   label: 'Phone',        type: 'tel',   req: false, ph: '(555) 555-0100' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    {f.label} {f.req && <span style={{ color: P.danger }}>*</span>}
                  </label>
                  <input
                    type={f.type}
                    required={f.req}
                    placeholder={f.ph}
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = P.gold}
                    onBlur={e => e.target.style.borderColor = P.border}
                  />
                </div>
              ))}
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.muted, marginBottom: 14 }}>Service Address</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Address <span style={{ color: P.danger }}>*</span>
                </label>
                <input
                  type="text" required
                  placeholder="123 Main St, City, State ZIP"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = P.gold}
                  onBlur={e => e.target.style.borderColor = P.border}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Special Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Gate code, pets, parking notes, areas to focus on..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = P.gold}
                  onBlur={e => e.target.style.borderColor = P.border}
                />
              </div>
            </Card>

            <Card style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.muted, marginBottom: 14 }}>A Few More Things</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>How did you hear about us?</label>
                <select
                  value={form.heardFrom}
                  onChange={e => set('heardFrom', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Select one…</option>
                  {['Google Search','Facebook / Instagram','Nextdoor','Friend / Referral','Yelp','Flyer / Door Hanger','Other'].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: P.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Preferred contact method</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['email', 'phone', 'text'].map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: P.text }}>
                      <input type="radio" name="prefComm" value={m} checked={form.prefComm === m} onChange={() => set('prefComm', m)} style={{ accentColor: P.gold }} />
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card style={{ marginBottom: 24, background: P.goldLight, borderColor: P.goldBorder }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: P.sub, marginBottom: 10 }}>Booking Summary</div>
              {[
                ['Service',  serviceOpt?.label],
                ['Date',     date],
                ['Time',     time],
                ['Duration', `~${serviceOpt?.durationHr} hrs`],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: `1px solid ${P.goldBorder}40` }}>
                  <span style={{ color: P.sub }}>{lbl}</span>
                  <strong style={{ color: P.text }}>{val}</strong>
                </div>
              ))}
            </Card>

            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '14px 0', background: P.gold, color: '#fff8ee', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.75 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {submitting
                ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.65s linear infinite' }} /> Submitting...</>
                : <><Check size={18} /> Request Booking</>
              }
            </button>
            <p style={{ fontSize: 12, color: P.muted, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
              Your booking is a request — we'll confirm availability and send a confirmation.
              {email && <> Questions? <a href={`mailto:${email}`} style={{ color: P.gold }}>{email}</a>.</>}
            </p>
          </form>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select, button { font-family: inherit; }
        select option { background: #fff; color: #3D2B1A; }
      `}</style>
    </div>
  )
}
