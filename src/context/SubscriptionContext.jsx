import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SubscriptionContext = createContext(null)

export const SUBSCRIPTION_STATES = {
  active:       { label: 'Active',       color: 'var(--success)',    bg: 'var(--bg-card)' },
  grace_period: { label: 'Grace Period', color: '#9A7020',           bg: '#FFF8EE' },
  suspended:    { label: 'Suspended',    color: 'var(--danger)',     bg: '#FAEAEA' },
  cancelled:    { label: 'Cancelled',    color: 'var(--text-muted)', bg: 'var(--bg-input)' },
}

const GRACE_PERIOD_DAYS = 3

function getRemainingGraceDays(expiryIso) {
  if (!expiryIso) return 0
  const msRemaining = new Date(expiryIso) - new Date()
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
}

function loadFromStorage(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

export function SubscriptionProvider({ children }) {
  const [state, setState_]           = useState(() => loadFromStorage('cleanos_sub_state', 'active'))
  const [graceExpiry, setGraceExpiry_] = useState(() => loadFromStorage('cleanos_grace_expiry', null))
  const [retrying, setRetrying]      = useState(false)

  const graceDays = getRemainingGraceDays(graceExpiry)

  const setState = useCallback((s) => {
    setState_(s)
    localStorage.setItem('cleanos_sub_state', s)
  }, [])

  const setGraceExpiry = useCallback((dt) => {
    setGraceExpiry_(dt)
    if (dt) localStorage.setItem('cleanos_grace_expiry', dt)
    else localStorage.removeItem('cleanos_grace_expiry')
  }, [])

  // Auto-advance: grace period → suspended when expiry passes
  useEffect(() => {
    if (state !== 'grace_period' || !graceExpiry) return
    if (graceDays === 0) {
      setState('suspended')
      setGraceExpiry(null)
      return
    }
    const msToExpiry = new Date(graceExpiry) - new Date()
    const timer = setTimeout(() => {
      setState('suspended')
      setGraceExpiry(null)
    }, msToExpiry + 1000)
    return () => clearTimeout(timer)
  }, [state, graceExpiry, graceDays, setState, setGraceExpiry])

  const isReadOnly = state === 'suspended' || state === 'cancelled'

  const retryPayment = async () => {
    setRetrying(true)
    await new Promise(r => setTimeout(r, 1800))
    setRetrying(false)
    setState('active')
    setGraceExpiry(null)
  }

  const reactivate = async () => {
    setRetrying(true)
    await new Promise(r => setTimeout(r, 1800))
    setRetrying(false)
    setState('active')
    setGraceExpiry(null)
  }

  const simulateFailedPayment = () => {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + GRACE_PERIOD_DAYS)
    setState('grace_period')
    setGraceExpiry(expiry.toISOString())
  }

  const simulateSuspend  = () => { setState('suspended');  setGraceExpiry(null) }
  const simulateCancel   = () => { setState('cancelled');  setGraceExpiry(null) }

  return (
    <SubscriptionContext.Provider value={{
      state, setState, graceDays, graceExpiry,
      isReadOnly, retrying,
      retryPayment, reactivate,
      simulateFailedPayment, simulateSuspend, simulateCancel,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return ctx
}
