import { useState } from 'react'
import { MessageSquareWarning, Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import { handleComplaint } from '../lib/aiPlaceholders.js'

const TONES = [
  { id: 'empathetic', label: 'Empathetic', desc: 'Warm, understanding, human' },
  { id: 'apologetic', label: 'Apologetic',  desc: 'Own it fully, make it right' },
  { id: 'firm',       label: 'Firm & Helpful', desc: 'Professional, direct, fair' },
  { id: 'neutral',    label: 'Neutral',      desc: 'Factual and measured' },
]

const SAMPLE_COMPLAINTS = [
  "I came home and the bathrooms weren't cleaned properly — there was still hair in the shower and the toilet wasn't scrubbed. I pay a lot for this service and I'm really disappointed.",
  "Your team left my back door unlocked! That is completely unacceptable. I don't feel safe knowing this happened.",
  "The cleaner was 45 minutes late today and didn't even tell me. I had to reschedule my whole morning. This is the second time this has happened.",
]

export default function ComplaintHandler() {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('empathetic')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    const res = await handleComplaint(message, tone)
    setResult(res.response)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Complaint Handler <span className="text-gold">— AI De-escalation</span></h1>
        <p>Paste an angry message. Get a calm, professional response ready to send in seconds.</p>
      </div>

      <div className="two-col">
        <div>
          <div className="card mb-4">
            <div className="card-title" style={{ marginBottom: 14 }}>Client Message</div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Paste the complaint or difficult message</label>
              <textarea
                style={{ minHeight: 130 }}
                placeholder="Paste the client's message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
              <span className="text-xs text-muted" style={{ alignSelf: 'center', marginRight: 4 }}>Try a sample:</span>
              {SAMPLE_COMPLAINTS.map((s, i) => (
                <button key={i} className="btn btn-ghost btn-sm" onClick={() => setMessage(s)}>
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Response Tone</div>
            <div className="tone-options">
              {TONES.map(t => (
                <div
                  key={t.id}
                  className={`tone-option${tone === t.id ? ' selected' : ''}`}
                  onClick={() => setTone(t.id)}
                >
                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>{t.desc}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center' }}
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
            >
              {loading
                ? <><span className="spinner" /> Drafting response...</>
                : <><Sparkles size={15} /> Generate Response</>}
            </button>
          </div>
        </div>

        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <MessageSquareWarning size={32} style={{ color: 'var(--gold)', opacity: 0.3, margin: '0 auto 12px' }} />
              <p className="text-muted">Paste a complaint on the left and choose your tone. The AI will draft a response that keeps your client relationship intact.</p>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="loading-row">
                <span className="spinner" />
                <span>Drafting your response...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="ai-result-label" style={{ margin: 0 }}>
                  <Sparkles size={12} />
                  AI Draft Response
                </div>
                <div className="flex gap-2">
                  <button className="btn-icon" onClick={handleGenerate} title="Regenerate">
                    <RefreshCw size={13} />
                  </button>
                  <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--gold)',
                borderRadius: 'var(--radius)',
                padding: '16px 18px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.75,
                fontSize: 14,
                color: 'var(--text-secondary)',
              }}>
                {result}
              </div>

              <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
                <MessageSquareWarning size={14} />
                <span>Review before sending. Personalize with specific details if needed.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
