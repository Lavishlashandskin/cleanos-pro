import { createContext, useContext, useState } from 'react'

export const DEFAULT_PRICING = {
  standardBase: 80,
  perBedroom: 35,
  perBathroom: 20,
  deepCleanSurcharge: 50,
  moveInOut: 220,
  airbnb: 120,
  organizing: 65,
  hourlyRate: 55,
  addOns: {
    oven: 30,
    fridge: 25,
    windows: 35,
    laundry: 20,
    baseboards: 25,
    garage: 40,
  },
}

const PricingContext = createContext(null)

export function PricingProvider({ children }) {
  const [pricing, setPricingState] = useState(() => {
    try {
      const stored = localStorage.getItem('cleanos_pricing')
      if (!stored) return DEFAULT_PRICING
      const parsed = JSON.parse(stored)
      return {
        ...DEFAULT_PRICING,
        ...parsed,
        addOns: { ...DEFAULT_PRICING.addOns, ...(parsed.addOns || {}) },
      }
    } catch {
      return DEFAULT_PRICING
    }
  })

  const savePricing = (next) => {
    setPricingState(next)
    localStorage.setItem('cleanos_pricing', JSON.stringify(next))
  }

  return (
    <PricingContext.Provider value={{ pricing, savePricing }}>
      {children}
    </PricingContext.Provider>
  )
}

export function usePricing() {
  return useContext(PricingContext)
}
