import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Newspaper, ArrowRight, Star } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Badge, SectionTitle } from '../components/ui'
import { EmberBackground } from '../components/brand'

function readingTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function Blog() {
  const blogs = useSiteStore((s) => s.blogs || [])
  const { isAR } = useT()
  const { pick } = useL()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')

  const visible = useMemo(
    () => (blogs || []).filter((b) => b.published !== false),
    [blogs]
  )

  const cats = useMemo(() => {
    const map = new Map()
    visible.forEach((b) => {
      const key = b.category || (isAR ? 'عام' : 'General')
      if (!key) return
      if (!map.has(key)) map.set(key, b.category_ar || key)
    })
    return [...map.entries()]
  }, [visible, isAR])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return visible.filter((b) => {
      if (cat !== 'All' && (b.category || 'General') !== cat && (b.category || '') !== cat) return false
      if (!q) return true
      return [b.title, b.title_ar, b.excerpt, b.excerpt_ar, b.category, b.category_ar, ...(b.tags || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [visible, query, cat])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1
      return String(b.created_at || '') > String(a.created_at || '') ? 1 : -1
    })
    return arr
  }, [filtered])

  const featured = sorted.find((b) => b.featured) && cat === 'All' && !query.trim()
    ? sorted.find((b) => b.featured)
    : null
  const rest = featured ? sorted.filter((b) => b.id !== featured.id) : sorted

  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden min-h-screen">
      <EmberBackground />
      <div className="relative container-x py-10">
        <SectionTitle
          title={isAR ? <>المدونة — <span className="text-fire">نصايح ومقالات</span></> : <>Blog — <span className="text-fire">Tips & Articles</span></>}
          subtitle={isAR ? 'مقالات عن التخسيس وزيادة العضلات والتغذية من محمد' : 'Fat-loss, muscle and nutrition articles from Mohammad'}
        />

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="block card-fire overflow-hidden group mb-6">
            <div className="grid md:grid-cols-2">
              <div className="relative overflow-hidden min-h-[220px]">
                {featured.cover
                  ? <img src={featured.cover} alt={pick(featured, 'title')} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  : <div className="absolute inset-0 bg-stone-900 flex items-center justify-center"><Newspaper size={48} className="text-rose-400" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute top-3 start-3 flex gap-2">
                  <Badge><span className="inline-flex items-center gap-1"><Star size={11} /> {isAR ? 'مميز' : 'Featured'}</span></Badge>
                  {(featured.category || featured.category_ar) && <Badge color="slate">{pick(featured, 'category')}</Badge>}
                </span>
              </div>
              <div className="p-6 flex flex-col justify-center">
                <h2 className="font-display text-2xl sm:text-3xl uppercase group-hover:text-rose-300 transition">{pick(featured, 'title')}</h2>
                {pick(featured, 'excerpt') && <p className="text-sm text-stone-400 mt-2">{pick(featured, 'excerpt')}</p>}
                <span className="text-rose-400 font-bold text-sm mt-4 inline-flex items-center gap-1.5">
                  {isAR ? 'اقرأ المقال' : 'Read article'} <ArrowRight size={16} className="rtl:rotate-180" />
                </span>
              </div>
            </div>
          </Link>
        )}

        <Card className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAR ? 'دوّر في المقالات… (تخسيس، بروتين)' : 'Search articles… (fat loss, protein)'}
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

        {rest.length === 0 ? (
          <Card className="mt-6 text-center py-12">
            <Newspaper size={40} className="mx-auto text-stone-500" />
            <p className="text-stone-400 mt-3 font-bold">{isAR ? 'لا توجد مقالات بعد — ارجع قريب' : 'No articles yet — check back soon'}</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {rest.map((b, i) => (
              <motion.div
                key={b.id ?? b.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 7) * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Link to={`/blog/${b.slug}`} className="card-fire overflow-hidden group flex flex-col h-full">
                  <div className="relative overflow-hidden">
                    {b.cover
                      ? <img src={b.cover} alt={pick(b, 'title')} loading="lazy" className="h-44 w-full object-cover group-hover:scale-105 transition duration-500" />
                      : <div className="h-44 w-full bg-stone-950 flex items-center justify-center"><Newspaper size={44} className="text-rose-400" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {(b.category || b.category_ar) && (
                      <span className="absolute top-3 start-3"><Badge>{pick(b, 'category')}</Badge></span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-white group-hover:text-rose-300 transition">{pick(b, 'title')}</h3>
                    {pick(b, 'excerpt') && <p className="text-xs text-stone-400 mt-1 flex-1 line-clamp-2">{pick(b, 'excerpt')}</p>}
                    <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                      <span>{readingTime(pick(b, 'content'))} {isAR ? 'دقيقة قراءة' : 'min read'}</span>
                      <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                        {isAR ? 'اقرأ' : 'Read'} <ArrowRight size={13} className="rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
