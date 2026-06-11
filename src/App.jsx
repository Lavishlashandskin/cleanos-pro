import { useState, useEffect } from 'react'
import { Sun, Moon, Globe } from 'lucide-react'
import { PricingProvider } from './context/PricingContext.jsx'
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

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [jobs, setJobs] = useState(initialJobs)
  const [selectedJob, setSelectedJob] = useState(null)
  const [portalMode, setPortalMode] = useState(false)

  const [theme, setTheme] = useState(() => localStorage.getItem('cleanos_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cleanos_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const updateJob = (jobId, updates) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j))
  }

  if (portalMode) {
    return <ClientPortalApp onExit={() => setPortalMode(false)} />
  }

  const jobProps = { jobs, onJobClick: setSelectedJob }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':          return <Dashboard {...jobProps} />
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
      default:                   return <Dashboard {...jobProps} />
    }
  }

  return (
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
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={(updates) => { updateJob(selectedJob.id, updates); setSelectedJob(null) }}
        />
      )}
    <div className="mobile-bottom-nav"><button onClick={()=>setActivePage("dashboard")} className={activePage==="dashboard"?"active":""}>🏠<span>Home</span></button><button onClick={()=>setActivePage("schedule")} className={activePage==="schedule"?"active":""}>📅<span>Schedule</span></button><button onClick={()=>setActivePage("money-tracker")} className={activePage==="money-tracker"?"active":""}>💰<span>Money</span></button><button onClick={()=>setActivePage("workers")} className={activePage==="workers"?"active":""}>👥<span>Team</span></button><button onClick={()=>setActivePage("settings")} className={activePage==="settings"?"active":""}>⚙️<span>More</span></button></div></PricingProvider>
  )
}
