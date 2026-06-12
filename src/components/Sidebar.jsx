import { useState } from 'react'
import {
  LayoutDashboard, Sparkles, MessageSquareWarning, CalendarDays,
  Package, DollarSign, Users, Heart, BarChart3, Zap, Settings,
  CreditCard, Menu, X, Truck, Wrench, MessageSquare, FileText, Car,
} from 'lucide-react'
import { useService, SERVICE_CONFIG } from '../context/ServiceContext.jsx'

const NAV_CLEANING = [
  { section: 'OVERVIEW', items: [
    { id: 'dashboard',         label: 'Dashboard',         icon: LayoutDashboard },
  ]},
  { section: 'AI TOOLS', items: [
    { id: 'scope-it',          label: 'Scope It',          icon: Sparkles },
    { id: 'complaint-handler', label: 'Complaint Handler', icon: MessageSquareWarning },
    { id: 'schedule',          label: 'Smart Schedule',    icon: CalendarDays },
    { id: 'supply-calculator', label: 'Supply Calculator', icon: Package },
    { id: 'auto-comms',        label: 'Auto Comms',        icon: MessageSquare },
  ]},
  { section: 'BUSINESS', items: [
    { id: 'money-tracker',    label: 'Money Tracker',      icon: DollarSign },
    { id: 'payments',         label: 'Payments',           icon: CreditCard },
    { id: 'workers',          label: 'Workers',            icon: Users },
    { id: 'clients',          label: 'Client Experience',  icon: Heart },
    { id: 'analytics',        label: 'Analytics',          icon: BarChart3 },
    { id: 'contractor-tax',   label: '1099 Tracking',      icon: FileText },
    { id: 'mileage',          label: 'Mileage Tracker',    icon: Car },
  ]},
  { section: 'SYSTEM', items: [
    { id: 'settings', label: 'Pricing & Settings', icon: Settings },
  ]},
]

const NAV_MOVING = [
  { section: 'OVERVIEW', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'MOVING', items: [
    { id: 'moving',     label: 'Moving Hub',  icon: Truck },
    { id: 'schedule',   label: 'Schedule',    icon: CalendarDays },
    { id: 'auto-comms', label: 'Auto Comms',  icon: MessageSquare },
  ]},
  { section: 'BUSINESS', items: [
    { id: 'money-tracker',  label: 'Money Tracker',  icon: DollarSign },
    { id: 'payments',       label: 'Payments',       icon: CreditCard },
    { id: 'workers',        label: 'Workers',        icon: Users },
    { id: 'clients',        label: 'Clients',        icon: Heart },
    { id: 'analytics',      label: 'Analytics',      icon: BarChart3 },
    { id: 'contractor-tax', label: '1099 Tracking',  icon: FileText },
    { id: 'mileage',        label: 'Mileage Tracker', icon: Car },
  ]},
  { section: 'SYSTEM', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
  ]},
]

const NAV_HANDYMAN = [
  { section: 'OVERVIEW', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'HANDYMAN', items: [
    { id: 'handyman',   label: 'Handyman Hub', icon: Wrench },
    { id: 'schedule',   label: 'Schedule',     icon: CalendarDays },
    { id: 'auto-comms', label: 'Auto Comms',   icon: MessageSquare },
  ]},
  { section: 'BUSINESS', items: [
    { id: 'money-tracker',  label: 'Money Tracker',  icon: DollarSign },
    { id: 'payments',       label: 'Payments',       icon: CreditCard },
    { id: 'workers',        label: 'Workers',        icon: Users },
    { id: 'clients',        label: 'Clients',        icon: Heart },
    { id: 'analytics',      label: 'Analytics',      icon: BarChart3 },
    { id: 'contractor-tax', label: '1099 Tracking',  icon: FileText },
    { id: 'mileage',        label: 'Mileage Tracker', icon: Car },
  ]},
  { section: 'SYSTEM', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
  ]},
]

const NAV_BY_TYPE = { cleaning: NAV_CLEANING, moving: NAV_MOVING, handyman: NAV_HANDYMAN }

export default function Sidebar({ activePage, onNavigate }) {
  const [open, setOpen] = useState(false)
  const { serviceType } = useService()
  const nav = NAV_BY_TYPE[serviceType] || NAV_CLEANING
  const cfg = SERVICE_CONFIG[serviceType]

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 1000, background: '#b5924c', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: 'white' }}
        className="mobile-menu-btn"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998, display: 'none' }} className="mobile-overlay" />
      )}

      <aside className={`sidebar${open ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Zap size={16} strokeWidth={2.5} /></div>
          <div>
            <div className="logo-name">CleanOS Pro</div>
            <div className="logo-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{cfg.icon}</span>
              <span>{cfg.label} Mode</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, paddingBottom: 12 }}>
          {nav.map(group => (
            <div key={group.section} className="sidebar-section">
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`nav-item${activePage === id ? ' active' : ''}`}
                  onClick={() => { onNavigate(id); setOpen(false) }}
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
    </>
  )
}
