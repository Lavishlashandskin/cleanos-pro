import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react'
import { clients, monthlyRevenue, revenueByType } from '../data/sampleData.js'
import { generateSeasonalCampaign, analyzeCompetitors } from '../lib/aiPlaceholders.js'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1A1A1A', border: '1px solid #2C2C2C', borderRadius: 8, fontSize: 13 },
  labelStyle: { color: '#F0EDE8', fontWeight: 600 },
  itemStyle: { color: '#C8A951' },
}

// ─── Revenue overview tab ─────────────────────────────────────────────────────
function RevenueTab() {
  const topClients = [...clients].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 6)
  const churnRisk = clients.filter(c => {
    const daysSince = Math.floor((new Date() - new Date(c.lastClean)) / 86400000)
    return daysSince > 21 && c.frequency === 'weekly'
  })

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">YTD Revenue</div>
          <div className="stat-value gold">
            ${monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toLocaleString()}
          </div>
          <div className="stat-sub up">+32% vs same period last year</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Month</div>
          <div className="stat-value">May</div>
          <div className="stat-sub">$5,180 — 29 jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Revenue/Job</div>
          <div className="stat-value">
            ${Math.round(monthlyRevenue.reduce((s, m) => s + m.revenue, 0) / monthlyRevenue.reduce((s, m) => s + m.jobs, 0))}
          </div>
          <div className="stat-sub">All job types</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Churn Risk</div>
          <div className="stat-value" style={{ color: churnRisk.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {churnRisk.length}
          </div>
          <div className="stat-sub">{churnRisk.length === 0 ? 'No clients at risk' : 'clients to check in with'}</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Monthly Revenue — 2026</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue} barSize={28}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#C8A951" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Revenue by Service Type</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={revenueByType} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {revenueByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={TOOLTIP_STYLE.contentStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {revenueByType.map(r => (
                <div key={r.name} className="flex justify-between items-center" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                    <span className="text-secondary">{r.name}</span>
                  </div>
                  <strong>${r.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Top Clients by Lifetime Spend</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Tier</th><th>Lifetime</th><th>Jobs</th><th>Rate</th></tr></thead>
              <tbody>
                {topClients.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className={`badge badge-${c.tier}`}>{c.tier}</span></td>
                    <td><span className="text-gold">${c.totalSpend.toLocaleString()}</span></td>
                    <td>{c.jobCount}</td>
                    <td>${c.rate}/visit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Client Health</div>
          {clients.slice(0, 7).map(c => {
            const daysSince = Math.floor((new Date() - new Date(c.lastClean)) / 86400000)
            const isLate = (c.frequency === 'weekly' && daysSince > 12) || (c.frequency === 'biweekly' && daysSince > 20) || (c.frequency === 'monthly' && daysSince > 35)
            return (
              <div key={c.id} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <div className="text-xs text-muted">Last clean {daysSince}d ago · {c.frequency}</div>
                </div>
                <span className={`badge badge-${isLate ? 'warning' : 'success'}`}>
                  {isLate ? 'Check in' : 'On track'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Forecaster tab ───────────────────────────────────────────────────────────
function ForecasterTab() {
  const [basic, setBasic] = useState(15)
  const [pro, setPro] = useState(25)
  const [team, setTeam] = useState(10)

  const monthly = basic * 29 + pro * 59 + team * 99
  const annual = monthly * 12
  const apiCost = (basic + pro + team) * 4
  const profit = monthly - apiCost

  const tiers = [
    { label: 'Basic ($29/mo)', count: basic, setCount: setBasic, color: '#8B7335' },
    { label: 'Pro ($59/mo)',   count: pro,   setCount: setPro,   color: '#C8A951' },
    { label: 'Team ($99/mo)',  count: team,  setCount: setTeam,  color: '#D4B86A' },
  ]

  const forecastData = [1, 2, 3, 4, 5, 6].map(mo => ({
    month: `Mo ${mo}`,
    revenue: Math.round(monthly * (0.4 + mo * 0.12)),
  }))

  return (
    <div>
      <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Adjust Your User Mix</div>
          {tiers.map(t => (
            <div key={t.label} style={{ marginBottom: 18 }}>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ fontWeight: 500 }}>{t.label}</span>
                <span style={{ color: t.color, fontWeight: 700 }}>{t.count} users</span>
              </div>
              <input
                type="range"
                min="0" max="100"
                value={t.count}
                onChange={e => t.setCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: t.color }}
              />
            </div>
          ))}

          <div className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="money-stat">
              <div className="money-stat-val text-gold">${monthly.toLocaleString()}</div>
              <div className="money-stat-lbl">Est. monthly revenue</div>
            </div>
            <div className="money-stat">
              <div className="money-stat-val text-gold">${annual.toLocaleString()}</div>
              <div className="money-stat-lbl">Est. annual revenue</div>
            </div>
            <div className="money-stat">
              <div className="money-stat-val" style={{ color: 'var(--danger)', fontSize: 16 }}>-${apiCost}</div>
              <div className="money-stat-lbl">Est. API cost/mo</div>
            </div>
            <div className="money-stat">
              <div className="money-stat-val" style={{ color: 'var(--success)', fontSize: 16 }}>${profit.toLocaleString()}</div>
              <div className="money-stat-lbl">Est. net/mo</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{basic + pro + team} total users</span>
            <span className="text-muted"> at this mix. Pro tier is your margin sweet spot.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>6-Month Growth Projection</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#C8A951" strokeWidth={2} dot={{ fill: '#C8A951', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>
            <TrendingUp size={13} />
            Based on 12% month-over-month growth at current tier mix.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
const TABS = ['Revenue', 'Forecaster']

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Revenue')

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Revenue trends, client health, and business forecasting.</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {activeTab === 'Revenue' && <RevenueTab />}
      {activeTab === 'Forecaster' && <ForecasterTab />}
    </div>
  )
}
