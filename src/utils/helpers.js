export const formatPrice = (p) => `$${p}/session`
export const cx = (...c) => c.filter(Boolean).join(' ')
export const timeSlots = ['08:00', '09:00', '10:00', '11:00', '16:00', '17:00', '18:00']
export const next7Days = () => {
  const days = []
  const today = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}
