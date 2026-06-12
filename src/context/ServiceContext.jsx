import { createContext, useContext, useState } from 'react'

const ServiceContext = createContext()

export const SERVICE_CONFIG = {
  cleaning: { label: 'Cleaning', icon: '🧹', jobLabel: 'Clean', workerLabel: 'Cleaner', jobsLabel: 'Cleans' },
  moving:   { label: 'Moving',   icon: '📦', jobLabel: 'Move',  workerLabel: 'Mover',   jobsLabel: 'Moves'  },
  handyman: { label: 'Handyman', icon: '🔧', jobLabel: 'Job',   workerLabel: 'Tech',    jobsLabel: 'Jobs'   },
}

export function ServiceProvider({ children }) {
  const [serviceType, setServiceTypeRaw] = useState(
    () => localStorage.getItem('cleanos_service') || 'cleaning'
  )
  const setServiceType = t => {
    setServiceTypeRaw(t)
    localStorage.setItem('cleanos_service', t)
  }
  return (
    <ServiceContext.Provider value={{ serviceType, setServiceType, config: SERVICE_CONFIG[serviceType] }}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useService = () => useContext(ServiceContext)
