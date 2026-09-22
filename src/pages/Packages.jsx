import { motion } from 'framer-motion'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { SectionTitle } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground } from '../components/brand'

export default function Packages() {
  const packages = useSiteStore((s) => s.packages)
  const coach = useSiteStore((s) => s.coach)
  const { isAR } = useT()
  const { pick, pickArr } = useL()
  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden min-h-screen">
      <EmberBackground />
      <div className="relative container-x py-10">
        <SectionTitle center
          title={isAR ? <>باقات <span className="text-fire">التدريب</span></> : <>Coaching <span className="text-fire">Packages</span></>}
          subtitle={isAR ? 'أسعار واضحة — احجز بضغطة واحدة على واتساب. بدون دفع أونلاين.' : 'Transparent pricing — book in 1 click on WhatsApp. No payment online.'}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -8 }} className={`rounded-3xl p-6 border relative overflow-hidden ${p.highlight ? 'bg-gradient-to-b from-rose-600/25 to-stone-900 border-rose-500/60 shadow-fire-lg' : 'card-fire'}`}>
              {p.highlight && <div className="absolute top-0 left-0 right-0 h-1.5 bg-fire-gradient animate-gradient-x bg-[length:200%_100%]" />}
              <span className="text-[11px] font-extrabold tracking-wider bg-fire-gradient text-white px-3 py-1 rounded-full">🔥 {pick(p, 'tag')}</span>
              <h3 className="font-display text-2xl mt-3 uppercase">{pick(p, 'name')}</h3>
              <div className="my-3"><span className="font-display text-4xl text-fire">{p.price}</span><span className="text-stone-400 text-sm">{pick(p, 'period')}</span></div>
              <ul className="space-y-2 text-sm mb-6 text-stone-300">{pickArr(p, 'features').map((f) => <li key={f}>🔥 {f}</li>)}</ul>
              <WhatsAppButton text={pick(p, 'whatsappText')} label={isAR ? `احجز ${pick(p, 'name')}` : `Book ${pick(p, 'name')}`} className="w-full" />
            </motion.div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 text-center text-sm text-stone-300">
          {isAR ? <>مش عارف أي باقة تناسبك؟ <b className="text-white">ابعت لمحمد مجاناً</b> بهدفك وهو هيرشحلك.</> : <>Not sure which package fits you? <b className="text-white">Message {coach.firstName} free</b> with your goal and he will recommend.</>}<br />
          <span className="inline-block mt-3"><WhatsAppButton text={isAR ? 'أهلاً محمد! محتاج مساعدة في اختيار الباقة 🔥 هدفي هو:' : 'Hi Mohammad! I need help choosing the right package 🔥 My goal is:'} label={isAR ? 'اطلب نصيحة 🔥' : 'Ask for Advice 🔥'} /></span>
        </div>
      </div>
    </div>
  )
}
