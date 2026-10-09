import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { usePrefsStore } from '../store/usePrefsStore'
import logoSrc from '../assets/images/logo.png'

/* Coach logo from src/assets/images/logo.png (bundled by Vite).
   Falls back to a flame mark if the file ever goes missing. */
export function CoachLogo({ size = 36, className = '' }) {
  const [ok, setOk] = useState(true)
  if (!ok) return <Flame size={size} className={`text-[#2E7BFF] ${className}`} />
  return (
    <img
      src={logoSrc}
      alt="Mohamed Elsum logo"
      width={size}
      height={size}
      onError={() => setOk(false)}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function MarqueeStrip({ items, itemsAr }) {
  const lang = usePrefsStore((s) => s.lang)
  const defaults = lang === 'ar'
    ? (itemsAr || ['بدون أعذار', 'اتمرن بقوة', 'خليك مستمر', 'محمد الصم', 'جيم • أونلاين'])
    : (items || ['NO EXCUSES', 'TRAIN HARD', 'STAY CONSISTENT', 'MOHAMMAD ELSUM', 'GYM • ONLINE'])
  const row = [...defaults, ...defaults]
  return (
    <div className="marquee-soft relative overflow-hidden bg-[#071022] py-3 border-y border-blue-500/20">
      <div className="marquee-track gap-8 pr-8">
        {row.map((t, i) => (
          <span key={i} className="font-display text-[#9CC0FF] text-xl md:text-2xl uppercase whitespace-nowrap flex items-center gap-8">
            {t} <Flame size={22} strokeWidth={2.5} className="text-[#2E7BFF]" />
          </span>
        ))}
      </div>
    </div>
  )
}

export function EmberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-dark" />
      <div className="ember-blob w-[420px] h-[420px] bg-[#123B8F] -top-20 -left-20" />
      <div className="ember-blob w-[380px] h-[380px] bg-[#0B2E6E] top-1/3 -right-20" />
      <div className="ember-blob w-[300px] h-[300px] bg-[#1F68E8] bottom-0 left-1/3" />
    </div>
  )
}

export function StatBurst({ stats }) {
  const lang = usePrefsStore((s) => s.lang)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label + i}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="card-fire p-4 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2E7BFF]" />
          <b className="font-display text-3xl text-fire block">{s.value}</b>
          <span className="text-xs uppercase tracking-wider text-stone-400 font-bold">
            {lang === 'ar' && s.label_ar ? s.label_ar : s.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
