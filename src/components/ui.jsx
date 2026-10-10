import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

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
    fire: 'bg-[#2E7BFF] text-white',
    green: 'bg-green-500/15 text-green-300 border border-green-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    slate: 'bg-white/10 text-stone-300 border border-white/10',
    red: 'bg-red-500/15 text-red-300 border border-red-500/30',
    coal: 'bg-stone-950 text-[#5B9CFF] border border-blue-500/30',
  };
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
      <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] text-[#5B9CFF] bg-blue-500/10 border border-blue-500/25 px-3 py-1.5 rounded-full"><Flame size={12} />{eyebrow}</span>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 uppercase leading-[1.08] text-balance">{title}</h2>
      <div className={`h-1 w-20 mt-4 rounded-full bg-[#2E7BFF] ${center ? 'mx-auto' : ''}`} />
      {subtitle && <p className="text-stone-400 mt-3 max-w-2xl ${center ? 'mx-auto' : ''}">{subtitle}</p>}
    </motion.div>
  )
}
