import { motion } from 'framer-motion'
import { Flame, X, Star } from 'lucide-react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-5 py-2.5 rounded-xl font-bold transition active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2'
  const styles = {
    primary: 'btn-fire text-white',
    secondary: 'bg-white/10 border border-white/15 hover:bg-white/20 text-white backdrop-blur',
    light: 'bg-white text-stone-900 hover:bg-stone-100 shadow',
    dark: 'bg-stone-950 text-white hover:bg-stone-800 border border-white/10',
    ghost: 'text-rose-400 hover:bg-rose-500/10',
  }
  return (
    <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }} className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </motion.button>
  )
}

export function Badge({ children, color = 'fire' }) {
  const map = {
    fire: 'bg-gradient-to-r from-[#FF7A88] to-[#C8102E] text-white shadow-fire',
    green: 'bg-green-500/15 text-green-300 border border-green-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    slate: 'bg-white/10 text-stone-300 border border-white/10',
    red: 'bg-red-500/15 text-red-300 border border-red-500/30',
    coal: 'bg-stone-950 text-rose-400 border border-rose-500/30',
  }
  return <span className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${map[color]}`}>{children}</span>
}

export function Card({ children, className = '' }) {
  return <div className={`card-fire p-5 ${className}`}>{children}</div>
}

export function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-stone-300">{label}</label>}
      <input {...props} className="px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-stone-900 text-white placeholder:text-stone-500" />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function SectionTitle({ title, subtitle, center, eyebrow = 'MOHAMMAD ELSUM', className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      className={`${center ? 'text-center' : ''} mb-8 ${className}`}
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full"><Flame size={12} />{eyebrow}</span>
      <h2 className="font-display text-4xl md:text-5xl mt-3 uppercase leading-[1.05]">{title}</h2>
      <div className={`h-1.5 w-24 mt-4 rounded-full bg-fire-gradient ${center ? 'mx-auto' : ''}`} />
      {subtitle && <p className="text-stone-400 mt-3 max-w-2xl ${center ? 'mx-auto' : ''}">{subtitle}</p>}
    </motion.div>
  )
}

export function Stars({ size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} fill="currentColor" />)}
    </span>
  )
}

export function RatingStars({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm">
      <Star size={14} className="text-amber-400" fill="currentColor" />
      <b>{rating}</b>
    </span>
  )
}

export function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.92, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-stone-900 border border-rose-500/20 rounded-2xl p-6 max-w-md w-full shadow-fire-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white"><X size={18} /></button>
        {children}
      </motion.div>
    </div>
  )
}
