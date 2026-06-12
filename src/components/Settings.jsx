import { useState } from 'react'
import {
  Check, RotateCcw, AlertTriangle, CreditCard, ShieldCheck,
  MapPin, Plus, Trash2, Globe, Sparkles, Truck, Wrench,
  Home, Building2, PlaneTakeoff, Clock, Zap, Package,
  Paintbrush, Hammer, Plug, Droplets, Layers, TreePine,
  DollarSign, Percent, Car, ArrowRight, User, Mail, Phone,
  Link2, Key, Send, Eye, EyeOff, ChevronDown, X, Bell,
} from 'lucide-react'
import { usePricing, DEFAULTS_BY_TYPE } from '../context/PricingContext.jsx'
import { useService, SERVICE_CONFIG } from '../context/ServiceContext.jsx'
import { useSubscription, SUBSCRIPTION_STATES } from '../context/SubscriptionContext.jsx'
import { useLocation } from '../context/LocationContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { isConfigured as mapsConfigured } from '../lib/googleMaps.js'
import { workers } from '../data/sampleData.js'

// ── Shared field components ───────────────────────────────────────────────────
const PriceField = ({ label, value, onChange, suffix = '', prefix = '$', step = 1, hint }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="form-label">{label}</label>
    {hint && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{hint}</div>}
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>{prefix}</span>
      )}
      <input
        type="number" min="0" step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ paddingLeft: prefix ? 22 : 12, paddingRight: suffix ? 48 : 12 }}
      />
      {suffix && (
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }}>{suffix}</span>
      )}
    </div>
  </div>
)

const SectionHeader = ({ icon: Icon, title, color = 'var(--gold)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} style={{ color }} />
    </div>
    <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
  </div>
)

const ExampleRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 13 }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <strong style={{ color: 'var(--gold)' }}>${value}</strong>
  </div>
)

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ title, icon: Icon, iconColor = 'var(--gold)', defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0, textAlign: 'left' }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${iconColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{title}</span>
        {badge != null && <span style={{ marginRight: 6 }}>{badge}</span>}
        <ChevronDown
          size={16}
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
        />
      </button>
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Integration status badge ──────────────────────────────────────────────────
function StatusBadge({ connected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: connected ? '#22c55e22' : 'color-mix(in srgb, var(--danger) 15%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {connected
          ? <Check size={11} style={{ color: '#22c55e' }} />
          : <X size={11} style={{ color: 'var(--danger)' }} />}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: connected ? '#22c55e' : 'var(--text-muted)' }}>
        {connected ? 'Connected' : 'Not set up'}
      </span>
    </div>
  )
}

// ── Cleaning Pricing ──────────────────────────────────────────────────────────
function CleaningPricing({ form, set, setAddOn }) {
  const eg3bd2ba = form.standardBase + 3 * form.perBedroom + Math.max(0, 2 - 1) * form.perBathroom
  const egDeep   = eg3bd2ba + form.deepCleanSurcharge

  return (
    <>
      <div className="card mb-4">
        <SectionHeader icon={Home} title="Standard Clean — Base Rates" />
        <div className="form-row">
          <PriceField label="Base price" value={form.standardBase} onChange={v => set('standardBase', v)} suffix="flat" />
          <PriceField label="Per bedroom" value={form.perBedroom}  onChange={v => set('perBedroom', v)}  suffix="/bd" />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Per bathroom (above 1st)" value={form.perBathroom}       onChange={v => set('perBathroom', v)}       suffix="/ba" />
          <PriceField label="Deep clean surcharge"     value={form.deepCleanSurcharge} onChange={v => set('deepCleanSurcharge', v)} suffix="add-on" />
        </div>
        <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>Live Example</div>
          <ExampleRow label="3 bed / 2 bath standard" value={eg3bd2ba} />
          <ExampleRow label="3 bed / 2 bath + deep clean" value={egDeep} />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={PlaneTakeoff} title="Specialty Service Rates" />
        <div className="form-row">
          <PriceField label="Move-in / Move-out (flat)" value={form.moveInOut}    onChange={v => set('moveInOut', v)}    suffix="flat" />
          <PriceField label="Airbnb turnover (flat)"    value={form.airbnb}       onChange={v => set('airbnb', v)}       suffix="flat" />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Organizing (hourly)"       value={form.organizing}   onChange={v => set('organizing', v)}   suffix="/hr" />
          <PriceField label="General hourly rate"       value={form.hourlyRate}   onChange={v => set('hourlyRate', v)}   suffix="/hr" />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={Plus} title="Add-On Prices" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <PriceField label="Oven interior"    value={form.addOns.oven}        onChange={v => setAddOn('oven', v)}        suffix="" />
          <PriceField label="Fridge interior"  value={form.addOns.fridge}      onChange={v => setAddOn('fridge', v)}      suffix="" />
          <PriceField label="Interior windows" value={form.addOns.windows}     onChange={v => setAddOn('windows', v)}     suffix="" />
          <PriceField label="Laundry (1 load)" value={form.addOns.laundry}     onChange={v => setAddOn('laundry', v)}     suffix="" />
          <PriceField label="Baseboard detail" value={form.addOns.baseboards}  onChange={v => setAddOn('baseboards', v)}  suffix="" />
          <PriceField label="Garage"           value={form.addOns.garage}      onChange={v => setAddOn('garage', v)}      suffix="" />
        </div>
      </div>
    </>
  )
}

// ── Moving Pricing ────────────────────────────────────────────────────────────
const TRUCK_LABELS = {
  van:    { label: 'Cargo Van',   desc: 'Studio / 1BR' },
  small:  { label: '10-ft Truck', desc: '1–2 Bedroom' },
  medium: { label: '15-ft Truck', desc: '2–3 Bedroom' },
  large:  { label: '20-ft Truck', desc: '3–4 Bedroom' },
  xl:     { label: '26-ft Truck', desc: '4+ BR / Large' },
}

function MovingPricing({ form, set, setNested }) {
  const eg2mover4hr = 2 * form.laborPerMoverHour * 4 + (form.trucks?.medium ?? 100) + form.fuelSurcharge
  const eg3mover6hr = 3 * form.laborPerMoverHour * 6 + (form.trucks?.large ?? 125) + form.fuelSurcharge

  return (
    <>
      <div className="card mb-4">
        <SectionHeader icon={Clock} title="Labor Rates" />
        <div className="form-row">
          <PriceField label="Per mover, per hour" value={form.laborPerMoverHour} onChange={v => set('laborPerMoverHour', v)} suffix="/hr" />
          <PriceField label="Minimum hours"       value={form.minimumHours}      onChange={v => set('minimumHours', v)}      suffix="hrs" prefix="" />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Minimum crew size"   value={form.minimumMovers}     onChange={v => set('minimumMovers', v)}     suffix="movers" prefix="" />
          <PriceField label="Packing service"     value={form.packingHourly}     onChange={v => set('packingHourly', v)}     suffix="/hr" />
        </div>
        <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>Live Example</div>
          <ExampleRow label="2 movers · 15-ft truck · 4 hrs" value={eg2mover4hr} />
          <ExampleRow label="3 movers · 20-ft truck · 6 hrs" value={eg3mover6hr} />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={Truck} title="Truck Fees" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {Object.entries(TRUCK_LABELS).map(([key, { label, desc }]) => (
            <PriceField
              key={key}
              label={label}
              hint={desc}
              value={form.trucks?.[key] ?? 0}
              onChange={v => setNested('trucks', key, v)}
              suffix="flat"
            />
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={DollarSign} title="Fees & Surcharges" />
        <div className="form-row">
          <PriceField label="Fuel surcharge"       value={form.fuelSurcharge}   onChange={v => set('fuelSurcharge', v)}   suffix="flat" />
          <PriceField label="Per-mile rate"        value={form.perMileRate}     onChange={v => set('perMileRate', v)}     suffix="/mi" step={0.25} />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Stair surcharge"      value={form.stairSurcharge}  onChange={v => set('stairSurcharge', v)}  suffix="flat" />
          <PriceField label="Long carry fee"       value={form.longCarryFee}    onChange={v => set('longCarryFee', v)}    suffix="flat" hint=">75 ft carry" />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Disassembly / reassembly" value={form.disassemblyFee} onChange={v => set('disassemblyFee', v)} suffix="flat" />
          <PriceField label="Storage (per day)"        value={form.storagePerDay}  onChange={v => set('storagePerDay', v)}  suffix="/day" />
        </div>
      </div>
    </>
  )
}

// ── Handyman Pricing ──────────────────────────────────────────────────────────
const SPECIALTY_META = {
  plumbing:   { label: 'Plumbing',     Icon: Droplets },
  electrical: { label: 'Electrical',   Icon: Plug },
  hvac:       { label: 'HVAC',         Icon: Zap },
  drywall:    { label: 'Drywall',      Icon: Layers },
  painting:   { label: 'Painting',     Icon: Paintbrush },
  carpentry:  { label: 'Carpentry',    Icon: Hammer },
  tile:       { label: 'Tile & Grout', Icon: Building2 },
  roofing:    { label: 'Roofing',      Icon: TreePine },
}

function HandymanPricing({ form, set, setNested }) {
  const eg2hr      = Math.max(form.minimumCharge, form.laborHourly * 2)
  const egEmerg2hr = Math.max(form.minimumCharge, form.emergencyRate * 2)

  return (
    <>
      <div className="card mb-4">
        <SectionHeader icon={Clock} title="Base Labor Rates" />
        <div className="form-row">
          <PriceField label="Standard hourly rate"  value={form.laborHourly}    onChange={v => set('laborHourly', v)}    suffix="/hr" />
          <PriceField label="Minimum charge"        value={form.minimumCharge}  onChange={v => set('minimumCharge', v)}  suffix="flat" />
        </div>
        <div className="form-row mt-3">
          <PriceField label="Minimum hours"         value={form.minimumHours}   onChange={v => set('minimumHours', v)}   suffix="hrs" prefix="" step={0.5} />
          <PriceField label="Trip / dispatch fee"   value={form.tripFee}        onChange={v => set('tripFee', v)}        suffix="flat" />
        </div>
        <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>Live Example</div>
          <ExampleRow label="2-hr standard job (before materials)" value={eg2hr} />
          <ExampleRow label="2-hr emergency call-out"              value={egEmerg2hr} />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={AlertTriangle} title="Surcharges" color="var(--danger)" />
        <div className="form-row">
          <PriceField label="Emergency / after-hours rate" value={form.emergencyRate}     onChange={v => set('emergencyRate', v)}     suffix="/hr" />
          <PriceField label="Weekend surcharge"            value={form.weekendSurcharge}  onChange={v => set('weekendSurcharge', v)}  suffix="flat" />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={Package} title="Materials Markup" />
        <div style={{ maxWidth: 240 }}>
          <PriceField
            label="Materials markup"
            value={form.materialsMarkup}
            onChange={v => set('materialsMarkup', v)}
            suffix="%"
            prefix=""
            hint={`e.g. $100 in materials → billed at $${(100 * (1 + form.materialsMarkup / 100)).toFixed(0)}`}
          />
        </div>
      </div>

      <div className="card mb-4">
        <SectionHeader icon={Wrench} title="Specialty Labor Rates" />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, marginTop: -6 }}>Override the base hourly rate for specific trade work.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {Object.entries(SPECIALTY_META).map(([key, { label, Icon: SIcon }]) => (
            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <SIcon size={11} style={{ color: 'var(--text-muted)' }} />
                {label}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>$</span>
                <input
                  type="number" min="0"
                  value={form.specialty?.[key] ?? 0}
                  onChange={e => setNested('specialty', key, Number(e.target.value))}
                  style={{ paddingLeft: 22, paddingRight: 42 }}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }}>/hr</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Zone Manager (content only — accordion wrapper is in Settings) ─────────────
function ZoneManager() {
  const { zones, businessInfo, addZone, updateZone, removeZone, setBusinessInfo } = useLocation()
  const [showForm, setShowForm] = useState(false)
  const [bizForm, setBizForm]   = useState(businessInfo)
  const [bizSaved, setBizSaved] = useState(false)
  const [zoneForm, setZoneForm] = useState({ label: '', zipsRaw: '', keywordsRaw: '' })

  const handleSaveBiz = () => {
    setBusinessInfo(bizForm)
    setBizSaved(true)
    setTimeout(() => setBizSaved(false), 2000)
  }

  const handleAddZone = () => {
    if (!zoneForm.label) return
    addZone({ ...zoneForm, workers: [] })
    setZoneForm({ label: '', zipsRaw: '', keywordsRaw: '' })
    setShowForm(false)
  }

  return (
    <>
      {/* What zones do */}
      <div style={{ padding: '12px 14px', background: 'var(--gold-muted)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <MapPin size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)' }}>What are service zones?</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Zones route jobs to the right workers based on a client's address or ZIP code. When a booking comes in, CleanOS matches it to the closest zone and alerts the assigned workers — keeping your team organized by area without manual assignment.
        </p>
      </div>

      {/* Business info for routing */}
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Routing Origin</div>
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
          <label className="form-label">Base Address (route origin for distance calculations)</label>
          <input value={bizForm.baseAddress || ''} onChange={e => setBizForm(f => ({ ...f, baseAddress: e.target.value }))} placeholder="e.g. 123 Main St, Reno NV 89501" />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSaveBiz}>
          {bizSaved ? <><Check size={12} /> Saved</> : 'Save Routing Info'}
        </button>
      </div>

      {!mapsConfigured() && (
        <div className="alert alert-info mb-4" style={{ fontSize: 12 }}>
          <Globe size={13} />
          <div>
            <strong>Google Maps not configured.</strong> Add <code>VITE_GOOGLE_MAPS_KEY</code> to <code>.env</code> or paste your key in Integrations to enable live geocoding and distance calculation.
          </div>
        </div>
      )}

      {/* Zone cards */}
      {zones.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          No zones yet. Add your first zone below.
        </div>
      )}

      {zones.map(z => (
        <div
          key={z.id}
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{z.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {z.zips?.length
                  ? <><strong style={{ color: 'var(--text-secondary)' }}>ZIPs:</strong> {z.zips.join(', ')}</>
                  : <em>No ZIPs configured</em>}
              </div>
              {z.keywords?.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Keywords: {z.keywords.slice(0, 4).join(', ')}{z.keywords.length > 4 ? '…' : ''}
                </div>
              )}
            </div>
            <button
              onClick={() => removeZone(z.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              title="Remove zone"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Assigned Workers
            </div>
            {workers.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No workers found.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {workers.map(w => {
                    const assigned = (z.workers || []).includes(w.id)
                    return (
                      <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={assigned}
                          onChange={() => {
                            const curr = z.workers || []
                            updateZone(z.id, { workers: assigned ? curr.filter(id => id !== w.id) : [...curr, w.id] })
                          }}
                          style={{ cursor: 'pointer', accentColor: 'var(--gold)', width: 14, height: 14 }}
                        />
                        <span style={{ color: assigned ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{w.name}</span>
                      </label>
                    )
                  })}
                </div>
              )
            }
          </div>
        </div>
      ))}

      {/* Add zone form */}
      {showForm && (
        <div style={{ marginTop: 4, padding: '14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>New Zone</div>
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
          <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
            <label className="form-label">Address Keywords (comma-separated)</label>
            <input value={zoneForm.keywordsRaw} onChange={e => setZoneForm(f => ({ ...f, keywordsRaw: e.target.value }))} placeholder="e.g. summit ridge, pinecrest, autumn sage" />
          </div>
          <div className="flex gap-3 mt-3">
            <button className="btn btn-primary btn-sm" disabled={!zoneForm.label} onClick={handleAddZone}><Check size={13} /> Add Zone</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <button className="btn btn-secondary btn-sm" style={{ marginTop: 4 }} onClick={() => setShowForm(s => !s)}>
        <Plus size={13} /> Add Zone
      </button>
    </>
  )
}

// ── Service type selector icons ───────────────────────────────────────────────
const TYPE_ICONS = {
  cleaning: Sparkles,
  moving:   Truck,
  handyman: Wrench,
}
const TYPE_SUBTITLES = {
  cleaning: 'Cleans, tips, schedules',
  moving:   'Moves, inventory, estimates',
  handyman: 'Repairs, materials, warranties',
}

// ── Business Profile (renders Profile + Integrations accordions) ──────────────
function BusinessProfile() {
  const { profile, saveProfile } = useProfile()
  const [form, setForm]     = useState({ ...profile })
  const [saved, setSaved]   = useState(false)
  const [showSG, setShowSG] = useState(false)
  const [showMaps, setShowMaps] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    saveProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sgConnected    = !!form.sendgridKey
  const mapsConnected  = !!(form.googleMapsKey || mapsConfigured())
  const connectedCount = (sgConnected ? 1 : 0) + (mapsConnected ? 1 : 0)

  const integBadge = connectedCount > 0
    ? <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{connectedCount} connected</span>
    : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Not configured</span>

  return (
    <>
      {/* ── Business Profile accordion ── */}
      <Accordion title="Business Profile" icon={User} defaultOpen={true}>
        <p className="text-sm text-muted mb-4" style={{ marginTop: -4 }}>
          Your name and business info appear throughout the app and in all client communications.
        </p>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Name</label>
            <input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Ashley" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Role / Title</label>
            <input value={form.ownerRole} onChange={e => set('ownerRole', e.target.value)} placeholder="Owner · CEO" />
          </div>
        </div>
        <div className="form-group mt-3">
          <label className="form-label">Business Name</label>
          <input value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Reno Reset Cleaning" />
        </div>
        <div className="form-row mt-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Business Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="hello@yourbusiness.com" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Business Phone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 555-0100" />
          </div>
        </div>
        <div className="form-group mt-3" style={{ marginBottom: 0 }}>
          <label className="form-label">Website</label>
          <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourbusiness.com" />
        </div>
        <div className="flex gap-3 items-center mt-4">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save Profile'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Changes appear throughout the app.</span>}
        </div>
      </Accordion>

      {/* ── Integrations accordion ── */}
      <Accordion title="Integrations" icon={Link2} badge={integBadge}>
        <p className="text-sm text-muted mb-4" style={{ marginTop: -4 }}>
          API keys for email delivery and maps. Stored locally in your browser — never sent to our servers.
        </p>

        {/* SendGrid */}
        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gold)22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={13} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>SendGrid Email</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real email delivery for Auto Comms</div>
              </div>
            </div>
            <StatusBadge connected={sgConnected} />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showSG ? 'text' : 'password'}
              value={form.sendgridKey}
              onChange={e => set('sendgridKey', e.target.value)}
              placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowSG(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              {showSG ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Google Maps */}
        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gold)22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={13} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Google Maps API</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Geocoding, GPS distance, route optimization</div>
              </div>
            </div>
            <StatusBadge connected={mapsConnected} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            Also configurable via <code>VITE_GOOGLE_MAPS_KEY</code> in <code>.env</code>.
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type={showMaps ? 'text' : 'password'}
              value={form.googleMapsKey}
              onChange={e => set('googleMapsKey', e.target.value)}
              placeholder="AIzaSy…"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowMaps(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
            >
              {showMaps ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save Integrations'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>API keys updated.</span>}
        </div>
      </Accordion>
    </>
  )
}

// ── Main Settings component ───────────────────────────────────────────────────
export default function Settings() {
  const { pricingAll, savePricingForType, resetToDefaults } = usePricing()
  const { serviceType, setServiceType } = useService()
  const { state: subState, simulateFailedPayment, simulateSuspend, simulateCancel, setState: setSubState } = useSubscription()

  const [forms, setForms] = useState({
    cleaning: pricingAll.cleaning,
    moving:   pricingAll.moving,
    handyman: pricingAll.handyman,
  })
  const [saved, setSaved] = useState(false)

  const form      = forms[serviceType]
  const set       = (key, val) => setForms(fs => ({ ...fs, [serviceType]: { ...fs[serviceType], [key]: val } }))
  const setNested = (parent, key, val) => setForms(fs => ({ ...fs, [serviceType]: { ...fs[serviceType], [parent]: { ...(fs[serviceType][parent] || {}), [key]: val } } }))
  const setAddOn  = (key, val) => setNested('addOns', key, val)

  const handleSave = () => {
    savePricingForType(serviceType, form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setForms(fs => ({ ...fs, [serviceType]: DEFAULTS_BY_TYPE[serviceType] }))
    resetToDefaults(serviceType)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Tap a section to expand it. Business profile is a good place to start.</p>
      </div>

      <div style={{ maxWidth: 680 }}>

        {/* Business Profile + Integrations (two accordions, profile open by default) */}
        <BusinessProfile />

        {/* Service Type — always visible, not in accordion list */}
        <div className="card mb-4">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Business Type</div>
          <p className="text-sm text-muted mb-4">Switches the sidebar, modules, and pricing fields for your service.</p>
          <div className="service-type-grid">
            {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => {
              const Icon   = TYPE_ICONS[key]
              const active = serviceType === key
              return (
                <button
                  key={key}
                  className={`service-type-btn${active ? ' active' : ''}`}
                  onClick={() => setServiceType(key)}
                >
                  <Icon size={22} style={{ color: active ? 'var(--gold)' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{cfg.label}</span>
                  <span style={{ fontSize: 11, color: active ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {TYPE_SUBTITLES[key]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pricing accordion */}
        <Accordion
          title={`${SERVICE_CONFIG[serviceType]?.label || 'Service'} Pricing`}
          icon={DollarSign}
        >
          {serviceType === 'cleaning'  && <CleaningPricing form={form} set={set} setAddOn={setAddOn} />}
          {serviceType === 'moving'    && <MovingPricing   form={form} set={set} setNested={setNested} />}
          {serviceType === 'handyman'  && <HandymanPricing form={form} set={set} setNested={setNested} />}
          <div className="flex gap-3 items-center mt-2 mb-2">
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? <><Check size={14} /> Saved!</> : `Save ${SERVICE_CONFIG[serviceType].label} Pricing`}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={13} /> Reset to defaults
            </button>
            {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Pricing saved — quotes will update.</span>}
          </div>
        </Accordion>

        {/* Service Zones accordion */}
        <Accordion title="Service Zones" icon={MapPin}>
          <ZoneManager />
        </Accordion>

        {/* Notifications accordion */}
        <Accordion title="Notifications" icon={Bell}>
          <p className="text-sm text-muted" style={{ marginTop: -4 }}>
            Configure when and how you get alerts — booking requests, job reminders, payment failures, and worker updates.
          </p>
          <div style={{ padding: '20px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', marginTop: 12 }}>
            <Bell size={24} style={{ color: 'var(--gold)', opacity: 0.4, margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Notification settings coming soon</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Push notifications, email digests, and SMS alerts are on the roadmap.
            </p>
          </div>
        </Accordion>

        {/* Subscription — always visible */}
        <div className="card mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CreditCard size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Subscription Status</span>
          </div>
          <p className="text-sm text-muted mb-4">
            Current plan: <strong>CleanOS Pro</strong> · $49/month ·{' '}
            <span style={{ color: subState === 'active' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, textTransform: 'capitalize' }}>
              {SUBSCRIPTION_STATES[subState]?.label || subState}
            </span>
          </p>

          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <strong style={{ fontSize: 13 }}>Data Retention Policy</strong>
            </div>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
              Your data is <strong>never deleted</strong> without your explicit request. Cancelled accounts retain all data for a minimum of 24 months. Suspended accounts stay in read-only mode with full data intact.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div className="text-xs text-muted mb-3" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo: Simulate Subscription State</div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSubState('active')}>
                <Check size={12} /> Active
              </button>
              <button className="btn btn-ghost btn-sm" onClick={simulateFailedPayment} style={{ borderColor: '#D4B86A', color: '#9A7020' }}>
                <AlertTriangle size={12} /> Payment Failure
              </button>
              <button className="btn btn-ghost btn-sm" onClick={simulateSuspend} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                <AlertTriangle size={12} /> Suspended
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
