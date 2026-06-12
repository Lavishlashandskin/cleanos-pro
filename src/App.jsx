import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Globe, Home, CalendarDays, DollarSign, Users, MoreHorizontal } from 'lucide-react'
import { PricingProvider } from './context/PricingContext.jsx'
import { ServiceProvider } from './context/ServiceContext.jsx'
import { upcomingJobs as initialJobs } from './data/sampleData.js'

import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ScopeIt from './components/ScopeIt.jsx'
import ComplaintHandler from './components/ComplaintHandler.jsx'
import ScheduleOptimizer from './components/ScheduleOptimizer.jsx'
import SupplyCalculator from './components/SupplyCalculator.jsx'
import MoneyTracker from './components/MoneyTracker.jsx'
import WorkerDashboard from './components/WorkerDashboard.jsx'
import ClientExperience from './components/ClientExperience.jsx'
import Analytics from './components/Analytics.jsx'
import Settings from './components/Settings.jsx'
import JobDetailModal from './components/JobDetailModal.jsx'
import Payments from './components/Payments.jsx'
import ClientPortalApp from './components/ClientPortalApp.jsx'
import MovingModule from './components/MovingModule.jsx'
import HandymanModule from './components/HandymanModule.jsx'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [jobs, setJobs] = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState(null)
  const [portalMode, setPortalMode] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('cleanos_theme') || 'dark')
  const mainRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cleanos_theme', theme)
  }, [theme])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [activePage])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const updateJob = (jobId, updates) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))
  }

  const handleSendWaiver = (jobId) => {
    updateJob(jobId, { waiverStatus: 'sent' })
  }

  const handleSignWaiver = (jobId, signerName) => {
    updateJob(jobId, { waiverStatus: 'signed', signedBy: signerName, signedAt: new Date().toISOString() })
  }

  if (portalMode) {
    return (
      <ClientPortalApp
        onExit={() => setPortalMode(false)}
        jobs={jobs}
        onSignWaiver={handleSignWaiver}
      />
    )
  }

  const jobProps = { jobs, onJobClick: setSelectedJob }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':          return <Dashboard {...jobProps} onSendWaiver={handleSendWaiver} />
      case 'scope-it':           return <ScopeIt />
      case 'complaint-handler':  return <ComplaintHandler />
      case 'schedule':           return <ScheduleOptimizer {...jobProps} />
      case 'supply-calculator':  return <SupplyCalculator />
      case 'money-tracker':      return <MoneyTracker />
      case 'workers':            return <WorkerDashboard />
      case 'clients':            return <ClientExperience />
      case 'analytics':          return <Analytics />
      case 'payments':           return <Payments />
      case 'settings':           return <Settings />
      case 'moving':             return <MovingModule />
      case 'handyman':           return <HandymanModule />
      default:                   return <Dashboard {...jobProps} onSendWaiver={handleSendWaiver} />
    }
  }

  return (
    <ServiceProvider>
      <PricingProvider>
        <div className="app">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          <div className="main-wrapper">
            <header className="topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="theme-toggle-btn"
                  onClick={() => setPortalMode(true)}
                  title="Open Client Portal"
                  style={{ width: 'auto', borderRadius: 6, padding: '0 10px', gap: 6, fontSize: 12, fontWeight: 600 }}
                >
                  <Globe size={13} />
                  Client Portal
                </button>
                <button
                  className="theme-toggle-btn"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
            </header>
            <main className="main-content" ref={mainRef}>
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
            onSave={(updates) => { updateJob(selectedJob.id, updates); setSelectedJob(null) }}
          />
        )}
      </PricingProvider>
    </ServiceProvider>
  )
}
