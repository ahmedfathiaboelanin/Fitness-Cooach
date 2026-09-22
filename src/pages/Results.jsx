import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Star, Images } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Badge, SectionTitle } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground } from '../components/brand'
import { GallerySlider, galleryPhotos } from '../components/Gallery'

export default function Results() {
  const transformations = useSiteStore((s) => s.transformations)
  const testimonials = useSiteStore((s) => s.testimonials)
  const { isAR } = useT()
  const { pick } = useL()
  const [galleryOpen, setGalleryOpen] = useState(false)
  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden">
      <EmberBackground />
      <div className="relative container-x py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            className="!mb-0"
            title={isAR ? <>التحولات <Flame size={30} className="inline text-rose-400" /></> : <>Transformations <Flame size={30} className="inline text-rose-400" /></>}
            subtitle={isAR ? 'عينة من نتائج العملاء في الجيم والأونلاين. صورتك ممكن تكون الجاية.' : 'A sample of client results with gym + online coaching. Your photo could be next.'}
          />
          {galleryPhotos.length > 0 && (
            <button
              onClick={() => setGalleryOpen((o) => !o)}
              className="btn-fire inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white shrink-0 mb-1"
            >
              <Images size={18} />
              {galleryOpen
                ? <>{isAR ? 'إخفاء الصور' : 'Hide photos'}</>
                : <>{isAR ? `عرض الصور (${galleryPhotos.length})` : `Show photos (${galleryPhotos.length})`}</>}
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {transformations.map((tinfo, i) => (
            <motion.div key={tinfo.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -8 }} className="rounded-2xl overflow-hidden border border-rose-500/20 bg-stone-900 group">
              <div className="relative overflow-hidden">
                <img src={tinfo.image} className="h-56 w-full object-cover group-hover:scale-110 transition duration-700" alt={pick(tinfo, 'name')} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                <span className="absolute top-3 left-3"><Badge>{pick(tinfo, 'goal')}</Badge></span>
              </div>
              <div className="p-4">
                <b className="text-sm text-white">{pick(tinfo, 'name')}</b>
                <div className="font-display text-lg text-fire uppercase">{pick(tinfo, 'result')}</div>
                <p className="text-xs text-stone-400 mt-1">{pick(tinfo, 'text')}</p>
              </div>
            </motion.div>
          ))}
          {transformations.length === 0 && <p className="text-stone-400">{isAR ? 'لا توجد نتائج بعد — تابعنا قريباً' : 'No results yet — check back soon'}</p>}
        </div>

        <AnimatePresence>
          {galleryOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-8">
                <GallerySlider />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 rounded-3xl p-[2px] bg-fire-gradient shadow-fire-lg">
          <div className="bg-stone-950 rounded-3xl p-8 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-display text-3xl uppercase">{isAR ? <>عايز نتائج <span className="text-fire">زي دي؟</span></> : <>Want results <span className="text-fire">like these?</span></>}</h2>
              <p className="text-stone-400 text-sm mt-2">{isAR ? 'ابعت هدفك + وزنك + مكان التمرين (جيم/بيت) على واتساب وهرد عليك بأحسن باقة ليك.' : 'Send your goal + current weight + training place (gym/home) on WhatsApp and I will reply with the best package for you.'}</p>
            </div>
            <div className="flex md:justify-end">
              <WhatsAppButton large text={isAR ? 'أهلاً محمد! عايز نتائج زي العملاء بتوعك. هدفي / وزني / مكان التمرين:' : 'Hi Mohammad! I want results like your clients. My goal / weight / training place:'} label={isAR ? 'ابعت هدفك' : 'Send My Goal'} />
            </div>
          </div>
        </div>

        <h2 className="font-display text-3xl uppercase mt-10 mb-4">{isAR ? <>آراء <span className="text-fire">العملاء</span></> : <>Client <span className="text-fire">Reviews</span></>}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((titem) => (
            <Card key={titem.id}>
              <div className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={14} fill="currentColor" />)}</div>
              <p className="text-sm text-stone-200 mt-1">“{pick(titem, 'text')}”</p>
              <div className="flex items-center gap-2 mt-3"><img src={titem.avatar} className="w-9 h-9 rounded-full border border-rose-500/40" alt="" /><div><b className="text-sm text-white">{pick(titem, 'name')}</b><div className="text-xs text-stone-400">{pick(titem, 'role')}</div></div></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
