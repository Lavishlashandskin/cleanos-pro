// All functions are stubs returning realistic sample data with simulated delay.
// TODO: Replace each body with a real Anthropic API call.
// Pattern: const msg = await anthropic.messages.create({ model: "claude-opus-4-8", ... })

import { DEFAULT_PRICING } from '../context/PricingContext.jsx'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

// TODO: wire up — POST form + pricing to Anthropic, return structured line-item quote
export async function generateQuote(form, pricing = DEFAULT_PRICING) {
  await delay(1300)

  const beds  = parseInt(form.bedrooms) || 3
  const baths = parseFloat(form.bathrooms) || 2

  let base
  switch (form.jobType) {
    case 'moveout':     base = pricing.moveInOut; break
    case 'airbnb':      base = pricing.airbnb;    break
    case 'organizing':  base = pricing.organizing * (parseInt(form.hours) || 2); break
    default:
      base = pricing.standardBase + beds * pricing.perBedroom + Math.max(0, baths - 1) * pricing.perBathroom
  }

  const lineItems = [
    {
      description: form.jobType === 'moveout' ? `Move-out deep clean — ${beds}bd / ${baths}ba`
        : form.jobType === 'airbnb' ? 'Airbnb turnover — full reset'
        : form.jobType === 'organizing' ? `Home organizing — ${parseInt(form.hours) || 2}hrs`
        : `Standard clean — ${beds}bd / ${baths}ba (~${form.sqft || '—'} sq ft)`,
      price: base,
    },
    form.isDeepClean && form.jobType === 'standard' && { description: 'Deep clean surcharge — baseboards, fans, sills', price: pricing.deepCleanSurcharge },
    form.extras?.includes('oven')       && { description: 'Oven interior scrub',                 price: pricing.addOns.oven },
    form.extras?.includes('fridge')     && { description: 'Refrigerator interior clean',          price: pricing.addOns.fridge },
    form.extras?.includes('windows')    && { description: 'Interior window glass (8 windows)',    price: pricing.addOns.windows },
    form.extras?.includes('laundry')    && { description: 'Laundry (wash + dry + fold, 1 load)',  price: pricing.addOns.laundry },
    form.extras?.includes('baseboards') && { description: 'Baseboard detail clean',               price: pricing.addOns.baseboards },
    form.extras?.includes('garage')     && { description: 'Garage floor sweep & wipe-down',       price: pricing.addOns.garage },
  ].filter(Boolean)

  const total = lineItems.reduce((s, i) => s + i.price, 0)

  return {
    lineItems,
    total,
    duration: total < 160 ? '2–2.5 hours' : total < 220 ? '2.5–3 hours' : '3–4 hours',
    validFor: '14 days',
    notes: `All supplies included. First-time client? Offer 10% off — total would be $${(total * 0.9).toFixed(0)}.`,
  }
}

// TODO: wire up — POST complaint + tone to Anthropic, return draft response
export async function handleComplaint(message, tone) {
  await delay(1500)
  const openings = {
    empathetic: "Hi there — I'm so sorry to hear about your experience, and I truly appreciate you taking the time to let me know.",
    firm:       "Thank you for bringing this to my attention. I take every piece of feedback seriously and want to address this directly.",
    apologetic: "I sincerely apologize for falling short of your expectations. This is not the standard I hold myself and my team to.",
    neutral:    "Thank you for your message. I've reviewed the details of your recent service and want to respond personally.",
  }
  return {
    response: `${openings[tone] || openings.empathetic}

${message.length > 80 ? 'Based on what you\'ve described, I completely understand your frustration. ' : ''}I\'d love the opportunity to make this right for you. I\'d like to schedule a complimentary re-clean of the areas that didn\'t meet your expectations — at no cost to you, at your convenience.

Please reply here or text me directly at (775) 555-0100 and I\'ll get that set up immediately. Your satisfaction is everything to me, and I look forward to earning back your trust.

Warm regards,
Ashley
Reno Reset Cleaning Co.`,
  }
}

// TODO: wire up — POST job list to Anthropic, return optimized order with route savings
export async function optimizeSchedule(jobs) {
  await delay(1200)
  return {
    optimizedJobs: [...jobs].reverse(),
    savings: { miles: 8.4, time: '22 min', fuelCost: '$1.88' },
    message: `Optimized your ${jobs.length}-job day. Reordered by proximity to save 8.4 miles and ~22 minutes of drive time.`,
  }
}

// TODO: wire up — POST job type + params to Anthropic, return categorized supply list
export async function calculateSupplies(form) {
  await delay(1100)
  const isCommercial = form.type === 'commercial'
  const isMoveOut    = form.type === 'moveout'
  const bathCount    = parseInt(form.bathrooms) || 2
  return {
    categories: [
      {
        name: 'Cleaning Agents',
        items: [
          { name: 'All-Purpose Cleaner',    qty: '1 bottle (32 oz)', note: 'Counters, sinks, appliance exteriors' },
          { name: 'Glass & Surface Cleaner',qty: '1 bottle',         note: 'Mirrors, windows, glass surfaces' },
          { name: 'Toilet Bowl Cleaner',    qty: `${bathCount} bottle${bathCount > 1 ? 's' : ''}`, note: 'One per bathroom' },
          { name: 'Tub & Tile Scrub',       qty: `${bathCount} bottle${bathCount > 1 ? 's' : ''}` },
          isCommercial && { name: 'Commercial Disinfectant', qty: '1 bottle (64 oz)', note: 'EPA-registered' },
          isMoveOut    && { name: 'Heavy-Duty Degreaser',    qty: '1 bottle',         note: 'For oven, range hood' },
        ].filter(Boolean),
      },
      {
        name: 'Tools & Equipment',
        items: [
          { name: 'Microfiber Cloths', qty: `${bathCount * 2 + 4} cloths`, note: '2 per bath + 2 kitchen + 2 general' },
          { name: 'Scrub Brush',       qty: '1' },
          { name: 'Toilet Brush',      qty: `${bathCount}` },
          { name: 'Mop + Bucket',      qty: '1 set', note: 'Or Swiffer WetJet' },
          { name: 'Vacuum w/ Attachments', qty: '1', note: 'Crevice tool + upholstery brush' },
          isMoveOut && { name: 'Magic Eraser Pads', qty: '4 pads', note: 'Scuffs on walls and baseboards' },
        ].filter(Boolean),
      },
      {
        name: 'Supplies & Protective',
        items: [
          { name: 'Rubber Gloves',     qty: '1 pair per cleaner' },
          { name: 'Shoe Covers',       qty: '1 pair' },
          { name: 'Trash Bags',        qty: `${bathCount + 1} bags`, note: 'Kitchen + each bathroom' },
          { name: 'Paper Towels (backup)', qty: '1 roll' },
          isCommercial && { name: 'Disposable Wipes (200ct)', qty: '1 pack', note: 'For equipment surfaces' },
        ].filter(Boolean),
      },
    ],
    notes: 'Pack heaviest items at the bottom of your caddy. Sprays in a leak-proof outer pocket.',
    estimatedWeight: isCommercial ? '18–22 lbs' : '12–15 lbs',
  }
}

// TODO: wire up — POST client name + job details to Anthropic, return personalized thank-you
export async function generateWowNote(client, jobType) {
  await delay(1300)
  const name = client.name.split(' ')[0]
  const notes = {
    residential: `Hi ${name}! We just finished up at your home and wanted to say it was such a pleasure, as always. Every room got our full attention today — we paid extra care to the kitchen and made sure everything is sparkling. We hope you enjoy coming home to a fresh, clean space! If anything doesn't look right, just text us and we'll make it right. See you in ${client.frequency === 'weekly' ? 'a week' : 'two weeks'}!`,
    commercial:  `Hi team! Thank you for trusting Reno Reset with your space. We completed your cleaning this morning and your facility is fresh and ready for your clients. All high-touch surfaces sanitized. Don't hesitate to reach out with any requests for next time!`,
    airbnb:      `Your property is guest-ready! We've completed the full turnover — fresh linens, sanitized kitchen and bathrooms, everything staged beautifully. Photos are attached. Ready for your next check-in!`,
    moveout:     `Hi ${name}! Your move-out clean is complete. We went through every room top to bottom — appliances, baseboards, inside cabinets, and bathrooms all deep-cleaned. You're in great shape to get your deposit back. Good luck with the move!`,
  }
  return { note: notes[jobType] || notes.residential }
}

// TODO: wire up — POST month + services to Anthropic, return campaign copy
export async function generateSeasonalCampaign(month) {
  await delay(1200)
  const campaigns = {
    Jun: { subject: "Summer's here — is your home ready?",          body: "The longer days are here and your home deserves to shine. Book a summer deep clean this month and get your windows done FREE (a $35 value). Spots are filling fast — reply to claim yours." },
    Sep: { subject: "Back-to-school reset — reclaim your space",    body: "The kids are back in school and it's time to reclaim your home. Book a fall reset clean in September and we'll tackle those forgotten baseboards and ceiling fans at no extra charge." },
    Nov: { subject: "Pre-holiday deep clean — book before November fills up", body: "Hosting for the holidays? Let us get your home guest-ready before your family arrives. Book by November 15 to lock in your preferred date. We're already filling up!" },
    Jan: { subject: "New year, fresh start — 10% off in January",   body: "Start the year right with a fresh clean. Book any service in January and take 10% off. Text us to claim your spot — this offer expires January 31." },
  }
  return campaigns[month] || { subject: `Special offer — ${month}`, body: "This month only, book any service and mention this message for a special add-on at no charge. Limited spots available — reply to book." }
}

const DAY_FULL = { Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday' }

// TODO: wire up — POST neighborhood + schedule analysis to Anthropic, return prose recommendation
export async function suggestBookingDay({ clientName, neighborhoodLabel, matchingDays, dayJobSummaries }) {
  await delay(1100)

  const name = clientName?.trim() || 'this client'

  if (!matchingDays.length) {
    return {
      suggested: null,
      text: `No existing clients in ${neighborhoodLabel} yet — you have full flexibility. Any day works. Once you book the first client there, future clients in that area will cluster naturally.`,
      alternatives: [],
      savings: null,
    }
  }

  const primary = matchingDays[0]
  const fullDay = DAY_FULL[primary] || primary
  const summary = dayJobSummaries[primary] || 'existing job'
  const alts = matchingDays.slice(1)
  const altText = alts.length
    ? ` ${alts.map(d => DAY_FULL[d] || d).join(' or ')} would also work if ${fullDay} fills up.`
    : ''

  return {
    suggested: primary,
    text: `You're already in ${neighborhoodLabel} on ${fullDay}s (${summary}). Scheduling ${name} on a ${fullDay} stacks your route and cuts 4–8 miles of backtracking.${altText}`,
    alternatives: alts,
    savings: { miles: '4–8 miles', fuel: '$0.90–$1.80' },
  }
}

// TODO: wire up — call Anthropic to analyze competitor landscape
export async function analyzeCompetitors() {
  await delay(1600)
  return {
    competitors: [
      { name: 'Jobber',        price: '$49/mo', weakness: 'No AI features. Generic software not built for cleaners. Steep learning curve.', attack: 'Lead with AI quote generator + complaint handler. Position: built by a cleaner, for cleaners.' },
      { name: 'Housecall Pro', price: '$65/mo', weakness: 'Expensive. Overkill for solo operators. No personality or community.',             attack: 'Price is your biggest advantage here. Half the cost, AI features they don\'t have.' },
      { name: 'ZenMaid',       price: '$23/mo', weakness: 'Limited features. No AI. No analytics. Barely more than a scheduler.',            attack: 'Upsell on depth. ZenMaid users are ready to graduate — show them what they\'re missing.' },
    ],
    summary: 'Your strongest differentiator is the AI layer. None of your competitors have it. Lead with Scope It and Complaint Handler in every demo.',
  }
}
