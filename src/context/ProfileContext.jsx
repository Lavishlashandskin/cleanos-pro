import { createContext, useContext, useState } from 'react'

const DEFAULTS = {
  ownerName:    'Ashley',
  ownerRole:    'Owner · CEO',
  businessName: '',
  email:        '',
  phone:        '',
  website:      '',
  sendgridKey:  '',
  googleMapsKey: '',
  bookingUrl:   '',
}

const ProfileContext = createContext(null)

function load() {
  try {
    const s = localStorage.getItem('cleanos_profile')
    return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS
  } catch { return DEFAULTS }
}

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(load)

  const saveProfile = (data) => {
    const next = { ...profile, ...data }
    setProfileState(next)
    localStorage.setItem('cleanos_profile', JSON.stringify(next))
    // Expose runtime Maps key override so googleMaps.js can pick it up
    if (data.googleMapsKey !== undefined) {
      localStorage.setItem('cleanos_maps_key_override', data.googleMapsKey)
    }
    if (data.sendgridKey !== undefined) {
      localStorage.setItem('cleanos_sendgrid_key', data.sendgridKey)
    }
  }

  return (
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)

// Read profile without needing React context (for BookingPage, portal, etc.)
export function getStoredProfile() {
  return load()
}
