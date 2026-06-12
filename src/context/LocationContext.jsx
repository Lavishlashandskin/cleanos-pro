import { createContext, useContext, useState, useCallback } from 'react'
import { geocodeAddress } from '../lib/googleMaps.js'

const LocationContext = createContext(null)

// Default zones (match original Reno sample data — user can edit/replace)
const INITIAL_ZONES = [
  { id: 'sw-reno',    label: 'SW Reno',    color: '#6E9E8A', zips: ['89519'],        keywords: ['meadow creek', 'lakeridge'] },
  { id: 'west-reno',  label: 'West Reno',  color: '#5E8FB5', zips: ['89509'],        keywords: ['sierra vista'] },
  { id: 'midtown',    label: 'Midtown',    color: '#C8A040', zips: ['89503'],        keywords: ['keystone', 'midtown', 'red rock'] },
  { id: 'nw-reno',    label: 'NW Reno',    color: '#9B7BB0', zips: ['89523'],        keywords: ['summit ridge', 'autumn sage', 'pinecrest'] },
  { id: 'south-reno', label: 'South Reno', color: '#A86B6B', zips: ['89511','89502'], keywords: ['desert wind', 'college pkwy', 'quail ridge'] },
  { id: 'se-reno',    label: 'SE Reno',    color: '#7B9E6E', zips: ['89521'],        keywords: ['vista hills'] },
  { id: 'sparks',     label: 'Sparks',     color: '#C47D5A', zips: ['89436','89434'], keywords: ['sparks', 'sage summit'] },
]

const PALETTE = [
  '#6E9E8A','#5E8FB5','#C8A040','#9B7BB0','#A86B6B',
  '#7B9E6E','#C47D5A','#4A8FA8','#A89B4A','#7A7AB0',
]

function loadFromStorage(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}

export function LocationProvider({ children }) {
  const [zones, setZonesState] = useState(() => loadFromStorage('cleanos_zones', INITIAL_ZONES))
  const [businessInfo, setBusinessInfoState] = useState(() =>
    loadFromStorage('cleanos_biz_info', { city: '', baseAddress: '', businessName: '' })
  )

  const setZones = (z) => {
    setZonesState(z)
    localStorage.setItem('cleanos_zones', JSON.stringify(z))
  }

  const setBusinessInfo = (info) => {
    setBusinessInfoState(info)
    localStorage.setItem('cleanos_biz_info', JSON.stringify(info))
  }

  const addZone = (zone) => {
    const id = zone.label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    const color = PALETTE[zones.length % PALETTE.length]
    const zips = zone.zipsRaw ? zone.zipsRaw.split(',').map(z => z.trim()).filter(Boolean) : []
    const keywords = zone.keywordsRaw ? zone.keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : []
    const newZone = { id, color, ...zone, zips, keywords }
    delete newZone.zipsRaw
    delete newZone.keywordsRaw
    setZones([...zones, newZone])
    return newZone
  }

  const updateZone = (id, updates) => setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z))
  const removeZone = (id) => setZones(zones.filter(z => z.id !== id))

  // Resolve an address to a zone — ZIP match, then keyword, then Maps geocode
  const resolveZone = useCallback(async (address) => {
    if (!address) return null

    const zipMatch = address.match(/\b\d{5}\b/)
    if (zipMatch) {
      const zone = zones.find(z => z.zips?.includes(zipMatch[0]))
      if (zone) return zone
    }

    const addrLower = address.toLowerCase()
    const kwZone = zones.find(z => z.keywords?.some(kw => addrLower.includes(kw.toLowerCase())))
    if (kwZone) return kwZone

    const geo = await geocodeAddress(address)
    if (geo?.zip) {
      const zone = zones.find(z => z.zips?.includes(geo.zip))
      if (zone) return zone
    }

    return null
  }, [zones])

  // Synchronous version for rendering (no geocode fallback)
  const resolveZoneSync = useCallback((address) => {
    if (!address) return null
    const zipMatch = address.match(/\b\d{5}\b/)
    if (zipMatch) {
      const zone = zones.find(z => z.zips?.includes(zipMatch[0]))
      if (zone) return zone
    }
    const addrLower = address.toLowerCase()
    return zones.find(z => z.keywords?.some(kw => addrLower.includes(kw.toLowerCase()))) ?? null
  }, [zones])

  return (
    <LocationContext.Provider value={{
      zones, businessInfo,
      setBusinessInfo, addZone, updateZone, removeZone,
      resolveZone, resolveZoneSync,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider')
  return ctx
}
