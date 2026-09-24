import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Calculator, Check, Star, ArrowRight, Dumbbell, Laptop, Salad, Video, Pill } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { SectionTitle, Badge } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { MarqueeStrip, EmberBackground, StatBurst, CoachLogo } from '../components/brand'
import { waLink } from '../utils/whatsapp'
import heroImg from '../assets/images/hero.jpg'

const SERVICE_ICONS = { dumbbell: Dumbbell, laptop: Laptop, salad: Salad, video: Video, flame: Flame, '🏋️': Dumbbell, '💻': Laptop, '🥗': Salad, '🎥': Video, '🔥': Flame }

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } }

export default function Landing() {
  const coach = useSiteStore((s) => s.coach)
  const packages = useSiteStore((s) => s.packages)
  const transformations = useSiteStore((s) => s.transformations)
  const testimonials = useSiteStore((s) => s.testimonials)
  const services = useSiteStore((s) => s.services)
  const supplements = useSiteStore((s) => s.supplements)
  const { t, isAR } = useT()
  const { pick, pickArr } = useL()
  const waStart = isAR ? 'أهلاً محمد! عايز أبدأ التدريب معاك. هدفي هو:' : 'Hi Mohammad! I want to start coaching with you. My goal is:'
  return (
    <div className="bg-stone-950 text-stone-100 overflow-x-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src={coach.avatar} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/85 to-stone-950" />
        <EmberBackground />
        <div className="relative container-x py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] text-stone-200 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-full">
              <Flame size={13} /> {t('heroBadge')}
            </motion.span>
            <h1 className="font-display text-5xl md:text-7xl mt-5 uppercase leading-[1.05]">
              {pick(coach, 'name')}
              <span className="block text-fire text-2xl md:text-4xl mt-3 leading-snug">{pick(coach, 'tagline')}</span>
            </h1>
            <p className="text-stone-300 mt-5 max-w-md leading-relaxed">{pick(coach, 'bio')}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <WhatsAppButton large text={waStart} label={t('startWhatsapp')} />
              <Link to="/results" className="px-8 py-4 rounded-xl font-extrabold bg-white/10 border border-white/20 hover:bg-white/20 hover:border-rose-500/50 backdrop-blur transition inline-flex items-center gap-2">{t('seeWork')} <ArrowRight size={18} className="rtl:rotate-180" /></Link>
            </div>
            <div className="mt-8"><StatBurst stats={coach.stats} /></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94, rotate: 1 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.7 }} className="relative hidden md:block">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative rounded-[2rem] p-2 bg-gradient-to-br from-[#FF7A88] via-[#C8102E] to-[#42060D] shadow-fire-lg">
              <img src={heroImg || coach.avatar} className="rounded-[1.6rem] h-[480px] w-full object-cover" alt={pick(coach, 'name')} />
              <div className="absolute bottom-6 left-6 right-6 bg-stone-950/80 backdrop-blur-xl border border-rose-500/25 rounded-2xl p-4 flex justify-between items-center">
                <div><div className="font-display text-lg uppercase flex items-center gap-2"><CoachLogo size={26} /> {pick(coach, 'name')}</div><div className="text-xs text-stone-400">{pick(coach, 'title')}</div></div>
                <a href={waLink('Hi Mohammad!')} target="_blank" rel="noreferrer" className="text-xs font-extrabold text-green-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-flicker" /> {isAR ? 'متاح الآن' : 'Available now'}</a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* <MarqueeStrip /> */}

      {/* SERVICES */}
      <section className="container-x py-16">
        <SectionTitle
          title={isAR ? <>أنا <span className="text-fire">بعمل إيه</span></> : <>What I <span className="text-fire">Do</span></>}
          subtitle={isAR ? 'تدريب جيم + أونلاين مصمم لحياتك الحقيقية وأكلك ووقتك.' : 'Gym + online coaching built for real life, real food, real schedules.'}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon] || Flame
            return (
            <motion.div key={pick(s, 'title') + i} {...fadeUp} transition={{ delay: i * 0.07 }} whileHover={{ y: -6, rotate: -0.5 }} className="card-fire p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-fire-gradient opacity-0 group-hover:opacity-100 transition" />
              <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }} className="text-rose-400"><Icon size={36} /></motion.div>
              <h3 className="font-display text-xl mt-3 uppercase">{pick(s, 'title')}</h3>
              <p className="text-sm text-stone-400 mt-1">{pick(s, 'desc')}</p>
            </motion.div>
            )
          })}
        </div>
      </section>

      {/* RESULTS */}
      <section className="relative bg-stone-900/50 border-y border-rose-500/15 py-16 overflow-hidden">
        <EmberBackground />
        <div className="relative container-x">
          <SectionTitle
            title={isAR ? <>شغلي — <span className="text-fire">النتائج</span></> : <>My Work — <span className="text-fire">Results</span></>}
            subtitle={isAR ? 'ناس حقيقية. استمرارية حقيقية. بدون فلاتر وبدون اختصارات.' : 'Real people. Real consistency. No filters, no shortcuts.'}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {transformations.map((tinfo, i) => (
              <motion.div key={tinfo.id} {...fadeUp} transition={{ delay: i * 0.06 }} whileHover={{ y: -8 }} className="rounded-2xl overflow-hidden border border-white/10 bg-stone-950 group">
                <div className="relative overflow-hidden">
                  <img src={tinfo.image} className="h-52 w-full object-cover group-hover:scale-110 transition duration-700" alt={pick(tinfo, 'name')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                  <span className="absolute top-3 left-3"><Badge>{pick(tinfo, 'goal')}</Badge></span>
                  <div className="absolute bottom-3 left-3 right-3"><b className="text-sm text-white">{pick(tinfo, 'name')}</b><div className="font-display text-lg text-fire uppercase">{pick(tinfo, 'result')}</div></div>
                </div>
                <p className="text-xs text-stone-400 p-4">{pick(tinfo, 'text')}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-7"><Link to="/results" className="btn-fire inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white">{t('viewAllResults')} <ArrowRight size={18} className="rtl:rotate-180" /></Link></div>
        </div>
      </section>

      {/* SUPPLEMENTS TEASER */}
      <section className="container-x py-16">
        <SectionTitle
          title={isAR ? <>مكملات <span className="text-fire">موصى بها</span></> : <>Recommended <span className="text-fire">Supplements</span></>}
          subtitle={isAR ? 'المكملات اللي برشحها لعملائي — اطلبها على واتساب' : 'What I recommend to my clients — order on WhatsApp'}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {supplements.slice(0, 4).map((s, i) => (
            <motion.div key={s.id} {...fadeUp} transition={{ delay: i * 0.06 }} whileHover={{ y: -6 }} className="card-fire overflow-hidden group">
              <div className="relative overflow-hidden">
                {s.image
                  ? <img src={s.image} alt={pick(s, 'name')} loading="lazy" className="h-40 w-full object-cover group-hover:scale-105 transition duration-500" />
                  : <div className="h-40 w-full bg-stone-950 flex items-center justify-center"><Pill size={38} className="text-rose-400" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm">{pick(s, 'name')}</h3>
                <div className="font-display text-lg text-fire mt-1">{s.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-7"><Link to="/supplements" className="btn-fire inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white">{isAR ? 'تصفح المكملات' : 'Shop supplements'} <ArrowRight size={18} className="rtl:rotate-180" /></Link></div>
        <motion.div {...fadeUp} className="mt-8 rounded-3xl p-[2px] bg-fire-gradient shadow-fire-lg">
          <div className="bg-stone-950 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div>
              <h3 className="font-display text-2xl uppercase">{isAR ? <>مش عارف تاكل <span className="text-fire">قد إيه؟</span></> : <>Not sure how much <span className="text-fire">to eat?</span></>}</h3>
              <p className="text-sm text-stone-400">{isAR ? 'احسب سعراتك (BMR) في دقيقة وابعتها لمحمد على واتساب.' : 'Calculate your BMR calories in a minute and send them to Mohammad.'}</p>
            </div>
            <Link to="/calculator" className="btn-fire inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white whitespace-nowrap"><Calculator size={20} /> {isAR ? 'حاسبة السعرات' : 'BMR Calculator'}</Link>
          </div>
        </motion.div>
      </section>

      {/* PACKAGES */}
      <section className="container-x py-8 pb-16">
        <SectionTitle center
          title={isAR ? <>باقات <span className="text-fire">التدريب</span></> : <>Coaching <span className="text-fire">Packages</span></>}
          subtitle={isAR ? 'اختار باقة واحجز من واتساب مباشرة — بدون دفع أونلاين.' : 'Pick a package and book directly on WhatsApp — no payment online.'}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <motion.div key={p.id} {...fadeUp} transition={{ delay: i * 0.08 }} whileHover={{ y: -8 }} className={`rounded-3xl p-6 border relative overflow-hidden ${p.highlight ? 'bg-gradient-to-b from-rose-600/25 to-stone-900 border-rose-500/60 shadow-fire-lg' : 'card-fire'}`}>
              {p.highlight && <div className="absolute top-0 left-0 right-0 h-1.5 bg-fire-gradient" />}
              <span className="text-[11px] font-extrabold tracking-wider bg-fire-gradient text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5"><Flame size={12} /> {pick(p, 'tag')}</span>
              <h3 className="font-display text-2xl mt-3 uppercase">{pick(p, 'name')}</h3>
              <div className="my-3"><span className="font-display text-4xl text-fire">{p.price}</span><span className="text-stone-400 text-sm">{pick(p, 'period')}</span></div>
              <ul className="space-y-2 text-sm mb-6 text-stone-300">{pickArr(p, 'features').map((f) => <li key={f} className="flex items-start gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> {f}</li>)}</ul>
              <WhatsAppButton text={pick(p, 'whatsappText')} label={isAR ? `احجز ${pick(p, 'name')}` : `Book ${pick(p, 'name')}`} className="w-full" />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6"><Link to="/booking" className="font-bold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1.5">{t('bookPackage')} <ArrowRight size={16} className="rtl:rotate-180" /></Link></div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative bg-stone-950 border-t border-rose-500/15 overflow-hidden">
        <EmberBackground />
        <div className="relative container-x py-16">
          <SectionTitle center
            title={isAR ? <>آراء <span className="text-fire">العملاء</span></> : <>What Clients <span className="text-fire">Say</span></>}
            subtitle={isAR ? 'تقييمات واتساب من تدريب حقيقي.' : 'WhatsApp reviews from real coaching.'}
          />
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((titem, i) => (
              <motion.div key={titem.id} {...fadeUp} transition={{ delay: i * 0.08 }} className="card-fire p-6">
                <div className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={14} fill="currentColor" />)}</div>
                <p className="text-stone-200 mt-2">“{pick(titem, 'text')}”</p>
                <div className="flex items-center gap-3 mt-4">
                  <img src={titem.avatar} className="w-10 h-10 rounded-full border-2 border-rose-500/50" alt={pick(titem, 'name')} />
                  <div><div className="font-bold text-sm text-white">{pick(titem, 'name')}</div><div className="text-xs text-rose-300">{pick(titem, 'role')}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-9">
            <WhatsAppButton large text={isAR ? 'أهلاً محمد! قريت التقييمات وعايز أبدأ' : 'Hi Mohammad! I read the reviews and want to start'} label={isAR ? 'كن النتيجة الجاية' : 'Become the Next Result'} />
          </div>
        </div>
      </section>
    </div>
  )
}
