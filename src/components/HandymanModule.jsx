import { useState } from 'react'
import { Wrench, Plus, ShieldCheck, Clock, Package, Tag, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { sampleHandymanJobs, sampleHandymanMaterials, sampleWarranties, workers, workerSkills } from '../data/sampleData.js'

const JOB_TYPES = ['plumbing', 'electrical', 'drywall', 'carpentry', 'painting', 'general', 'hvac', 'flooring', 'other']
const TYPE_COLOR = { plumbing: 'badge-blue', electrical: 'badge-warning', drywall: 'badge-neutral', carpentry: 'badge-gold', painting: 'badge-silver', general: 'badge-neutral', hvac: 'badge-blue', flooring: 'badge-bronze', other: 'badge-neutral' }

function daysBetween(d1, d2) {
  return Math.round((new Date(d2) - new Date(d1)) / 86400000)
}
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ─── Jobs tab ─────────────────────────────────────────────────────────────────
function JobsTab() {
  const [jobs, setJobs] = useState(sampleHandymanJobs)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', description: '', type: 'general', date: '', workerId: workers[0]?.id || 1, laborHours: '', laborRate: 75, notes: '' })

  const addJob = () => {
    if (!form.clientName || !form.description) return
    setJobs(j => [...j, { id: Date.now(), ...form, workerId: Number(form.workerId), laborHours: parseFloat(form.laborHours)||0, laborRate: parseFloat(form.laborRate)||75, status: 'scheduled', workerName: workers.find(w=>w.id===Number(form.workerId))?.name.split(' ').map((p,i)=>i===0?p:p[0]+'.').join(' ')||'' }])
    setForm({ clientName: '', description: '', type: 'general', date: '', workerId: workers[0]?.id||1, laborHours: '', laborRate: 75, notes: '' })
    setShowForm(false)
  }

  const scheduled = jobs.filter(j => j.status === 'scheduled')
  const completed  = jobs.filter(j => j.status === 'completed')
  const totalRev   = jobs.reduce((s, j) => s + j.laborHours * j.laborRate, 0)

  return (
    <div>
      <div className="money-summary">
        <div className="money-stat"><div className="money-stat-val">{jobs.length}</div><div className="money-stat-lbl">Total Jobs</div></div>
        <div className="money-stat"><div className="money-stat-val">{scheduled.length}</div><div className="money-stat-lbl">Scheduled</div></div>
        <div className="money-stat"><div className="money-stat-val">{completed.length}</div><div className="money-stat-lbl">Completed</div></div>
        <div className="money-stat"><div className="money-stat-val text-gold">${totalRev.toFixed(0)}</div><div className="money-stat-lbl">Labor Revenue</div></div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 style={{ fontWeight: 700 }}>Job List</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(s => !s)}><Plus size={13} /> New Job</button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="card-title">New Handyman Job</span>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Client Name</label><input value={form.clientName} onChange={e => setForm(f=>({...f,clientName:e.target.value}))} placeholder="Client name" /></div>
            <div className="form-group"><label className="form-label">Job Date</label><input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Fix leaking kitchen faucet" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Job Type</label>
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {JOB_TYPES.map(t => <option key={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Worker</label>
              <select value={form.workerId} onChange={e => setForm(f=>({...f,workerId:e.target.value}))}>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Labor Hours</label><input type="number" step="0.5" value={form.laborHours} onChange={e => setForm(f=>({...f,laborHours:e.target.value}))} placeholder="0" /></div>
            <div className="form-group"><label className="form-label">Rate ($/hr)</label><input type="number" value={form.laborRate} onChange={e => setForm(f=>({...f,laborRate:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Parts needed, access info..." /></div>
          <button className="btn btn-primary btn-sm" onClick={addJob}>Save Job</button>
        </div>
      )}

      {jobs.map(job => (
        <div key={job.id} className="card mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">{job.clientName}</span>
                <span className={`badge ${TYPE_COLOR[job.type]||'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{job.type}</span>
                <span className={`badge ${job.status === 'completed' ? 'badge-success' : 'badge-blue'}`}>{job.status}</span>
              </div>
              <div className="text-xs text-muted mt-1">{job.description}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-gold font-bold">${(job.laborHours * job.laborRate).toFixed(0)}</div>
              <div className="text-xs text-muted">{job.laborHours}h × ${job.laborRate}/hr</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{job.date}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{job.workerName}</span>
            {job.notes && <><span className="text-xs text-muted">·</span><span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>{job.notes}</span></>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Materials tab ────────────────────────────────────────────────────────────
function MaterialsTab() {
  const [jobs] = useState(sampleHandymanJobs)
  const [selectedJob, setSelectedJob] = useState(sampleHandymanJobs[0]?.id || null)
  const [materials, setMaterials] = useState(sampleHandymanMaterials)
  const [form, setForm] = useState({ name: '', qty: 1, unit: 'ea', price: '' })

  const items = materials.filter(m => m.jobId === selectedJob)
  const totalCost = items.reduce((s, m) => s + m.qty * m.price, 0)
  const job = jobs.find(j => j.id === selectedJob)
  const laborCost = job ? job.laborHours * job.laborRate : 0

  const addMaterial = () => {
    if (!form.name || !form.price) return
    setMaterials(m => [...m, { id: Date.now(), jobId: selectedJob, ...form, qty: parseFloat(form.qty)||1, price: parseFloat(form.price)||0 }])
    setForm({ name: '', qty: 1, unit: 'ea', price: '' })
  }

  const removeMaterial = (id) => setMaterials(m => m.filter(i => i.id !== id))

  return (
    <div>
      <div className="form-group mb-4">
        <label className="form-label">Select Job</label>
        <select value={selectedJob} onChange={e => setSelectedJob(Number(e.target.value))}>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName} — {j.description}</option>)}
        </select>
      </div>

      <div className="two-col">
        <div>
          <div className="card mb-4">
            <div className="card-title mb-3">Add Part / Material</div>
            <div className="form-group"><label className="form-label">Name</label><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Moen cartridge #1225" onKeyDown={e => e.key==='Enter' && addMaterial()} /></div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Qty</label><input type="number" min="1" step="0.1" value={form.qty} onChange={e => setForm(f=>({...f,qty:e.target.value}))} /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Unit</label>
                <select value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))}>
                  {['ea','pack','tube','ft','sq ft','gal','qt','lb','bag','roll'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group mt-2"><label className="form-label">Unit Price ($)</label><input type="number" step="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" /></div>
            <button className="btn btn-secondary btn-sm" onClick={addMaterial}><Plus size={13} /> Add</button>
          </div>

          <div className="card">
            <div className="card-title mb-3">Parts List</div>
            {items.length === 0 ? (
              <p className="text-sm text-muted">No materials added yet.</p>
            ) : items.map(item => (
              <div key={item.id} className="flex items-center gap-2" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted">{item.qty} {item.unit} × ${item.price.toFixed(2)}</div>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>${(item.qty * item.price).toFixed(2)}</span>
                <button className="btn-icon" onClick={() => removeMaterial(item.id)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'flex-start', borderColor: 'var(--gold)' }}>
          <div className="card-title mb-4" style={{ color: 'var(--gold)' }}>Job Cost Summary</div>
          {[
            { label: 'Materials', val: `$${totalCost.toFixed(2)}` },
            { label: `Labor (${job?.laborHours || 0}h × $${job?.laborRate || 0}/hr)`, val: `$${laborCost.toFixed(2)}` },
          ].map(r => (
            <div key={r.label} className="flex justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span className="text-secondary">{r.label}</span>
              <span className="font-semibold">{r.val}</span>
            </div>
          ))}
          <div className="flex justify-between" style={{ paddingTop: 12, fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold)' }}>${(totalCost + laborCost).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Warranties tab ───────────────────────────────────────────────────────────
function WarrantiesTab() {
  const [jobs] = useState(sampleHandymanJobs)
  const [warranties, setWarranties] = useState(sampleWarranties)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ jobId: sampleHandymanJobs[0]?.id || 1, description: '', periodDays: 90, startDate: '', notes: '' })

  const today = new Date().toISOString().slice(0, 10)

  const addWarranty = () => {
    if (!form.description || !form.startDate) return
    setWarranties(w => [...w, { id: Date.now(), ...form, jobId: Number(form.jobId), periodDays: parseInt(form.periodDays)||90 }])
    setForm({ jobId: sampleHandymanJobs[0]?.id||1, description: '', periodDays: 90, startDate: '', notes: '' })
    setShowForm(false)
  }

  const getStatus = (w) => {
    const expiry = addDays(w.startDate, w.periodDays)
    const daysLeft = daysBetween(today, expiry)
    if (daysLeft < 0) return { label: 'Expired', cls: 'badge-danger', daysLeft }
    if (daysLeft <= 30) return { label: 'Expiring Soon', cls: 'badge-warning', daysLeft }
    return { label: 'Active', cls: 'badge-success', daysLeft }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ fontWeight: 700 }}>Warranty Tracker</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(s => !s)}><Plus size={13} /> Add Warranty</button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="card-title">New Warranty</span>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="form-group"><label className="form-label">Job</label>
            <select value={form.jobId} onChange={e => setForm(f=>({...f,jobId:e.target.value}))}>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.clientName} — {j.description}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">What was fixed / warranty covers</label><input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Kitchen faucet cartridge replacement" /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Warranty Period</label>
              <select value={form.periodDays} onChange={e => setForm(f=>({...f,periodDays:e.target.value}))}>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Notes (parts, model #s)</label><textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2} /></div>
          <button className="btn btn-primary btn-sm" onClick={addWarranty}>Save Warranty</button>
        </div>
      )}

      {warranties.length === 0 && (
        <div className="empty-state"><ShieldCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} /><p>No warranties tracked yet.</p></div>
      )}

      {warranties.map(w => {
        const status = getStatus(w)
        const expiry = addDays(w.startDate, w.periodDays)
        const job = jobs.find(j => j.id === w.jobId)
        return (
          <div key={w.id} className="card mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: status.cls === 'badge-success' ? 'var(--success)' : status.cls === 'badge-warning' ? 'var(--warning)' : 'var(--danger)' }} />
                <span className="font-semibold">{w.description}</span>
              </div>
              <span className={`badge ${status.cls}`}>{status.label}</span>
            </div>
            <div className="text-xs text-muted mb-1">{job?.clientName || 'Unknown client'} · {job?.description}</div>
            <div className="flex gap-4 text-xs text-muted">
              <span>Start: {w.startDate}</span>
              <span>Expires: {expiry}</span>
              <span style={{ color: status.daysLeft < 0 ? 'var(--danger)' : status.daysLeft <= 30 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                {status.daysLeft < 0 ? `${Math.abs(status.daysLeft)} days ago` : `${status.daysLeft} days left`}
              </span>
            </div>
            {w.notes && <div className="text-xs text-muted mt-2" style={{ fontStyle: 'italic' }}>{w.notes}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ─── Skills tab ───────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = ['Plumbing', 'Electrical', 'Drywall', 'Painting', 'Carpentry', 'Tile Work', 'HVAC', 'Flooring', 'Roofing', 'Fencing', 'Concrete', 'Welding', 'Appliance Repair', 'Smart Home', 'Landscaping']

function SkillsTab() {
  const [skills, setSkills] = useState(() => {
    const init = {}
    workers.forEach(w => { init[w.id] = [...(workerSkills[w.id] || [])] })
    return init
  })
  const [inputs, setInputs] = useState({})

  const addSkill = (workerId) => {
    const val = (inputs[workerId] || '').trim()
    if (!val) return
    setSkills(s => ({ ...s, [workerId]: [...(s[workerId] || []), val] }))
    setInputs(i => ({ ...i, [workerId]: '' }))
  }

  const removeSkill = (workerId, skill) => {
    setSkills(s => ({ ...s, [workerId]: s[workerId].filter(sk => sk !== skill) }))
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">Tag each technician with their specialties to match the right person to every job.</p>
      {workers.map(w => (
        <div key={w.id} className="card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)', color: '#fff8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{w.initials}</div>
            <div>
              <div className="font-semibold">{w.name}</div>
              <div className="text-xs text-muted">{w.jobsThisMonth} jobs this month</div>
            </div>
          </div>
          <div className="checkbox-group mb-3">
            {(skills[w.id] || []).map(skill => (
              <div key={skill} className="checkbox-item checked" style={{ cursor: 'default' }}>
                <Tag size={11} /> {skill}
                <button onClick={() => removeSkill(w.id, skill)} style={{ background: 'none', border: 'none', padding: '0 0 0 4px', cursor: 'pointer', color: 'var(--gold)', display: 'flex', alignItems: 'center' }}><X size={11} /></button>
              </div>
            ))}
            {(skills[w.id] || []).length === 0 && <span className="text-xs text-muted">No skills tagged yet</span>}
          </div>
          <div className="flex gap-2">
            <input
              className="dash-search-input"
              style={{ flex: 1, padding: '7px 12px', fontSize: 13 }}
              placeholder="Add skill or specialty…"
              value={inputs[w.id] || ''}
              onChange={e => setInputs(i => ({...i, [w.id]: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && addSkill(w.id)}
              list={`skills-${w.id}`}
            />
            <datalist id={`skills-${w.id}`}>
              {SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
            <button className="btn btn-secondary btn-sm" onClick={() => addSkill(w.id)}><Plus size={13} /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const TABS = ['Jobs', 'Materials', 'Warranties', 'Skills']

export default function HandymanModule() {
  const [tab, setTab] = useState('Jobs')
  return (
    <div>
      <div className="page-header">
        <h1>Handyman Hub</h1>
        <p>Track repair jobs, parts costs, warranties, and worker skills.</p>
      </div>
      <div className="tabs">
        {TABS.map(t => <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Jobs'       && <JobsTab />}
      {tab === 'Materials'  && <MaterialsTab />}
      {tab === 'Warranties' && <WarrantiesTab />}
      {tab === 'Skills'     && <SkillsTab />}
    </div>
  )
}
