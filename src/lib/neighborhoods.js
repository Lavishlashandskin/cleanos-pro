export const NEIGHBORHOODS = [
  { id: 'sw-reno',    label: 'SW Reno',     color: '#6E9E8A', zips: ['89519'] },
  { id: 'west-reno',  label: 'West Reno',   color: '#5E8FB5', zips: ['89509'] },
  { id: 'midtown',    label: 'Midtown',     color: '#C8A040', zips: ['89503'] },
  { id: 'nw-reno',    label: 'NW Reno',     color: '#9B7BB0', zips: ['89523'] },
  { id: 'south-reno', label: 'South Reno',  color: '#A86B6B', zips: ['89511', '89502'] },
  { id: 'se-reno',    label: 'SE Reno',     color: '#7B9E6E', zips: ['89521'] },
  { id: 'sparks',     label: 'Sparks',      color: '#C47D5A', zips: ['89436', '89434'] },
]

function getNeighborhoodFromCity(cityStr) {
  if (!cityStr) return null
  const zip = cityStr.match(/\d{5}/)?.[0]
  if (zip) return NEIGHBORHOODS.find(n => n.zips.includes(zip)) ?? null
  if (cityStr.includes('Sparks')) return NEIGHBORHOODS.find(n => n.id === 'sparks')
  return null
}

export function getJobNeighborhood(job, clients) {
  if (job.clientId) {
    const client = clients.find(c => c.id === job.clientId)
    if (client) return getNeighborhoodFromCity(client.city)
  }
  const addr = (job.address || '').toLowerCase()
  if (addr.includes('summit ridge') || addr.includes('autumn sage') || addr.includes('pinecrest')) {
    return NEIGHBORHOODS.find(n => n.id === 'nw-reno')
  }
  if (addr.includes('keystone') || addr.includes('midtown') || addr.includes('red rock')) {
    return NEIGHBORHOODS.find(n => n.id === 'midtown')
  }
  return null
}

// Returns { [neighborhoodId]: { neighborhood, jobs, days: Set<dayAbbrev> } }
export function groupJobsByNeighborhood(jobs, clients) {
  const groups = {}
  for (const job of jobs) {
    const n = getJobNeighborhood(job, clients)
    const id = n?.id ?? 'other'
    if (!groups[id]) {
      groups[id] = {
        neighborhood: n ?? { id: 'other', label: 'Other', color: '#666666' },
        jobs: [],
        days: new Set(),
      }
    }
    groups[id].jobs.push(job)
    groups[id].days.add(job.day)
  }
  return groups
}
