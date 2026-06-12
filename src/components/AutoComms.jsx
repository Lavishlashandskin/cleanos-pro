import { useState } from 'react'
import { Bell, Navigation, Star, Check, Send, FileText, MessageSquare, Link, Receipt } from 'lucide-react'
import { clients } from '../data/sampleData.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { sendEmail } from '../lib/sendEmail.js'

function makeDefaultTemplates(biz, owner) {
  const sig = biz || 'Your Service Team'
  const ownerSig = owner ? `${owner} & the ${sig}` : sig
  return {
    reminder: {
      subject: 'Reminder — your appointment is tomorrow at {time}',
      body: `Hi {name}!\n\nJust a reminder that we'll be at {address} tomorrow ({day}) at {time}. If anything changes, please let us know as soon as possible.\n\nSee you then!\n— ${sig}`,
    },
    onMyWay: {
      subject: "We're on our way!",
      body: `Hi {name}!\n\nWe're heading to {address} now and should arrive at approximately {time}. We're excited to get your space taken care of!\n\n— ${sig}`,
    },
    review: {
      subject: 'How did your service go? Quick feedback appreciated',
      body: `Hi {name}!\n\nThank you for trusting ${sig} with your home. We hope everything looks amazing!\n\nWe'd love to hear your feedback. Log in to your client portal and leave a quick star rating — it only takes 30 seconds.\n\nThank you!\n— ${ownerSig}`,
    },
    waiver: {
      subject: 'Service Agreement — please sign before your appointment',
      body: `Hi {name}!\n\nYour upcoming appointment on {day} at {time} requires a signed service agreement.\n\nPlease log in to your client portal and go to the "Waivers" tab to review and sign — it only takes a moment.\n\n{portal_link}\n\nIf you have any questions, don't hesitate to reach out!\n\n— ${sig}`,
    },
    receipt: {
      subject: 'Payment receipt — thank you!',
      body: `Hi {name}!\n\nThank you for your payment! Here's a quick summary:\n\nService: {service}\nDate: {day}\nAddress: {address}\nAmount: {amount}\n\nWe appreciate your business and look forward to seeing you again!\n\n— ${ownerSig}`,
    },
  }
}

const COMM_CONFIG = {
  reminder: { label: '24-Hr Reminder',   icon: Bell,       color: '#b5924c', desc: 'Send the day before the appointment' },
  onMyWay:  { label: 'On My Way',        icon: Navigation, color: '#4A7A4D', desc: 'Send when worker departs for the job'  },
  review:   { label: 'Review Request',   icon: Star,       color: '#7B6BC8', desc: 'Send after job is marked complete'     },
  waiver:   { label: 'Waiver Link',      icon: Link,       color: '#5E8FB5', desc: 'Send when booking is confirmed'       },
  receipt:  { label: 'Payment Receipt',  icon: Receipt,    color: '#4A7A4D', desc: 'Send after payment is collected'      },
}

const PLACEHOLDERS = {
  reminder: ['{name}', '{address}', '{day}', '{time}'],
  onMyWay:  ['{name}', '{address}', '{time}'],
  review:   ['{name}', '{address}'],
  waiver:   ['{name}', '{day}', '{time}', '{portal_link}'],
  receipt:  ['{name}', '{service}', '{day}', '{address}', '{amount}'],
}

function getClientName(job) {
  if (job.clientName) return job.clientName
  const c = clients.find(c => c.id === job.clientId)
  return c ? c.name : 'Unknown'
}

function fmt(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`)
}

function CommCard({ job, commType, onSend, alreadySent }) {
  const cfg = COMM_CONFIG[commType]
  const Icon = cfg.icon
  const name = getClientName(job)
  const client = clients.find(c => c.id === job.clientId)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${cfg.color}`, borderRadius: 'var(--radius)',
      marginBottom: 8, opacity: alreadySent ? 0.5 : 1,
    }}>
      <Icon size={15} style={{ color: cfg.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
          {job.day} {job.date.slice(5)} · {job.time} · {job.address}
        </div>
      </div>
      {alreadySent ? (
        <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Check size={11} /> Sent
        </span>
      ) : (
        <button
          className="btn btn-secondary btn-sm"
          style={{ flexShrink: 0 }}
          onClick={() => {
            const first = name.split(' ')[0]
            const email = client?.email || ''
            onSend(job, commType, first, email)
          }}
        >
          <Send size={11} /> Send
        </button>
      )}
    </div>
  )
}

export default function AutoComms({ jobs = [], onUpdateComm }) {
  const { profile } = useProfile()
  const [tab, setTab] = useState('due')

  const [templates, setTemplates] = useState(() => {
    try {
      const s = localStorage.getItem('cleanos_comms_templates')
      if (s) {
        const stored = JSON.parse(s)
        // Always re-inject current defaults for keys not yet customized
        const defaults = makeDefaultTemplates(
          JSON.parse(localStorage.getItem('cleanos_profile') || '{}').businessName,
          JSON.parse(localStorage.getItem('cleanos_profile') || '{}').ownerName,
        )
        return { ...defaults, ...stored }
      }
    } catch {}
    return makeDefaultTemplates(profile.businessName, profile.ownerName)
  })

  const [editKey, setEditKey] = useState(null)
  const [draft, setDraft]     = useState({})
  const [savedMsg, setSavedMsg] = useState('')
  const [sendingKey, setSendingKey] = useState(null)

  const TODAY    = '2026-06-12'
  const TOMORROW = '2026-06-13'

  const reminderDue = jobs.filter(j =>
    (j.date === TODAY || j.date === TOMORROW) &&
    j.status !== 'completed' &&
    j.commsLog?.reminder !== 'sent'
  )
  const onMyWayDue = jobs.filter(j =>
    j.clockIn && !j.clockOut && j.commsLog?.onMyWay !== 'sent'
  )
  const reviewDue = jobs.filter(j =>
    j.status === 'completed' && j.commsLog?.review !== 'sent'
  )
  const waiverDue = jobs.filter(j =>
    j.waiverStatus === 'sent' && j.commsLog?.waiver !== 'sent'
  )
  const totalDue = reminderDue.length + onMyWayDue.length + reviewDue.length + waiverDue.length

  const handleSend = async (job, commType, firstName, email) => {
    const t = templates[commType]
    const portalUrl = `${window.location.origin}/portal`
    const vars = {
      name: firstName,
      address: job.address,
      day: job.day,
      time: job.time,
      portal_link: portalUrl,
      service: job.type || 'Service',
      amount: job.amount ? `$${job.amount}` : 'See invoice',
    }
    setSendingKey(commType + job.id)
    await sendEmail({
      to: email,
      subject: fmt(t.subject, vars),
      body: fmt(t.body, vars),
      fromName: profile.businessName || undefined,
      fromEmail: profile.email || undefined,
    })
    setSendingKey(null)
    onUpdateComm?.(job.id, commType)
  }

  const sentLog = jobs.flatMap(j => {
    if (!j.commsLog) return []
    const name = getClientName(j)
    return Object.entries(j.commsLog)
      .filter(([, v]) => v === 'sent')
      .map(([commType]) => ({ jobId: j.id, clientName: name, date: j.date, day: j.day, address: j.address, commType }))
  }).sort((a, b) => b.date.localeCompare(a.date))

  const startEdit = (key) => { setEditKey(key); setDraft({ ...templates[key] }) }
  const saveEdit = () => {
    const updated = { ...templates, [editKey]: draft }
    setTemplates(updated)
    localStorage.setItem('cleanos_comms_templates', JSON.stringify(updated))
    setEditKey(null)
    setSavedMsg('Template saved!')
    setTimeout(() => setSavedMsg(''), 2500)
  }
  const resetTemplate = (key) => {
    const defaults = makeDefaultTemplates(profile.businessName, profile.ownerName)
    const updated = { ...templates, [key]: defaults[key] }
    setTemplates(updated)
    localStorage.setItem('cleanos_comms_templates', JSON.stringify(updated))
    setSavedMsg('Template reset to default.')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const statusBadge = (v) => {
    if (v === 'sent')    return <span style={{ color: 'var(--success)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}><Check size={10} />Sent</span>
    if (v === 'pending') return <span style={{ color: 'var(--gold)', fontSize: 11 }}>Due</span>
    return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
  }

  const sgConfigured = !!profile.sendgridKey

  return (
    <div>
      <div className="page-header">
        <h1>Auto Communications</h1>
        <p>Reminders, on-my-way alerts, waiver links, and review requests.
          {sgConfigured
            ? <> <span style={{ color: 'var(--success)', fontWeight: 600 }}>SendGrid connected — sending real email.</span></>
            : <> Sends via your email client. <span style={{ color: 'var(--text-muted)' }}>Add a SendGrid key in Settings to send real email.</span></>
          }
        </p>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'due' ? ' active' : ''}`} onClick={() => setTab('due')}>
          <Bell size={13} style={{ display: 'inline', marginRight: 5 }} />
          Due Now
          {totalDue > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#fff8ee', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>
              {totalDue}
            </span>
          )}
        </button>
        <button className={`tab${tab === 'templates' ? ' active' : ''}`} onClick={() => setTab('templates')}>
          <FileText size={13} style={{ display: 'inline', marginRight: 5 }} />
          Templates
        </button>
        <button className={`tab${tab === 'log' ? ' active' : ''}`} onClick={() => setTab('log')}>
          <Check size={13} style={{ display: 'inline', marginRight: 5 }} />
          Send Log
          {sentLog.length > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px', border: '1px solid var(--border)' }}>
              {sentLog.length}
            </span>
          )}
        </button>
      </div>

      {/* ── DUE NOW ───────────────────────────────────────────────────────────────── */}
      {tab === 'due' && (
        <div>
          {totalDue === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginBottom: 24 }}>
              <Check size={28} style={{ color: 'var(--success)', margin: '0 auto 12px', display: 'block' }} />
              <p className="text-muted">All caught up — no communications due right now.</p>
            </div>
          )}

          {reminderDue.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title"><Bell size={13} style={{ display: 'inline', marginRight: 6, color: '#b5924c' }} />24-Hour Reminders Due</span>
                <span className="text-xs text-muted">{reminderDue.length} job{reminderDue.length !== 1 ? 's' : ''}</span>
              </div>
              {reminderDue.map(j => <CommCard key={j.id} job={j} commType="reminder" onSend={handleSend} alreadySent={false} />)}
            </div>
          )}

          {onMyWayDue.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title"><Navigation size={13} style={{ display: 'inline', marginRight: 6, color: '#4A7A4D' }} />On-My-Way Notifications</span>
                <span className="text-xs text-muted">{onMyWayDue.length} in progress</span>
              </div>
              {onMyWayDue.map(j => <CommCard key={j.id} job={j} commType="onMyWay" onSend={handleSend} alreadySent={false} />)}
            </div>
          )}

          {reviewDue.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title"><Star size={13} style={{ display: 'inline', marginRight: 6, color: '#7B6BC8' }} />Review Requests Due</span>
                <span className="text-xs text-muted">{reviewDue.length} completed</span>
              </div>
              {reviewDue.map(j => <CommCard key={j.id} job={j} commType="review" onSend={handleSend} alreadySent={false} />)}
            </div>
          )}

          {waiverDue.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title"><Link size={13} style={{ display: 'inline', marginRight: 6, color: '#5E8FB5' }} />Waiver Link Needed</span>
                <span className="text-xs text-muted">{waiverDue.length} pending signature</span>
              </div>
              {waiverDue.map(j => <CommCard key={j.id} job={j} commType="waiver" onSend={handleSend} alreadySent={false} />)}
            </div>
          )}

          <div className="card">
            <div className="card-header"><span className="card-title">All Jobs — Comm Status</span></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Client</th><th>Date</th><th>Reminder</th><th>On My Way</th><th>Waiver</th><th>Review</th></tr>
                </thead>
                <tbody>
                  {jobs.map(j => {
                    const log = j.commsLog || {}
                    return (
                      <tr key={j.id}>
                        <td><strong>{getClientName(j)}</strong></td>
                        <td>{j.day} {j.date.slice(5)}</td>
                        <td>{statusBadge(log.reminder)}</td>
                        <td>{statusBadge(log.onMyWay)}</td>
                        <td>{statusBadge(log.waiver)}</td>
                        <td>{statusBadge(log.review)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATES ─────────────────────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div>
          {savedMsg && <div className="alert alert-success mb-4"><Check size={14} /> {savedMsg}</div>}
          {!profile.businessName && (
            <div className="alert alert-info mb-4" style={{ fontSize: 12 }}>
              <MessageSquare size={13} />
              <div>Set your <strong>Business Name</strong> in Settings → Business Profile to personalize your signatures automatically.</div>
            </div>
          )}
          <p className="text-sm text-muted mb-4" style={{ marginBottom: 20 }}>
            Customize your message templates. Placeholders are shown per template type.
          </p>

          {Object.entries(COMM_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon
            const isEditing = editKey === key
            return (
              <div key={key} className="card mb-4" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={15} style={{ color: cfg.color }} />
                    <span className="card-title">{cfg.label}</span>
                    <span className="text-xs text-muted" style={{ marginLeft: 2 }}>{cfg.desc}</span>
                  </div>
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(key)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => resetTemplate(key)} style={{ fontSize: 11 }}>Reset</button>
                    </div>
                  )}
                </div>

                {/* Placeholder chips */}
                {!isEditing && PLACEHOLDERS[key] && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {PLACEHOLDERS[key].map(p => (
                      <code key={p} style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 4, fontSize: 11, border: '1px solid var(--border)' }}>{p}</code>
                    ))}
                  </div>
                )}

                {isEditing ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {PLACEHOLDERS[key]?.map(p => (
                        <code key={p} style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 4, fontSize: 11, border: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => setDraft(d => ({ ...d, body: d.body + p }))}>{p}</code>
                      ))}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Body</label>
                      <textarea
                        rows={6}
                        value={draft.body}
                        onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: 13, padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button className="btn btn-primary btn-sm" onClick={saveEdit}><Check size={13} /> Save Template</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditKey(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Subject</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, fontStyle: 'italic' }}>{templates[key].subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Body preview</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {templates[key].body.slice(0, 220)}{templates[key].body.length > 220 ? '…' : ''}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── SEND LOG ──────────────────────────────────────────────────────────────── */}
      {tab === 'log' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Send History</span>
            <span className="text-xs text-muted">{sentLog.length} messages sent</span>
          </div>
          {sentLog.length === 0 && <p className="text-sm text-muted">No messages sent yet. Head to the Due Now tab to send your first one.</p>}
          {sentLog.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Client</th><th>Date</th><th>Type</th><th>Address</th></tr>
                </thead>
                <tbody>
                  {sentLog.map((entry, i) => (
                    <tr key={i}>
                      <td><strong>{entry.clientName}</strong></td>
                      <td>{entry.day} {entry.date.slice(5)}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                          {COMM_CONFIG[entry.commType]?.label || entry.commType}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{entry.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
