// Dynamic zone/neighborhood resolution
// Components should prefer useLocation() from LocationContext; these helpers
// remain for callers that pass zones explicitly.

export function getJobZone(job, zones, clients) {
  const address = (() => {
    if (job.clientId && clients) {
      const c = clients.find(c => c.id === job.clientId)
      if (c) return `${c.address} ${c.city}`
    }
    return job.address || ''
  })()

  if (!address) return null

  const zipMatch = address.match(/\b\d{5}\b/)
  if (zipMatch) {
    const zone = zones.find(z => z.zips?.includes(zipMatch[0]))
    if (zone) return zone
  }

  const addrLower = address.toLowerCase()
  return zones.find(z => z.keywords?.some(kw => addrLower.includes(kw.toLowerCase()))) ?? null
}

export function groupJobsByZone(jobs, zones, clients) {
  const groups = {}
  for (const job of jobs) {
    const z = getJobZone(job, zones, clients)
    const id = z?.id ?? 'other'
    if (!groups[id]) {
      groups[id] = {
        zone: z ?? { id: 'other', label: 'Other', color: '#666666' },
        jobs: [],
        days: new Set(),
      }
    }
    groups[id].jobs.push(job)
    groups[id].days.add(job.day)
  }
  return groups
}

// Legacy aliases kept for any remaining direct imports
export { getJobZone as getJobNeighborhood }
export { groupJobsByZone as groupJobsByNeighborhood }
