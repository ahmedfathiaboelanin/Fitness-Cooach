import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { waLink } from '../utils/whatsapp'

export function WhatsAppButton({ text, label = 'Book via WhatsApp', className = '', large }) {
  return (
    <motion.a
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      href={waLink(text)}
      target="_blank"
      rel="noreferrer"
      className={`btn-wa relative overflow-hidden inline-flex items-center justify-center gap-2 font-extrabold rounded-xl border border-white/20 transition text-center ${large ? 'px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg' : 'px-5 py-2.5'} ${className}`}
    >
      <MessageCircle size={large ? 22 : 18} className="shrink-0" /> <span className="min-w-0">{label}</span>
    </motion.a>
  )
}
