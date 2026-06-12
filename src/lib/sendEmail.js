// Email utility — uses SendGrid when configured, falls back to mailto:
export async function sendEmail({ to, subject, body, fromEmail, fromName }) {
  const key = localStorage.getItem('cleanos_sendgrid_key')

  if (key && to) {
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem('cleanos_profile') || '{}') } catch { return {} }
    })()
    const sender = fromEmail || profile.email || 'noreply@cleanos.app'
    const senderName = fromName || profile.businessName || 'CleanOS'

    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: sender, name: senderName },
          subject,
          content: [{ type: 'text/plain', value: body }],
        }),
      })
      return { success: res.ok, via: 'sendgrid', status: res.status }
    } catch (err) {
      console.warn('SendGrid send failed, falling back to mailto:', err)
    }
  }

  // mailto fallback — always opens even if sendgrid failed
  const mailtoUrl = `mailto:${to || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailtoUrl)
  return { success: true, via: 'mailto' }
}
