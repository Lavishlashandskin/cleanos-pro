import { createContext, useContext, useState, useEffect } from 'react'

const SubscriptionContext = createContext(null)

export const SUBSCRIPTION_STATES = {
  active:       { label: 'Active',       color: 'var(--success)',  bg: 'var(--bg-card)' },
  grace_period: { label: 'Grace Period', color: '#9A7020',         bg: '#FFF8EE' },
  suspended:    { label: 'Suspended',    color: 'var(--danger)',   bg: '#FAEAEA' },
  cancelled:    { label: 'Cancelled',    color: 'var(--text-muted)', bg: 'var(--bg-input)' },
}

export function SubscriptionProvider({ children }) {
  const [state, setState] = useState(() => localStorage.getItem('cleanos_sub_state') || 'active')
  const [graceDays, setGraceDays] = useState(() => parseInt(localStorage.getItem('cleanos_grace_days') || '3', 10))
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    localStorage.setItem('cleanos_sub_state', state)
  }, [state])

  useEffect(() => {
    localStorage.setItem('cleanos_grace_days', String(graceDays))
  }, [graceDays])

  const isReadOnly = state === 'suspended' || state === 'cancelled'

  const retryPayment = async () => {
    setRetrying(true)
    await new Promise(r => setTimeout(r, 1800))
    setRetrying(false)
    setState('active')
    setGraceDays(3)
  }

  const reactivate = async () => {
    setRetrying(true)
    await new Promise(r => setTimeout(r, 1800))
    setRetrying(false)
    setState('active')
    setGraceDays(3)
  }

  const simulateFailedPayment = () => {
    setState('grace_period')
    setGraceDays(3)
  }

  const simulateSuspend = () => setState('suspended')
  const simulateCancel  = () => setState('cancelled')

  return (
    <SubscriptionContext.Provider value={{
      state, setState, graceDays, setGraceDays,
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
