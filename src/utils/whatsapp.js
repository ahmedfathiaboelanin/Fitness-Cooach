// WhatsApp helpers — number is editable from the hidden admin dashboard.
// Stored in localStorage (elsum-site-v1) + src/data/site.json defaults.

const DEFAULT_NUMBER = '201123118787'

export function getWhatsAppNumber() {
  for (const key of ['elsum-site-v3', 'elsum-site-v2', 'elsum-site-v1']) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.coach?.whatsappNumber) return String(parsed.coach.whatsappNumber)
      }
    } catch { /* ignore */ }
  }
  return DEFAULT_NUMBER
}

// Normalize: strip non-digits, handle Egyptian local 01xxxxxxxxx -> 201xxxxxxxxx
export function normalizeWhatsApp(number) {
  let digits = String(number ?? getWhatsAppNumber()).replace(/\D/g, '')
  if (digits.startsWith('0020')) digits = digits.slice(2)
  if (digits.startsWith('0') && digits.length === 11) digits = '20' + digits.slice(1)
  if (digits.startsWith('20') === false && digits.length === 10) digits = '20' + digits
  return digits
}

export function waLink(message = 'Hi Mohammad! I want to inquire about coaching.', number) {
  const num = normalizeWhatsApp(number ?? getWhatsAppNumber())
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}
