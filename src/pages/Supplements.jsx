import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Pill, ShoppingCart, PackageSearch } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Badge, SectionTitle } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground } from '../components/brand'

export default function Supplements() {
  const supplements = useSiteStore((s) => s.supplements)
  const coach = useSiteStore((s) => s.coach)
  const { isAR } = useT()
  const { pick } = useL()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')

  const cats = useMemo(() => {
    const set = new Map()
    supplements.forEach((s) => {
      const key = s.category || 'Other'
      if (!set.has(key)) set.set(key, s.category_ar || key)
    })
    return [...set.entries()]
  }, [supplements])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return supplements.filter((s) => {
      if (cat !== 'All' && (s.category || 'Other') !== cat) return false
      if (!q) return true
      return [s.name, s.name_ar, s.description, s.description_ar, s.category, s.category_ar]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [supplements, query, cat])

  const orderText = (s) => isAR
    ? `أهلاً ${pick(coach, 'firstName')}! عايز أطلب:\n\n• ${pick(s, 'name')} — ${s.price}\n\nلو سمحت أكد الطلب`
    : `Hi ${pick(coach, 'firstName')}! I want to order:\n\n• ${pick(s, 'name')} — ${s.price}\n\nPlease confirm my order`

  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden min-h-screen">
      <EmberBackground />
      <div className="relative container-x py-10">
        <SectionTitle
          title={isAR ? <>مكملات <span className="text-fire">محمد</span></> : <><span className="text-fire">Mohammad's</span> Supplements</>}
          subtitle={isAR ? 'المكملات اللي برشحها لعملائي — اطلب مباشرة على واتساب' : 'The supplements I recommend to my clients — order straight on WhatsApp'}
        />

        <Card className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAR ? 'دوّر على مكمل… (واي بروتين، كرياتين)' : 'Search supplements… (whey, creatine)'}
              className="w-full ps-10 pe-4 py-2.5 border border-white/10 rounded-xl bg-stone-950 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCat('All')} className={`px-4 py-2 rounded-full text-sm font-extrabold transition ${cat === 'All' ? 'bg-fire-gradient text-white shadow-fire' : 'text-stone-400 hover:text-white'}`}>
              {isAR ? 'الكل' : 'All'}
            </button>
            {cats.map(([en, ar]) => (
              <button key={en} onClick={() => setCat(en)} className={`px-4 py-2 rounded-full text-sm font-extrabold transition ${cat === en ? 'bg-fire-gradient text-white shadow-fire' : 'text-stone-400 hover:text-white'}`}>
                {isAR ? ar : en}
              </button>
            ))}
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="mt-6 text-center py-12">
            <PackageSearch size={40} className="mx-auto text-stone-500" />
            <p className="text-stone-400 mt-3 font-bold">{isAR ? 'مفيش نتائج مطابقة لدور عليه' : 'No supplements match your search'}</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 7) * 0.05 }}
                whileHover={{ y: -6 }}
                className="card-fire overflow-hidden group flex flex-col"
              >
                <div className="relative overflow-hidden">
                  {s.image
                    ? <img src={s.image} alt={pick(s, 'name')} loading="lazy" className="h-44 w-full object-cover group-hover:scale-105 transition duration-500" />
                    : <div className="h-44 w-full bg-stone-950 flex items-center justify-center"><Pill size={44} className="text-rose-400" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {(s.category || s.category_ar) && (
                    <span className="absolute top-3 start-3"><Badge>{pick(s, 'category')}</Badge></span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-white">{pick(s, 'name')}</h3>
                  {pick(s, 'description') && <p className="text-xs text-stone-400 mt-1 flex-1">{pick(s, 'description')}</p>}
                  <div className="font-display text-xl text-fire mt-2">{s.price}</div>
                  <WhatsAppButton text={orderText(s)} label={isAR ? 'اطلب الآن' : 'Order now'} className="w-full mt-3 !py-2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <ShoppingCart size={13} className="text-rose-400" />
          {isAR ? 'الدفع والاستلام بيتأكدوا مع محمد على واتساب' : 'Payment and delivery are confirmed with Mohammad on WhatsApp'}
        </p>
      </div>
    </div>
  )
}
