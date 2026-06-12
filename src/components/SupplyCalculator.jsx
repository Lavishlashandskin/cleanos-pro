import { useState } from 'react'
import { Package, Sparkles, Check, Truck, Wrench, Hammer } from 'lucide-react'
import { calculateSupplies } from '../lib/aiPlaceholders.js'
import { useService } from '../context/ServiceContext.jsx'

const JOB_TYPES_BY_SERVICE = {
  cleaning: [
    { id: 'residential', label: 'Residential Clean' },
    { id: 'commercial',  label: 'Commercial Clean' },
    { id: 'airbnb',      label: 'Airbnb Turnover' },
    { id: 'moveout',     label: 'Move-Out Deep Clean' },
  ],
  moving: [
    { id: 'studio',      label: 'Studio / 1 BR' },
    { id: '2br',         label: '2–3 Bedroom' },
    { id: '4br',         label: '4+ Bedroom / Large' },
    { id: 'office',      label: 'Office / Commercial' },
  ],
  handyman: [
    { id: 'plumbing',    label: 'Plumbing' },
    { id: 'electrical',  label: 'Electrical' },
    { id: 'drywall',     label: 'Drywall / Painting' },
    { id: 'general',     label: 'General Repairs' },
  ],
}

const FIELDS_BY_SERVICE = {
  cleaning: { showBedsBaths: true,  showSqft: true,  sqftLabel: 'Square Footage (optional)' },
  moving:   { showBedsBaths: false, showSqft: false, sqftLabel: '' },
  handyman: { showBedsBaths: false, showSqft: false, sqftLabel: '' },
}

const LABELS_BY_SERVICE = {
  cleaning: {
    title: 'Supply Calculator',
    subtitle: 'Tell it the job. Get a complete, categorized supply list — nothing forgotten, nothing wasted.',
    btnLabel: 'Generate Supply List',
    emptyLabel: 'Set your job details and generate a complete supply list, organized by category.',
    loadingLabel: 'Building your supply list...',
  },
  moving: {
    title: 'Moving Checklist',
    subtitle: 'Tell it the move size. Get a full packing materials and equipment checklist.',
    btnLabel: 'Generate Moving Checklist',
    emptyLabel: 'Set the move size and generate a complete materials and equipment checklist.',
    loadingLabel: 'Building your moving checklist...',
  },
  handyman: {
    title: 'Tool & Materials List',
    subtitle: 'Tell it the job type. Get a complete tool and materials list.',
    btnLabel: 'Generate Tool List',
    emptyLabel: 'Set the job type and generate a complete tool and materials checklist.',
    loadingLabel: 'Building your tool list...',
  },
}

export default function SupplyCalculator() {
  const { serviceType } = useService()
  const types   = JOB_TYPES_BY_SERVICE[serviceType] || JOB_TYPES_BY_SERVICE.cleaning
  const fields  = FIELDS_BY_SERVICE[serviceType]    || FIELDS_BY_SERVICE.cleaning
  const labels  = LABELS_BY_SERVICE[serviceType]    || LABELS_BY_SERVICE.cleaning

  const [form, setForm] = useState({
    type: types[0].id,
    sqft: '',
    bedrooms: '3',
    bathrooms: '2',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Reset form type when service type changes
  const jobTypes = types
  const currentTypeValid = jobTypes.some(t => t.id === form.type)
  const effectiveType = currentTypeValid ? form.type : jobTypes[0].id

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)
    const res = await calculateSupplies({ ...form, type: effectiveType, serviceType })
    setResult(res)
    setLoading(false)
  }

  const totalItems = result?.categories.reduce((s, c) => s + c.items.length, 0) || 0

  return (
    <div>
      <div className="page-header">
        <h1>{labels.title} <span className="text-gold">— Checklist</span></h1>
        <p>{labels.subtitle}</p>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Job Details</div>

          <div className="form-group">
            <label className="form-label">Job Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {jobTypes.map(t => (
                <div
                  key={t.id}
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${effectiveType === t.id ? 'var(--gold)' : 'var(--border)'}`,
                    background: effectiveType === t.id ? 'var(--gold-muted)' : 'var(--bg-input)',
                    color: effectiveType === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {fields.showBedsBaths && (
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}>
                  {['0','1','2','3','4','5','6+'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bathrooms</label>
                <select value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}>
                  {['1','1.5','2','2.5','3','4+'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}

          {fields.showSqft && (
            <div className="form-group mt-2">
              <label className="form-label">{fields.sqftLabel}</label>
              <input
                type="number"
                placeholder="e.g. 2200"
                value={form.sqft}
                onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))}
              />
            </div>
          )}

          <button
            className="btn btn-primary w-full mt-2"
            style={{ justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Building list...</>
              : <><Package size={15} /> {labels.btnLabel}</>}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Package size={32} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
              <p className="text-muted">{labels.emptyLabel}</p>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="loading-row">
                <span className="spinner" />
                <span>{labels.loadingLabel}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="card-title">{jobTypes.find(t => t.id === effectiveType)?.label} — {serviceType === 'cleaning' ? 'Supply List' : serviceType === 'moving' ? 'Packing List' : 'Tool List'}</div>
                  <div className="text-xs text-muted mt-1">{totalItems} items · Est. {result.estimatedWeight}</div>
                </div>
              </div>

              {result.categories.map((cat, i) => (
                <div key={i} className="supply-category">
                  <div className="supply-category-name">{cat.name}</div>
                  {cat.items.map((item, j) => (
                    <div key={j} className="supply-item">
                      <Check size={13} className="supply-check" />
                      <div style={{ flex: 1 }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                        {item.note && <span className="supply-note">{item.note}</span>}
                      </div>
                      <span className="supply-qty">{item.qty}</span>
                    </div>
                  ))}
                </div>
              ))}

              {result.notes && (
                <div className="alert alert-info" style={{ marginBottom: 0, marginTop: 8 }}>
                  <Package size={13} />
                  <span>{result.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
