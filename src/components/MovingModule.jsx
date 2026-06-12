import { useState } from 'react'
import { Truck, Plus, MapPin, Users, Package, Calculator, CheckCircle2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'
import { sampleMoves, sampleMoveInventory } from '../data/sampleData.js'

const SIZE_CF = { small: 2, medium: 10, large: 35, xl: 65 }

const TRUCK_RECS = [
  { label: 'Cargo Van',  maxCf: 250,  size: '~250 cu ft', ideal: 'Studio / 1BR' },
  { label: '10-ft Truck', maxCf: 400, size: '~400 cu ft', ideal: '1–2 BR' },
  { label: '15-ft Truck', maxCf: 700, size: '~700 cu ft', ideal: '2–3 BR' },
  { label: '20-ft Truck', maxCf: 1000, size: '~1,000 cu ft', ideal: '3–4 BR' },
  { label: '26-ft Truck', maxCf: 9999, size: '~1,700 cu ft', ideal: '4+ BR / Large Home' },
]

function truckRec(cf) {
  return TRUCK_RECS.find(t => cf <= t.maxCf) || TRUCK_RECS[TRUCK_RECS.length - 1]
}

function crewRec(cf, distance) {
  if (cf < 300 && distance < 15) return 2
  if (cf < 700 && distance < 30) return 3
  return 4
}

function estHours(cf, distance, access) {
  const base = cf / 180
  const drive = distance / 20
  const accessMult = access === 'stairs' ? 1.3 : access === 'elevator' ? 1.1 : 1
  return Math.max(2, (base + drive) * accessMult)
}

const STATUS_BADGE = {
  scheduled: 'badge-blue',
  completed: 'badge-success',
  cancelled: 'badge-danger',
}

const CATEGORIES = ['Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office', 'Garage', 'Boxes', 'Appliances', 'Other']
const SIZES = ['small', 'medium', 'large', 'xl']

// ─── Moves tab ────────────────────────────────────────────────────────────────
function MovesTab() {
  const [moves, setMoves] = useState(sampleMoves)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({
    clientName: '', email: '', origin: '', destination: '',
    moveDate: '', rooms: '', sqft: '', access: 'ground', floors: '1', distance: '', notes: '',
  })

  const addMove = () => {
    if (!form.clientName || !form.origin || !form.destination || !form.moveDate) return
    const cf = parseInt(form.rooms || 0) * 180
    const crew = crewRec(cf, parseFloat(form.distance || 0))
    setMoves(m => [...m, {
      id: Date.now(), ...form,
      rooms: parseInt(form.rooms) || 0, sqft: parseInt(form.sqft) || 0,
      floors: parseInt(form.floors) || 1, distance: parseFloat(form.distance) || 0,
      crew, status: 'scheduled',
    }])
    setForm({ clientName: '', email: '', origin: '', destination: '', moveDate: '', rooms: '', sqft: '', access: 'ground', floors: '1', distance: '', notes: '' })
    setShowForm(false)
  }

  const scheduled = moves.filter(m => m.status === 'scheduled')
  const completed  = moves.filter(m => m.status === 'completed')

  return (
    <div>
      <div className="money-summary">
        <div className="money-stat"><div className="money-stat-val">{moves.length}</div><div className="money-stat-lbl">Total Moves</div></div>
        <div className="money-stat"><div className="money-stat-val">{scheduled.length}</div><div className="money-stat-lbl">Scheduled</div></div>
        <div className="money-stat"><div className="money-stat-val">{completed.length}</div><div className="money-stat-lbl">Completed</div></div>
        <div className="money-stat"><div className="money-stat-val text-gold">{moves.reduce((s, m) => s + m.crew, 0)}</div><div className="money-stat-lbl">Total Crew Assigned</div></div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 style={{ fontWeight: 700 }}>Move Jobs</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={13} /> New Move
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="card-title">New Move</span>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Client Name</label><input value={form.clientName} onChange={e => setForm(f => ({...f, clientName: e.target.value}))} placeholder="Full name" /></div>
            <div className="form-group"><label className="form-label">Client Email</label><input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@example.com" /></div>
          </div>
          <div className="form-group"><label className="form-label">Origin Address</label><input value={form.origin} onChange={e => setForm(f => ({...f, origin: e.target.value}))} placeholder="Full pickup address" /></div>
          <div className="form-group"><label className="form-label">Destination Address</label><input value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))} placeholder="Full drop-off address" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Move Date</label><input type="date" value={form.moveDate} onChange={e => setForm(f => ({...f, moveDate: e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Distance (miles)</label><input type="number" value={form.distance} onChange={e => setForm(f => ({...f, distance: e.target.value}))} placeholder="0" /></div>
          </div>
          <div className="form-row-3">
            <div className="form-group"><label className="form-label">Rooms</label><input type="number" value={form.rooms} onChange={e => setForm(f => ({...f, rooms: e.target.value}))} placeholder="0" /></div>
            <div className="form-group"><label className="form-label">Sq Ft</label><input type="number" value={form.sqft} onChange={e => setForm(f => ({...f, sqft: e.target.value}))} placeholder="0" /></div>
            <div className="form-group"><label className="form-label">Floors</label><input type="number" value={form.floors} onChange={e => setForm(f => ({...f, floors: e.target.value}))} placeholder="1" /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Access Type</label>
            <select value={form.access} onChange={e => setForm(f => ({...f, access: e.target.value}))}>
              <option value="ground">Ground floor (easiest)</option>
              <option value="elevator">Elevator available</option>
              <option value="stairs">Stairs only</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="Special items, fragile pieces, access codes..." /></div>
          <button className="btn btn-primary btn-sm" onClick={addMove}>Save Move</button>
        </div>
      )}

      {moves.map(move => (
        <div key={move.id} className="card mb-3">
          <div className="flex justify-between items-center" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === move.id ? null : move.id)}>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold" style={{ fontSize: 15 }}>{move.clientName}</span>
                <span className={`badge ${STATUS_BADGE[move.status] || 'badge-neutral'}`}>{move.status}</span>
              </div>
              <div className="text-xs text-muted">{move.moveDate} · {move.rooms} rooms · {move.distance} mi · {move.crew} movers</div>
            </div>
            {expanded === move.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </div>

          {expanded === move.id && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.15s ease' }}>
              <div className="two-col" style={{ gap: 12 }}>
                <div>
                  <div className="modal-field-label mb-1">From</div>
                  <div className="flex items-center gap-2 text-sm"><MapPin size={12} className="text-gold" /> {move.origin}</div>
                </div>
                <div>
                  <div className="modal-field-label mb-1">To</div>
                  <div className="flex items-center gap-2 text-sm"><MapPin size={12} className="text-gold" /> {move.destination}</div>
                </div>
              </div>
              <div className="three-col mt-3" style={{ gap: 10 }}>
                <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px' }}>
                  <div className="text-xs text-muted">Access</div>
                  <div className="font-semibold text-sm" style={{ textTransform: 'capitalize' }}>{move.access}</div>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px' }}>
                  <div className="text-xs text-muted">Sq Ft</div>
                  <div className="font-semibold text-sm">{move.sqft?.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px' }}>
                  <div className="text-xs text-muted">Crew</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--gold)' }}>{move.crew} movers</div>
                </div>
              </div>
              {move.notes && <div className="alert alert-info mt-3" style={{ marginBottom: 0, fontSize: 12 }}>{move.notes}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Inventory tab ────────────────────────────────────────────────────────────
function InventoryTab() {
  const [moves] = useState(sampleMoves)
  const [selectedMove, setSelectedMove] = useState(sampleMoves[0]?.id || null)
  const [inventory, setInventory] = useState(sampleMoveInventory)
  const [form, setForm] = useState({ category: 'Living Room', name: '', size: 'medium', qty: 1 })

  const items = inventory.filter(i => i.moveId === selectedMove)
  const totalCf = items.reduce((s, i) => s + (SIZE_CF[i.size] || 0) * i.qty, 0)
  const truck = truckRec(totalCf)

  const addItem = () => {
    if (!form.name) return
    setInventory(inv => [...inv, { id: Date.now(), moveId: selectedMove, ...form, qty: parseInt(form.qty) || 1 }])
    setForm(f => ({ ...f, name: '' }))
  }

  const removeItem = (id) => setInventory(inv => inv.filter(i => i.id !== id))

  const groups = CATEGORIES.filter(c => items.some(i => i.category === c))

  return (
    <div>
      <div className="form-group mb-4">
        <label className="form-label">Select Move</label>
        <select value={selectedMove} onChange={e => setSelectedMove(Number(e.target.value))}>
          {moves.map(m => <option key={m.id} value={m.id}>{m.clientName} — {m.moveDate}</option>)}
        </select>
      </div>

      {/* Summary bar */}
      <div className="money-summary mb-4">
        <div className="money-stat"><div className="money-stat-val">{items.reduce((s, i) => s + i.qty, 0)}</div><div className="money-stat-lbl">Total Items</div></div>
        <div className="money-stat"><div className="money-stat-val">{totalCf}</div><div className="money-stat-lbl">Cu Ft Est.</div></div>
        <div className="money-stat"><div className="money-stat-val text-gold">{truck.label}</div><div className="money-stat-lbl">Truck Rec.</div></div>
        <div className="money-stat"><div className="money-stat-val">{crewRec(totalCf, moves.find(m=>m.id===selectedMove)?.distance||0)}</div><div className="money-stat-lbl">Crew Rec.</div></div>
      </div>

      {/* Add item */}
      <div className="card mb-4">
        <div className="card-title mb-3">Add Item</div>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item Name</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. King Bed Frame" onKeyDown={e => e.key === 'Enter' && addItem()} />
          </div>
        </div>
        <div className="form-row mt-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Size</label>
            <select value={form.size} onChange={e => setForm(f => ({...f, size: e.target.value}))}>
              <option value="small">Small (~2 cu ft)</option>
              <option value="medium">Medium (~10 cu ft)</option>
              <option value="large">Large (~35 cu ft)</option>
              <option value="xl">XL (~65 cu ft)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Qty</label>
            <input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({...f, qty: e.target.value}))} />
          </div>
        </div>
        <button className="btn btn-secondary btn-sm mt-3" onClick={addItem}><Plus size={13} /> Add Item</button>
      </div>

      {/* Item list */}
      {groups.length === 0 ? (
        <div className="empty-state"><Package size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} /><p>No items yet — start adding above.</p></div>
      ) : groups.map(cat => (
        <div key={cat} className="card mb-3">
          <div className="card-title mb-3" style={{ color: 'var(--gold)' }}>{cat}</div>
          {items.filter(i => i.category === cat).map(item => (
            <div key={item.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <span className="font-semibold text-sm">{item.name}</span>
                <span className="text-xs text-muted ml-2">× {item.qty}</span>
              </div>
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{item.size}</span>
              <span className="text-xs text-muted">{SIZE_CF[item.size] * item.qty} cu ft</span>
              <button className="btn-icon" onClick={() => removeItem(item.id)}><X size={12} /></button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Calculator tab ───────────────────────────────────────────────────────────
function CalculatorTab() {
  const [inputs, setInputs] = useState({ rooms: 3, sqft: 1800, floors: 1, access: 'ground', distance: 10, fragile: false })
  const set = (k, v) => setInputs(i => ({ ...i, [k]: v }))

  const estCf = inputs.rooms * 180 + (inputs.fragile ? 100 : 0)
  const truck  = truckRec(estCf)
  const crew   = crewRec(estCf, inputs.distance)
  const hours  = estHours(estCf, inputs.distance, inputs.access)
  const priceMin = Math.round(crew * 85 * hours * 0.9 / 5) * 5
  const priceMax = Math.round(crew * 95 * hours * 1.1 / 5) * 5

  return (
    <div className="two-col">
      <div className="card">
        <div className="card-title mb-4">Move Details</div>
        <div className="form-group"><label className="form-label">Number of Rooms</label><input type="number" min="1" max="20" value={inputs.rooms} onChange={e => set('rooms', parseInt(e.target.value)||1)} /></div>
        <div className="form-group"><label className="form-label">Approx Sq Ft</label><input type="number" value={inputs.sqft} onChange={e => set('sqft', parseInt(e.target.value)||0)} /></div>
        <div className="form-group"><label className="form-label">Number of Floors</label><input type="number" min="1" max="5" value={inputs.floors} onChange={e => set('floors', parseInt(e.target.value)||1)} /></div>
        <div className="form-group"><label className="form-label">Access Type</label>
          <select value={inputs.access} onChange={e => set('access', e.target.value)}>
            <option value="ground">Ground floor</option>
            <option value="elevator">Elevator available</option>
            <option value="stairs">Stairs only</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Distance (miles)</label><input type="number" min="0" value={inputs.distance} onChange={e => set('distance', parseFloat(e.target.value)||0)} /></div>
        <div className="checkbox-group mt-2">
          <label className={`checkbox-item${inputs.fragile ? ' checked' : ''}`} onClick={() => set('fragile', !inputs.fragile)}>
            <input type="checkbox" readOnly checked={inputs.fragile} /> Fragile / specialty items
          </label>
        </div>
      </div>

      <div>
        <div className="card mb-4" style={{ borderColor: 'var(--gold)' }}>
          <div className="card-title mb-4" style={{ color: 'var(--gold)' }}>Estimate</div>

          <div style={{ textAlign: 'center', padding: '12px 0 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)' }}>${priceMin.toLocaleString()}–${priceMax.toLocaleString()}</div>
            <div className="text-sm text-muted mt-1">Estimated price range</div>
          </div>

          {[
            { label: 'Recommended Truck', val: truck.label, sub: truck.ideal },
            { label: 'Est. Cubic Footage', val: `${estCf} cu ft`, sub: truck.size },
            { label: 'Crew Size', val: `${crew} movers`, sub: 'recommended' },
            { label: 'Est. Hours', val: `${hours.toFixed(1)} hrs`, sub: `@ $85–95/mover/hr` },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-muted">{r.sub}</div>
              </div>
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.val}</div>
            </div>
          ))}

          <div className="alert alert-info mt-3" style={{ marginBottom: 0, fontSize: 12 }}>
            Estimates based on average move times. Final price confirmed on-site.
          </div>
        </div>

        <div className="card">
          <div className="card-title mb-3">Truck Reference</div>
          {TRUCK_RECS.map(t => (
            <div key={t.label} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: t.label === truck.label ? 1 : 0.5 }}>
              <div className="flex items-center gap-2">
                {t.label === truck.label && <CheckCircle2 size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
                <span className="text-sm font-semibold">{t.label}</span>
              </div>
              <span className="text-xs text-muted">{t.ideal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const TABS = ['Moves', 'Inventory', 'Calculator']

export default function MovingModule() {
  const [tab, setTab] = useState('Moves')
  return (
    <div>
      <div className="page-header">
        <h1>Moving Hub</h1>
        <p>Manage moves, build inventory lists, and estimate truck size and crew.</p>
      </div>
      <div className="tabs">
        {TABS.map(t => <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Moves'      && <MovesTab />}
      {tab === 'Inventory'  && <InventoryTab />}
      {tab === 'Calculator' && <CalculatorTab />}
    </div>
  )
}
