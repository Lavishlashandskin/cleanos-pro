import { useState } from 'react'
import { Sparkles, Copy, Check, Info, Plus, Trash2, Pencil } from 'lucide-react'
import { generateQuote } from '../lib/aiPlaceholders.js'
import { usePricing } from '../context/PricingContext.jsx'

const JOB_TYPES = [
  { id: 'standard',   label: 'Standard Clean' },
  { id: 'moveout',    label: 'Move-In / Out' },
  { id: 'airbnb',     label: 'Airbnb Turnover' },
  { id: 'organizing', label: 'Organizing' },
]

const EXTRAS = [
  { id: 'oven',       label: 'Oven interior' },
  { id: 'fridge',     label: 'Fridge interior' },
  { id: 'windows',    label: 'Interior windows' },
  { id: 'laundry',    label: 'Laundry (1 load)' },
  { id: 'baseboards', label: 'Baseboard detail' },
  { id: 'garage',     label: 'Garage' },
]

export default function ScopeIt() {
  const { pricing } = usePricing()

  const [form, setForm] = useState({
    jobType: 'standard',
    description: '',
    sqft: '',
    bedrooms: '3',
    bathrooms: '2',
    hours: '2',
    isDeepClean: false,
    extras: [],
  })
  const [loading, setLoading] = useState(false)
  const [lineItems, setLineItems] = useState(null)   // editable after generation
  const [meta, setMeta] = useState(null)             // duration, validFor, notes
  const [copied, setCopied] = useState(false)

  // new line item form
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')

  const toggleExtra = (id) =>
    setForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }))

  const handleGenerate = async () => {
    setLoading(true)
    setLineItems(null)
    const result = await generateQuote(form, pricing)
    setLineItems(result.lineItems.map((item, i) => ({ ...item, id: i })))
    setMeta({ duration: result.duration, validFor: result.validFor, notes: result.notes })
    setLoading(false)
  }

  const updateItem  = (id, field, val) => setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: field === 'price' ? Number(val) : val } : i))
  const removeItem  = (id) => setLineItems(prev => prev.filter(i => i.id !== id))
  const addItem     = () => {
    if (!newDesc.trim() || !newPrice) return
    setLineItems(prev => [...prev, { id: Date.now(), description: newDesc.trim(), price: Number(newPrice) }])
    setNewDesc('')
    setNewPrice('')
  }

  const total = lineItems ? lineItems.reduce((s, i) => s + (Number(i.price) || 0), 0) : 0

  const quoteText = lineItems
    ? ['CLEANING QUOTE — RENO RESET CLEANING CO.', '',
        ...lineItems.map(i => `  ${i.description}  ·  $${i.price}`),
        '', `TOTAL: $${total}`,
        meta?.duration ? `Est. Time: ${meta.duration}` : '',
        `Valid For: ${meta?.validFor || '14 days'}`,
        '', meta?.notes || '',
      ].filter(l => l !== undefined).join('\n')
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showBedBath = ['standard', 'moveout'].includes(form.jobType)

  return (
    <div>
      <div className="page-header">
        <h1>Scope It <span className="text-gold">— AI Quote Generator</span></h1>
        <p>Builds quotes from your saved rates. Edit any line before sending.</p>
      </div>

      <div className="two-col-wide">
        {/* ── Left: form ── */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Job Details</div>

          {/* Job type */}
          <div className="form-group">
            <label className="form-label">Service Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {JOB_TYPES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setForm(f => ({ ...f, jobType: t.id }))}
                  style={{
                    padding: '8px 12px', borderRadius: 'var(--radius)',
                    border: `1px solid ${form.jobType === t.id ? 'var(--gold)' : 'var(--border)'}`,
                    background: form.jobType === t.id ? 'var(--gold-muted)' : 'var(--bg-input)',
                    color: form.jobType === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    transition: 'all var(--transition)', textAlign: 'center',
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bed/bath for standard + moveout */}
          {showBedBath && (
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}>
                  {['1','2','3','4','5','6+'].map(n => <option key={n} value={n}>{n} bed{n !== '1' ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bathrooms</label>
                <select value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}>
                  {['1','1.5','2','2.5','3','3.5','4+'].map(n => <option key={n} value={n}>{n} bath{n !== '1' ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Hours for organizing */}
          {form.jobType === 'organizing' && (
            <div className="form-group mt-2">
              <label className="form-label">Estimated Hours</label>
              <select value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}>
                {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} hour{n !== '1' ? 's' : ''}</option>)}
              </select>
            </div>
          )}

          {/* Sq footage */}
          <div className="form-group mt-2">
            <label className="form-label">Square Footage (optional)</label>
            <input type="number" placeholder="e.g. 1800" value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} />
          </div>

          {/* Deep clean + add-ons for standard */}
          {form.jobType === 'standard' && (
            <div className="form-group">
              <label className="form-label">Add-Ons</label>
              <div className="checkbox-group">
                <label
                  className={`checkbox-item${form.isDeepClean ? ' checked' : ''}`}
                  onClick={() => setForm(f => ({ ...f, isDeepClean: !f.isDeepClean }))}
                >
                  Deep clean (+${pricing.deepCleanSurcharge})
                </label>
                {EXTRAS.map(e => (
                  <label
                    key={e.id}
                    className={`checkbox-item${form.extras.includes(e.id) ? ' checked' : ''}`}
                    onClick={() => toggleExtra(e.id)}
                  >
                    {e.label} (+${pricing.addOns[e.id] || '?'})
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn btn-primary w-full mt-2"
            style={{ justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Generating Quote...</> : <><Sparkles size={15} /> Generate Quote</>}
          </button>

          <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
            <Info size={13} />
            <span>Rates pulled from <strong>Pricing &amp; Settings</strong>. Change your rates there anytime.</span>
          </div>
        </div>

        {/* ── Right: result ── */}
        <div>
          {!lineItems && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Sparkles size={32} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
              <p className="text-muted">Fill in the job details and generate a quote. Every line item is editable before you send it.</p>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="loading-row"><span className="spinner" /> Building your quote...</div>
            </div>
          )}

          {lineItems && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="card-title">Your Quote</div>
                  <div className="text-xs text-muted mt-1">
                    <Pencil size={10} style={{ display: 'inline', marginRight: 3 }} />
                    Click any field to edit
                  </div>
                </div>
                <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Quote</>}
                </button>
              </div>

              {/* Editable line items */}
              {lineItems.map(item => (
                <div key={item.id} className="quote-item">
                  <div className="quote-item-desc">
                    <input
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="quote-item-price flex items-center gap-2">
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>$</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => updateItem(item.id, 'price', e.target.value)}
                      className="quote-item-price"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 2, cursor: 'pointer', flexShrink: 0 }}
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add line item */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Add line item..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                />
                <input
                  type="number"
                  placeholder="$0"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  style={{ width: 70, fontSize: 13, padding: '6px 10px' }}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                />
                <button className="btn btn-secondary btn-sm" onClick={addItem} style={{ flexShrink: 0 }}>
                  <Plus size={13} />
                </button>
              </div>

              <div className="quote-total">
                <span>Total</span>
                <span>${total}</span>
              </div>

              {meta && (
                <div className="flex gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
                  {meta.duration && <span className="badge badge-neutral">Est. {meta.duration}</span>}
                  <span className="badge badge-neutral">Valid {meta.validFor}</span>
                </div>
              )}

              {meta?.notes && (
                <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
                  <Info size={14} /><span>{meta.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
