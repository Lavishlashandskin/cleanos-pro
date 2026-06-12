import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Globe, Home, CalendarDays, DollarSign, Users, MoreHorizontal, AlertTriangle, X, ExternalLink } from 'lucide-react'
import { PricingProvider } from './context/PricingContext.jsx'
import { ServiceProvider } from './context/ServiceContext.jsx'
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { upcomingJobs as initialJobs } from './data/sampleData.js'

import Sidebar        from './components/Sidebar.jsx'
import Dashboard      from './components/Dashboard.jsx'
import ScopeIt        from './components/ScopeIt.jsx'
import ComplaintHandler from './components/ComplaintHandler.jsx'
import ScheduleOptimizer from './components/ScheduleOptimizer.jsx'
import SupplyCalculator from './components/SupplyCalculator.jsx'
import MoneyTracker   from './components/MoneyTracker.jsx'
import WorkerDashboard from './components/WorkerDashboard.jsx'
import ClientExperience from './components/ClientExperience.jsx'
import Analytics      from './components/Analytics.jsx'
import Settings       from './components/Settings.jsx'
import JobDetailModal from './components/JobDetailModal.jsx'
import Payments       from './components/Payments.jsx'
import ClientPortalApp from './components/ClientPortalApp.jsx'
import MovingModule   from './components/MovingModule.jsx'
import HandymanModule from './components/HandymanModule.jsx'
import AutoComms      from './components/AutoComms.jsx'
import ContractorTax  from './components/ContractorTax.jsx'
import MileageTracker from './components/MileageTracker.jsx'

function SubscriptionBanner() {
  const { state, graceDays, retrying, retryPayment, reactivate, setState } = useSubscription()
  const [dismissed, setDismissed] = useState(false)

  if (state === 'active' || dismissed) return null

  const configs = {
    grace_period: {
      bg: '#FFF8EE', border: '#D4B86A', color: '#9A7020',
      icon: <AlertTriangle size={15} />,
      text: `Payment failed — your account enters read-only mode in ${graceDays} day${graceDays !== 1 ? 's' : ''}. Please update your payment method.`,
      action: retrying ? 'Retrying…' : 'Retry Payment',
      onAction: retryPayment,
    },
    suspended: {
      bg: '#FAEAEA', border: '#C07070', color: '#A04040',
      icon: <AlertTriangle size={15} />,
      text: 'Account suspended — read-only mode active. Your data is safe. Reactivate to resume full access.',
      action: retrying ? 'Reactivating…' : 'Reactivate Account',
      onAction: reactivate,
    },
    cancelled: {
      bg: 'var(--bg-input)', border: 'var(--border)', color: 'var(--text-muted)',
      icon: <AlertTriangle size={15} />,
      text: 'Account cancelled — your data is retained for 24 months per our data retention policy. Reactivate anytime.',
      action: retrying ? 'Reactivating…' : 'Reactivate',
      onAction: reactivate,
    },
  }

  const cfg = configs[state]
  if (!cfg) return null

  return (
    <div style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 200, position: 'relative' }}>
      <span style={{ color: cfg.color, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: cfg.color }}>{cfg.text}</span>
      <button
        disabled={retrying}
        onClick={cfg.onAction}
        style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${cfg.border}`, background: 'transparent', color: cfg.color, fontSize: 12, fontWeight: 700, cursor: retrying ? 'wait' : 'pointer', flexShrink: 0, fontFamily: 'inherit' }}
      >
        {cfg.action}
      </button>
      {state !== 'suspended' && (
        <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: cfg.color, cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function AppInner() {
  const [activePage, setActivePage]   = useState('dashboard')
  const [jobs, setJobs]               = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState(null)
  const [portalMode, setPortalMode]   = useState(false)
  const [theme, setTheme]             = useState(() => localStorage.getItem('cleanos_theme') || 'dark')
  const mainRef = useRef(null)
  const { isReadOnly } = useSubscription()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cleanos_theme', theme)
  }, [theme])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [activePage])

  const updateJob = (jobId, updates) =>
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))

  // Waiver handlers
  const handleSendWaiver = (jobId) => {
    if (isReadOnly) return
    updateJob(jobId, { waiverStatus: 'sent' })
  }
  const handleSignWaiver = (jobId, signerName) => {
    updateJob(jobId, { waiverStatus: 'signed', signedBy: signerName, signedAt: new Date().toISOString() })
  }

  // Comms handler
  const handleUpdateComm = (jobId, commType) => {
    if (isReadOnly) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    updateJob(jobId, { commsLog: { ...(job.commsLog || {}), [commType]: 'sent' } })
  }

  // GPS handlers
  const handleClockIn = (jobId, location) => {
    if (isReadOnly) return
    updateJob(jobId, { clockIn: location, status: 'in-progress' })
  }
  const handleClockOut = (jobId, location) => {
    if (isReadOnly) return
    updateJob(jobId, { clockOut: location })
  }

  // Completion handler
  const handleCompleteJob = (jobId, checklistData) => {
    if (isReadOnly) return
    updateJob(jobId, {
      status: 'completed',
      completionChecklist: checklistData.checklist,
      completedAt: checklistData.completedAt,
    })
  }

  // Rating request handler — marks commsLog.review as sent
  const handleRequestRating = (jobId) => {
    if (isReadOnly) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    updateJob(jobId, { commsLog: { ...(job.commsLog || {}), review: 'sent' } })
  }

  // Client rating from portal
  const handleRateJob = (jobId, rating, note = '') => {
    updateJob(jobId, { clientRating: rating, ratingNote: note })
  }

  if (portalMode) {
    return (
      <ClientPortalApp
        onExit={() => setPortalMode(false)}
        jobs={jobs}
        onSignWaiver={handleSignWaiver}
        onRateJob={handleRateJob}
      />
    )
  }

  const jobProps = { jobs, onJobClick: setSelectedJob }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':         return <Dashboard {...jobProps} onSendWaiver={handleSendWaiver} />
      case 'scope-it':          return <ScopeIt />
      case 'complaint-handler': return <ComplaintHandler />
      case 'schedule':          return <ScheduleOptimizer {...jobProps} />
      case 'supply-calculator': return <SupplyCalculator />
      case 'money-tracker':     return <MoneyTracker />
      case 'workers':           return <WorkerDashboard jobs={jobs} onClockIn={handleClockIn} onClockOut={handleClockOut} />
      case 'clients':           return <ClientExperience />
      case 'analytics':         return <Analytics />
      case 'payments':          return <Payments />
      case 'settings':          return <Settings />
      case 'moving':            return <MovingModule />
      case 'handyman':          return <HandymanModule />
      case 'auto-comms':        return <AutoComms jobs={jobs} onUpdateComm={handleUpdateComm} />
      case 'contractor-tax':    return <ContractorTax />
      case 'mileage':           return <MileageTracker />
      default:                  return <Dashboard {...jobProps} onSendWaiver={handleSendWaiver} />
    }
  }

  return (
    <LocationProvider>
    <ServiceProvider>
      <PricingProvider>
        <div className="app">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          <div className="main-wrapper">
            <SubscriptionBanner />
            <header className="topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href="/book"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-toggle-btn"
                  title="Open public booking page"
                  style={{ width: 'auto', borderRadius: 6, padding: '0 10px', gap: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLink size={13} /> Book Page
                </a>
                <button
                  className="theme-toggle-btn"
                  onClick={() => setPortalMode(true)}
                  title="Open Client Portal"
                  style={{ width: 'auto', borderRadius: 6, padding: '0 10px', gap: 6, fontSize: 12, fontWeight: 600 }}
                >
                  <Globe size={13} /> Client Portal
                </button>
                <button
                  className="theme-toggle-btn"
                  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
            </header>
            <main className="main-content" ref={mainRef}>
              {isReadOnly && (
                <div style={{ marginBottom: 16, padding: '8px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={13} /> View-only mode — reactivate your subscription to make changes.
                </div>
              )}
              {renderPage()}
            </main>
          </div>
        </div>

        <nav className="mobile-bottom-nav">
          <button onClick={() => setActivePage('dashboard')} className={activePage === 'dashboard' ? 'active' : ''}>
            <Home size={20} /><span>Home</span>
          </button>
          <button onClick={() => setActivePage('schedule')} className={activePage === 'schedule' ? 'active' : ''}>
            <CalendarDays size={20} /><span>Schedule</span>
          </button>
          <button onClick={() => setActivePage('money-tracker')} className={activePage === 'money-tracker' ? 'active' : ''}>
            <DollarSign size={20} /><span>Money</span>
          </button>
          <button onClick={() => setActivePage('workers')} className={activePage === 'workers' ? 'active' : ''}>
            <Users size={20} /><span>Team</span>
          </button>
          <button onClick={() => setActivePage('settings')} className={activePage === 'settings' ? 'active' : ''}>
            <MoreHorizontal size={20} /><span>More</span>
          </button>
        </nav>

        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onSave={(updates) => { if (!isReadOnly) { updateJob(selectedJob.id, updates); setSelectedJob(null) } }}
            onCompleteJob={handleCompleteJob}
            onRequestRating={handleRequestRating}
          />
        )}
      </PricingProvider>
    </ServiceProvider>
    </LocationProvider>
  )
}

export default function App() {
  return (
    <SubscriptionProvider>
      <ProfileProvider>
        <AppInner />
      </ProfileProvider>
    </SubscriptionProvider>
  )
}
