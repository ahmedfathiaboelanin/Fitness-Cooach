// WhatsApp helpers — number lives in Supabase (coach.whatsappNumber),
// mirrored into the zustand store + localStorage cache by useSiteStore.

const DEFAULT_NUMBER = '201123118787'

export function getWhatsAppNumber() {
  // 1) live store (Supabase data once refresh() resolves)
  try {
    const num = JSON.parse(localStorage.getItem('elsum-site-v3') || 'null')?.coach?.whatsappNumber
    // NOTE: imported lazily to avoid a circular import at module top-level.
    // The store itself persists every change to this same key, so reading
    // the key here is always as fresh as the store without the cycle.
    if (num) return String(num)
  } catch { /* ignore */ }
  for (const key of ['elsum-site-v2', 'elsum-site-v1']) {
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
