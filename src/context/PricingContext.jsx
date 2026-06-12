import { createContext, useContext, useState } from 'react'
import { useService } from './ServiceContext.jsx'

// ── Cleaning defaults ─────────────────────────────────────────────────────────
export const DEFAULT_PRICING_CLEANING = {
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

// ── Moving defaults ───────────────────────────────────────────────────────────
export const DEFAULT_PRICING_MOVING = {
  laborPerMoverHour: 85,
  minimumHours: 2,
  minimumMovers: 2,
  fuelSurcharge: 25,
  perMileRate: 1.50,
  stairSurcharge: 75,
  packingHourly: 55,
  disassemblyFee: 75,
  longCarryFee: 50,
  storagePerDay: 45,
  trucks: {
    van:    50,   // Cargo van
    small:  75,   // 10-ft
    medium: 100,  // 15-ft
    large:  125,  // 20-ft
    xl:     175,  // 26-ft
  },
}

// ── Handyman defaults ─────────────────────────────────────────────────────────
export const DEFAULT_PRICING_HANDYMAN = {
  laborHourly: 85,
  minimumCharge: 75,
  minimumHours: 1,
  emergencyRate: 130,
  weekendSurcharge: 25,
  tripFee: 0,
  materialsMarkup: 15, // percent
  specialty: {
    plumbing:    95,
    electrical:  110,
    hvac:        120,
    drywall:     80,
    painting:    70,
    carpentry:   90,
    tile:        85,
    roofing:     105,
  },
}

// Kept for backward compatibility (aiPlaceholders.js imports this)
export const DEFAULT_PRICING = DEFAULT_PRICING_CLEANING

export const DEFAULTS_BY_TYPE = {
  cleaning: DEFAULT_PRICING_CLEANING,
  moving:   DEFAULT_PRICING_MOVING,
  handyman: DEFAULT_PRICING_HANDYMAN,
}

// ── Context ───────────────────────────────────────────────────────────────────
const PricingContext = createContext(null)

function loadAll() {
  try {
    const stored = localStorage.getItem('cleanos_pricing_v2')
    if (!stored) return null
    return JSON.parse(stored)
  } catch { return null }
}

function mergeWithDefaults(stored, defaults) {
  if (!stored) return defaults
  const merged = { ...defaults, ...stored }
  // Deep merge nested objects (addOns, trucks, specialty)
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
      merged[key] = { ...defaults[key], ...(stored[key] || {}) }
    }
  }
  return merged
}

export function PricingProvider({ children }) {
  const [pricingAll, setPricingAll] = useState(() => {
    const stored = loadAll()
    return {
      cleaning: mergeWithDefaults(stored?.cleaning, DEFAULT_PRICING_CLEANING),
      moving:   mergeWithDefaults(stored?.moving,   DEFAULT_PRICING_MOVING),
      handyman: mergeWithDefaults(stored?.handyman, DEFAULT_PRICING_HANDYMAN),
    }
  })

  const saveAll = (next) => {
    setPricingAll(next)
    localStorage.setItem('cleanos_pricing_v2', JSON.stringify(next))
  }

  // Save pricing for a specific service type
  const savePricingForType = (type, data) => {
    const next = { ...pricingAll, [type]: data }
    saveAll(next)
  }

  // For backward compat — callers that don't pass a type get cleaning pricing
  // The Settings component passes the type explicitly now
  const savePricing = (data) => {
    savePricingForType('cleaning', data)
  }

  const resetToDefaults = (type) => {
    saveAll({ ...pricingAll, [type]: DEFAULTS_BY_TYPE[type] })
  }

  // pricing = cleaning pricing (backward compat for ScopeIt / aiPlaceholders)
  return (
    <PricingContext.Provider value={{
      pricing: pricingAll.cleaning,
      pricingAll,
      savePricing,
      savePricingForType,
      resetToDefaults,
    }}>
      {children}
    </PricingContext.Provider>
  )
}

export function usePricing() {
  return useContext(PricingContext)
}
