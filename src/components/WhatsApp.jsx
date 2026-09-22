import { motion } from 'framer-motion'
import { waLink } from '../utils/whatsapp'
import { useSiteStore } from '../store/useSiteStore'

export function WhatsAppFloat() {
  const display = useSiteStore((s) => s.coach.whatsappDisplay)
  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      href={waLink('Hi Mohammad! I found your page and want to inquire about coaching 🔥💪')}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] text-white font-extrabold px-5 py-3.5 rounded-full shadow-[0_15px_45px_-10px_rgba(37,211,102,0.7)]"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" />
      <span className="relative text-xl animate-flicker">💬</span>
      <span className="relative">WhatsApp</span>
      <span className="relative hidden sm:inline font-medium text-sm opacity-80">{display}</span>
    </motion.a>
  )
}

export function WhatsAppButton({ text, label = 'Book via WhatsApp', className = '', large }) {
  return (
    <motion.a
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      href={waLink(text)}
      target="_blank"
      rel="noreferrer"
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 bg-[#1FA855] hover:bg-[#25D366] text-white font-extrabold rounded-xl shadow-[0_12px_35px_-10px_rgba(37,211,102,0.7)] border border-white/20 transition ${large ? 'px-8 py-4 text-lg' : 'px-5 py-2.5'} ${className}`}
    >
      <span className="text-lg">💬</span> {label}
    </motion.a>
  )
}

export function FireButton({ to, children, className = '' }) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      href={to}
      className={`btn-fire inline-flex items-center justify-center gap-2 text-white font-extrabold rounded-xl px-6 py-3.5 ${className}`}
    >
      🔥 {children}
    </motion.a>
  )
}
