import {
  LayoutDashboard, Sparkles, MessageSquareWarning, CalendarDays,
  Package, DollarSign, Users, Heart, BarChart3, Zap, Settings, CreditCard,
} from 'lucide-react'

const NAV = [
  { section: 'OVERVIEW', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'AI TOOLS', items: [
    { id: 'scope-it',          label: 'Scope It',          icon: Sparkles },
    { id: 'complaint-handler', label: 'Complaint Handler', icon: MessageSquareWarning },
    { id: 'schedule',          label: 'Smart Schedule',    icon: CalendarDays },
    { id: 'supply-calculator', label: 'Supply Calculator', icon: Package },
  ]},
  { section: 'BUSINESS', items: [
    { id: 'money-tracker', label: 'Money Tracker',     icon: DollarSign },
    { id: 'payments',      label: 'Payments',          icon: CreditCard },
    { id: 'workers',       label: 'Workers',           icon: Users },
    { id: 'clients',       label: 'Client Experience', icon: Heart },
    { id: 'analytics',     label: 'Analytics',         icon: BarChart3 },
  ]},
  { section: 'SYSTEM', items: [
    { id: 'settings', label: 'Pricing & Settings', icon: Settings },
  ]},
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className="logo-name">CleanOS Pro</div>
          <div className="logo-sub">Cleaning OS</div>
        </div>
      </div>

      <nav style={{ flex: 1, paddingBottom: 12 }}>
        {NAV.map(group => (
          <div key={group.section} className="sidebar-section">
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item${activePage === id ? ' active' : ''}`}
                onClick={() => onNavigate(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">A</div>
          <div>
            <div className="user-name">Ashley</div>
            <div className="user-role">Owner · CEO</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
