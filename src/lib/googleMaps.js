// Google Maps API loader and utilities
// Set VITE_GOOGLE_MAPS_KEY in .env to enable live geocoding and distance calculation

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

let loadPromise = null

export function isConfigured() {
  return !!API_KEY
}

export async function loadGoogleMaps() {
  if (!API_KEY) return null
  if (window.google?.maps) return window.google.maps
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => { resolve(window.google.maps); loadPromise = null }
    script.onerror = (e) => { reject(e); loadPromise = null }
    document.head.appendChild(script)
  })
  return loadPromise
}

export async function geocodeAddress(address) {
  if (!API_KEY || !address?.trim()) return null
  try {
    const maps = await loadGoogleMaps()
    if (!maps) return null
    const geocoder = new maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location
          const comps = results[0].address_components
          const zip   = comps.find(c => c.types.includes('postal_code'))?.short_name
          const city  = comps.find(c => c.types.includes('locality'))?.long_name
          const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.short_name
          resolve({ lat: loc.lat(), lng: loc.lng(), zip, city, state, formatted: results[0].formatted_address })
        } else {
          resolve(null)
        }
      })
    })
  } catch {
    return null
  }
}

export async function getDistanceMiles(origin, destination) {
  if (!API_KEY || !origin || !destination) return null
  try {
    const maps = await loadGoogleMaps()
    if (!maps) return null
    const service = new maps.DistanceMatrixService()
    return new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: maps.TravelMode.DRIVING,
          unitSystem: maps.UnitSystem.IMPERIAL,
        },
        (response, status) => {
          if (status !== 'OK') { resolve(null); return }
          const element = response.rows[0]?.elements[0]
          if (element?.status !== 'OK') { resolve(null); return }
          const miles = Math.round((element.distance.value / 1609.344) * 10) / 10
          const durationMin = Math.round(element.duration.value / 60)
          resolve({ miles, durationMin, distanceText: element.distance.text, durationText: element.duration.text })
        }
      )
    })
  } catch {
    return null
  }
}

export async function optimizeRouteOrder(addresses) {
  if (!API_KEY || !addresses || addresses.length < 2) return null
  try {
    const maps = await loadGoogleMaps()
    if (!maps) return null
    const service = new maps.DistanceMatrixService()
    return new Promise((resolve) => {
      service.getDistanceMatrix(
        { origins: addresses, destinations: addresses, travelMode: maps.TravelMode.DRIVING },
        (response, status) => {
          if (status !== 'OK') { resolve(null); return }
          const n = addresses.length
          const dist = response.rows.map(row => row.elements.map(el => el.distance?.value ?? Infinity))

          // Nearest-neighbor greedy TSP
          const visited = new Array(n).fill(false)
          const order = [0]
          visited[0] = true
          for (let i = 1; i < n; i++) {
            const last = order[order.length - 1]
            let best = -1, bestDist = Infinity
            for (let j = 0; j < n; j++) {
              if (!visited[j] && dist[last][j] < bestDist) { best = j; bestDist = dist[last][j] }
            }
            order.push(best)
            visited[best] = true
          }

          // Calculate savings vs original order
          let origDist = 0, optDist = 0
          for (let i = 0; i < n - 1; i++) {
            origDist += dist[i][i + 1] ?? 0
            optDist  += dist[order[i]][order[i + 1]] ?? 0
          }
          const savedMeters = Math.max(0, origDist - optDist)
          const savedMiles = Math.round(savedMeters / 1609.344 * 10) / 10
          const savedMin = Math.round((savedMiles / 25) * 60) // estimate at 25 mph avg
          resolve({ order, savedMiles, savedMin })
        }
      )
    })
  } catch {
    return null
  }
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// Fallback: estimate distance in miles from two lat/lng pairs (Haversine)
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
