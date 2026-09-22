import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Badge } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground, StatBurst } from '../components/brand'

export default function About() {
  const coach = useSiteStore((s) => s.coach)
  const { t, isAR } = useT()
  const { pick } = useL()
  const specs = isAR && coach.specializations_ar?.length ? coach.specializations_ar : coach.specializations
  const certs = isAR && coach.certifications_ar?.length ? coach.certifications_ar : coach.certifications
  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden">
      <EmberBackground />
      <div className="relative container-x py-10 grid lg:grid-cols-[380px_1fr] gap-6">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.8rem] p-1.5 bg-fire-gradient shadow-fire-lg">
            <img src={coach.avatar} className="rounded-[1.5rem] w-full h-[460px] object-cover" alt={pick(coach, 'name')} />
          </motion.div>
          <Card className="mt-4 text-center">
            <div className="font-display text-2xl uppercase">{pick(coach, 'name')}</div>
            <div className="text-sm text-rose-300 font-bold">{pick(coach, 'title')}</div>
            <div className="text-xs text-stone-400 mt-1">{pick(coach, 'location')}</div>
            <WhatsAppButton className="w-full mt-4" text={pick(coach, 'whatsappText') || (isAR ? 'أهلاً محمد! عايز أتمرن معاك 🔥💪' : 'Hi Mohammad! I want to train with you 🔥💪')} label={isAR ? 'تواصل واتساب' : 'Contact on WhatsApp'} />
          </Card>
        </div>
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full">{t('myStory')}</span>
            <h1 className="font-display text-5xl mt-3 uppercase">{isAR ? <>أهلاً، أنا <span className="text-fire">{pick(coach, 'firstName')}</span> 👋</> : <>Hi, I'm <span className="text-fire">{pick(coach, 'firstName')}</span> 👋</>}</h1>
            <p className="text-stone-300 mt-3 leading-relaxed">{pick(coach, 'bio')}</p>
            <div className="mt-5"><StatBurst stats={coach.stats} /></div>
          </div>
          <Card>
            <h3 className="font-display text-xl uppercase mb-3">🔥 {isAR ? 'التخصصات' : 'Specializations'}</h3>
            <div className="flex flex-wrap gap-2">{specs.map((s) => <Badge key={s}>{s}</Badge>)}</div>
            <h3 className="font-display text-xl uppercase mt-6 mb-2">🎓 {isAR ? 'الشهادات' : 'Certifications'}</h3>
            <ul className="text-sm space-y-1 text-stone-300">{certs.map((c) => <li key={c}>🔥 {c}</li>)}</ul>
          </Card>
          <Card>
            <h3 className="font-display text-xl uppercase mb-3">{isAR ? 'هنشتغل مع بعض إزاي' : 'How we will work together'}</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {coach.approach.map((a) => (
                <motion.div key={pick(a, 'title')} whileHover={{ y: -4 }} className="bg-stone-950 border border-rose-500/20 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-fire-gradient" />
                  <b className="text-sm text-rose-300">{pick(a, 'title')}</b><p className="text-xs text-stone-400 mt-1">{pick(a, 'text')}</p>
                </motion.div>
              ))}
            </div>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Link to="/results" className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 font-bold text-sm hover:border-rose-500/50">{t('seeWork')} 🔥</Link>
            <Link to="/booking" className="btn-fire px-5 py-2.5 rounded-xl font-extrabold text-sm text-white">{t('bookPackage')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
