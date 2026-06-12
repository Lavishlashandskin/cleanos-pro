import { useState, useEffect } from 'react'
import { Check, RotateCcw, AlertTriangle, CreditCard, ShieldCheck, MapPin, Plus, Trash2, Globe } from 'lucide-react'
import { usePricing, DEFAULT_PRICING } from '../context/PricingContext.jsx'
import { useService, SERVICE_CONFIG } from '../context/ServiceContext.jsx'
import { useSubscription, SUBSCRIPTION_STATES } from '../context/SubscriptionContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'
import { isConfigured as mapsConfigured } from '../lib/googleMaps.js'

const PriceField = ({ label, value, onChange, suffix = '/visit', prefix = '$' }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="form-label">{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>{prefix}</span>
      <input
        type="number" min="0" value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ paddingLeft: 22, paddingRight: suffix ? 52 : 12 }}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }}>{suffix}</span>
      )}
    </div>
  </div>
)

const PALETTE = ['#6E9E8A','#5E8FB5','#C8A040','#9B7BB0','#A86B6B','#7B9E6E','#C47D5A','#4A8FA8','#A89B4A','#7A7AB0']

function ZoneManager() {
  const { zones, businessInfo, addZone, updateZone, removeZone, setBusinessInfo } = useLocation()
  const [showForm, setShowForm] = useState(false)
  const [bizForm, setBizForm] = useState(businessInfo)
  const [bizSaved, setBizSaved] = useState(false)
  const [zoneForm, setZoneForm] = useState({ label: '', zipsRaw: '', keywordsRaw: '', color: PALETTE[0] })

  const handleSaveBiz = () => {
    setBusinessInfo(bizForm)
    setBizSaved(true)
    setTimeout(() => setBizSaved(false), 2000)
  }

  const handleAddZone = () => {
    if (!zoneForm.label) return
    addZone(zoneForm)
    setZoneForm({ label: '', zipsRaw: '', keywordsRaw: '', color: PALETTE[zones.length % PALETTE.length] })
    setShowForm(false)
  }

  return (
    <div className="card mb-4">
      <div className="card-title" style={{ marginBottom: 4 }}>
        <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />Service Zones
      </div>
      <p className="text-sm text-muted mb-4">Define the neighborhoods or zones you serve. Jobs auto-match to zones by ZIP code or address keywords for route optimization.</p>

      {/* Business base address */}
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Business Info</div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Business Name</label>
            <input value={bizForm.businessName || ''} onChange={e => setBizForm(f => ({ ...f, businessName: e.target.value }))} placeholder="e.g. Reno Reset Cleaning" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City / Market</label>
            <input value={bizForm.city || ''} onChange={e => setBizForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Reno, NV" />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 8, marginTop: 12 }}>
          <label className="form-label">Base Address (your home/office — used as route origin)</label>
          <input value={bizForm.baseAddress || ''} onChange={e => setBizForm(f => ({ ...f, baseAddress: e.target.value }))} placeholder="e.g. 123 Main St, Reno NV 89501" />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSaveBiz}>
          {bizSaved ? <><Check size={12} /> Saved</> : 'Save Business Info'}
        </button>
      </div>

      {/* Google Maps API key notice */}
      {!mapsConfigured() && (
        <div className="alert alert-info mb-4" style={{ fontSize: 12 }}>
          <Globe size={13} />
          <div>
            <strong>Google Maps not configured.</strong> Add <code>VITE_GOOGLE_MAPS_KEY=your_key</code> to your <code>.env</code> file to enable live geocoding, GPS distance calculation, and real route optimization.
            ZIP codes and address keywords work without a key.
          </div>
        </div>
      )}

      {/* Zone list */}
      {zones.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>No zones configured yet.</div>
      )}

      {zones.map(z => (
        <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{z.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {z.zips?.length ? `ZIPs: ${z.zips.join(', ')}` : 'No ZIPs'}
              {z.keywords?.length ? ` · Keywords: ${z.keywords.slice(0, 3).join(', ')}${z.keywords.length > 3 ? '…' : ''}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PALETTE.map(c => (
              <button key={c} onClick={() => updateZone(z.id, { color: c })} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: z.color === c ? '2px solid var(--text-primary)' : '1px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
          <button onClick={() => removeZone(z.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {showForm && (
        <div style={{ marginTop: 14, padding: '14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Zone Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input value={zoneForm.label} onChange={e => setZoneForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. NW Reno, Downtown, Eastside" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">ZIP Codes (comma-separated)</label>
              <input value={zoneForm.zipsRaw} onChange={e => setZoneForm(f => ({ ...f, zipsRaw: e.target.value }))} placeholder="e.g. 89523, 89519" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="form-label">Address Keywords (comma-separated — matches addresses containing these)</label>
            <input value={zoneForm.keywordsRaw} onChange={e => setZoneForm(f => ({ ...f, keywordsRaw: e.target.value }))} placeholder="e.g. summit ridge, pinecrest, autumn sage" />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Color:</span>
            {PALETTE.map(c => (
              <button key={c} onClick={() => setZoneForm(f => ({ ...f, color: c }))} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: zoneForm.color === c ? '2px solid var(--text-primary)' : '1px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
          <div className="flex gap-3 mt-3">
            <button className="btn btn-primary btn-sm" disabled={!zoneForm.label} onClick={handleAddZone}><Check size={13} /> Add Zone</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <button className="btn btn-secondary btn-sm mt-4" onClick={() => setShowForm(s => !s)}>
        <Plus size={13} /> Add Zone
      </button>
    </div>
  )
}

export default function Settings() {
  const { pricing, savePricing } = usePricing()
  const { serviceType, setServiceType } = useService()
  const { state: subState, simulateFailedPayment, simulateSuspend, simulateCancel, setState: setSubState } = useSubscription()
  const [form, setForm] = useState(pricing)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(pricing) }, [pricing])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setAddOn = (key, val) => setForm(f => ({ ...f, addOns: { ...f.addOns, [key]: val } }))

  const handleSave = () => {
    savePricing(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Business profile, service type, and pricing — all in one place.</p>
      </div>

      <div style={{ maxWidth: 680 }}>

        {/* Service Type */}
        <div className="card mb-4">
          <div className="card-title" style={{ marginBottom: 4 }}>Business Type</div>
          <p className="text-sm text-muted mb-4">Changes which modules and tools appear in the sidebar.</p>
          <div className="service-type-grid">
            {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                className={`service-type-btn${serviceType === key ? ' active' : ''}`}
                onClick={() => setServiceType(key)}
              >
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{cfg.label}</span>
                <span style={{ fontSize: 11, color: serviceType === key ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {key === 'cleaning' ? 'Cleans, tips, schedules' : key === 'moving' ? 'Moves, inventory, estimates' : 'Repairs, materials, warranties'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Clean */}
        <div className="card mb-4">
          <div className="card-title" style={{ marginBottom: 16 }}>Standard Clean — Base Rates</div>
          <div className="form-row">
            <PriceField label="Base price (flat)" value={form.standardBase} onChange={v => set('standardBase', v)} suffix="flat" />
            <PriceField label="Per bedroom" value={form.perBedroom} onChange={v => set('perBedroom', v)} suffix="/bd" />
          </div>
          <div className="form-row">
            <PriceField label="Per bathroom (above 1st)" value={form.perBathroom} onChange={v => set('perBathroom', v)} suffix="/ba" />
            <PriceField label="Deep clean surcharge" value={form.deepCleanSurcharge} onChange={v => set('deepCleanSurcharge', v)} suffix="add-on" />
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)' }}>
            Example: 3bd / 2ba standard clean = <strong style={{ color: 'var(--gold)' }}>${form.standardBase + 3 * form.perBedroom + Math.max(0, 2 - 1) * form.perBathroom}</strong>
            {' '}· with deep clean = <strong style={{ color: 'var(--gold)' }}>${form.standardBase + 3 * form.perBedroom + Math.max(0, 2 - 1) * form.perBathroom + form.deepCleanSurcharge}</strong>
          </div>
        </div>

        {/* Specialty */}
        <div className="card mb-4">
          <div className="card-title" style={{ marginBottom: 16 }}>Specialty Service Rates</div>
          <div className="form-row">
            <PriceField label="Move-in / Move-out (flat)" value={form.moveInOut} onChange={v => set('moveInOut', v)} suffix="flat" />
            <PriceField label="Airbnb turnover (flat)" value={form.airbnb} onChange={v => set('airbnb', v)} suffix="flat" />
          </div>
          <div className="form-row">
            <PriceField label="Organizing (hourly)" value={form.organizing} onChange={v => set('organizing', v)} suffix="/hr" />
            <PriceField label="Your hourly rate" value={form.hourlyRate} onChange={v => set('hourlyRate', v)} suffix="/hr" />
          </div>
        </div>

        {/* Add-ons */}
        <div className="card mb-4">
          <div className="card-title" style={{ marginBottom: 16 }}>Add-On Prices</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <PriceField label="Oven interior" value={form.addOns.oven} onChange={v => setAddOn('oven', v)} suffix="" />
            <PriceField label="Fridge interior" value={form.addOns.fridge} onChange={v => setAddOn('fridge', v)} suffix="" />
            <PriceField label="Interior windows" value={form.addOns.windows} onChange={v => setAddOn('windows', v)} suffix="" />
            <PriceField label="Laundry (1 load)" value={form.addOns.laundry} onChange={v => setAddOn('laundry', v)} suffix="" />
            <PriceField label="Baseboard detail" value={form.addOns.baseboards} onChange={v => setAddOn('baseboards', v)} suffix="" />
            <PriceField label="Garage" value={form.addOns.garage} onChange={v => setAddOn('garage', v)} suffix="" />
          </div>
        </div>

        {/* Service Zones */}
        <ZoneManager />

        {/* Save */}
        <div className="flex gap-3 items-center mb-4">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save Pricing'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setForm(DEFAULT_PRICING)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCcw size={13} /> Reset to defaults
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Pricing saved — all quotes will update.</span>}
        </div>

        {/* Subscription */}
        <div className="card mb-4">
          <div className="card-title" style={{ marginBottom: 4 }}>Subscription Status</div>
          <p className="text-sm text-muted mb-4">
            Current plan: <strong>CleanOS Pro</strong> · $49/month ·{' '}
            <span style={{ color: subState === 'active' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, textTransform: 'capitalize' }}>
              {SUBSCRIPTION_STATES[subState]?.label || subState}
            </span>
          </p>

          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14, fontSize: 13 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <strong>Data Retention Policy</strong>
            </div>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
              Your data is <strong>never deleted</strong> without your explicit request. Cancelled accounts retain all data for a minimum of 24 months. Suspended accounts remain in read-only mode with full data intact. You can reactivate at any time.
            </p>
          </div>

          {/* Demo subscription state simulator */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div className="text-xs text-muted mb-3" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo: Simulate Subscription State</div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSubState('active')}>
                <Check size={12} /> Active
              </button>
              <button className="btn btn-ghost btn-sm" onClick={simulateFailedPayment} style={{ borderColor: '#D4B86A', color: '#9A7020' }}>
                <AlertTriangle size={12} /> Simulate Payment Failure
              </button>
              <button className="btn btn-ghost btn-sm" onClick={simulateSuspend} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <AlertTriangle size={12} /> Simulate Suspension
              </button>
              <button className="btn btn-ghost btn-sm" onClick={simulateCancel}>
                Cancel Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
