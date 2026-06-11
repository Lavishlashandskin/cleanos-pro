import { useState } from 'react'
import { Package, Sparkles, Check, Printer } from 'lucide-react'
import { calculateSupplies } from '../lib/aiPlaceholders.js'

const JOB_TYPES = [
  { id: 'residential', label: 'Residential Clean' },
  { id: 'commercial',  label: 'Commercial Clean' },
  { id: 'airbnb',      label: 'Airbnb Turnover' },
  { id: 'moveout',     label: 'Move-Out Deep Clean' },
]

export default function SupplyCalculator() {
  const [form, setForm] = useState({
    type: 'residential',
    sqft: '',
    bedrooms: '3',
    bathrooms: '2',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)
    const res = await calculateSupplies(form)
    setResult(res)
    setLoading(false)
  }

  const totalItems = result?.categories.reduce((s, c) => s + c.items.length, 0) || 0

  return (
    <div>
      <div className="page-header">
        <h1>Supply Calculator <span className="text-gold">— Packing List</span></h1>
        <p>Tell it the job. Get a complete, categorized supply list — nothing forgotten, nothing wasted.</p>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Job Details</div>

          <div className="form-group">
            <label className="form-label">Job Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {JOB_TYPES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${form.type === t.id ? 'var(--gold)' : 'var(--border)'}`,
                    background: form.type === t.id ? 'var(--gold-muted)' : 'var(--bg-input)',
                    color: form.type === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

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

          <div className="form-group mt-2">
            <label className="form-label">Square Footage (optional)</label>
            <input
              type="number"
              placeholder="e.g. 2200"
              value={form.sqft}
              onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))}
            />
          </div>

          <button
            className="btn btn-primary w-full mt-2"
            style={{ justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" /> Building list...</>
              : <><Package size={15} /> Generate Packing List</>}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <Package size={32} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
              <p className="text-muted">Set your job details and generate a complete supply list, organized by category.</p>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="loading-row">
                <span className="spinner" />
                <span>Building your packing list...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="card-title">{JOB_TYPES.find(t => t.id === form.type)?.label} — Supply List</div>
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
