import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Input } from '../components/ui'
import { waLink } from '../utils/whatsapp'

export default function Contact() {
  const coach = useSiteStore((s) => s.coach)
  const { isAR, t } = useT()
  const { pick } = useL()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(isAR ? 'زيادة عضلات' : 'Muscle Gain')
  const [msg, setMsg] = useState('')

  const full = isAR
    ? `أهلاً ${pick(coach, 'firstName')}! أنا ${name || '(الاسم)'} 🔥\n🎯 الهدف: ${goal}\n💬 الرسالة: ${msg || '-'}\n\nلو سمحت رد عليا 🙏`
    : `Hi ${pick(coach, 'firstName')}! I'm ${name || '(name)'} 🔥\n🎯 Goal: ${goal}\n💬 Message: ${msg || '-'}\n\nPlease get back to me 🙏`

  const goals = isAR ? ['زيادة عضلات', 'تخسيس', 'قوة', 'بداية كمبتدئ', 'أخرى'] : ['Muscle Gain', 'Fat Loss', 'Strength', 'Beginner Start', 'Other']

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-10 max-w-3xl">
        <span className="text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full">{t('letsTalk')}</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3 uppercase">{isAR ? <>تواصل مع <span className="text-fire">{pick(coach, 'firstName')}</span> 💬</> : <>Contact <span className="text-fire">{pick(coach, 'firstName')}</span> 💬</>}</h1>
        <p className="text-stone-400">{isAR ? <>أسرع طريقة: واتساب <b className="text-white">{coach.whatsappDisplay}</b> — عادة بيرد نفس اليوم 🔥</> : <>Fastest way: WhatsApp <b className="text-white">{coach.whatsappDisplay}</b> — usually replies same day 🔥</>}</p>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <motion.div whileHover={{ y: -4 }}>
            <Card className="text-center h-full">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-5xl">💬</motion.div>
              <h3 className="font-display text-xl uppercase mt-2">{isAR ? 'واتساب مباشرة' : 'WhatsApp Direct'}</h3>
              <p className="text-sm text-stone-400">{coach.whatsappDisplay}</p>
              <a href={waLink(isAR ? 'أهلاً محمد! عندي سؤال عن التدريب 🔥🙏' : 'Hi Mohammad! I have a question about coaching 🔥🙏')} target="_blank" rel="noreferrer" className="block mt-3 bg-[#25D366] text-white font-extrabold py-2.5 rounded-xl shadow-[0_12px_35px_-10px_rgba(37,211,102,0.7)]">{isAR ? 'افتح واتساب 🔥 ←' : 'Open WhatsApp 🔥 →'}</a>
            </Card>
          </motion.div>
          <Card>
            <h3 className="font-display text-lg uppercase mb-3">{isAR ? 'ابعت تفاصيلك الأول' : 'Send details first'}</h3>
            <div className="space-y-3">
              <Input label={isAR ? 'اسمك' : 'Your name'} value={name} onChange={(e) => setName(e.target.value)} placeholder={isAR ? 'مثال: أحمد' : 'e.g. Ahmed'} />
              <div><label className="text-sm font-semibold text-stone-300">{isAR ? 'الهدف' : 'Goal'}</label><select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-white/10 rounded-xl bg-stone-900 text-white">{goals.map((g) => <option key={g}>{g}</option>)}</select></div>
              <div><label className="text-sm font-semibold text-stone-300">{isAR ? 'الرسالة' : 'Message'}</label><textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder={isAR ? 'الوزن الحالي، مكان التمرين (جيم/بيت)، الإصابات...' : 'Current weight, training place (gym/home), injuries...'} className="mt-1 w-full px-4 py-2.5 border border-white/10 rounded-xl bg-stone-900 text-white placeholder:text-stone-500" /></div>
              <a href={waLink(full)} target="_blank" rel="noreferrer" className="btn-fire block text-center text-white font-extrabold py-2.5 rounded-xl">{isAR ? 'ابعت على واتساب 🔥 ←' : 'Send via WhatsApp 🔥 →'}</a>
            </div>
          </Card>
        </div>
        <Card className="mt-4 text-sm text-stone-300">
          📍 {pick(coach, 'location')}<br />🏋️ {isAR ? 'حصص جيم + 💻 تدريب أونلاين لكل العالم' : 'Gym sessions + 💻 worldwide online coaching'}<br />⏰ {isAR ? 'أحسن وقت للرسايل: 10 الصبح – 10 بالليل 🔥' : 'Best time to message: 10am – 10pm 🔥'}
        </Card>
      </div>
    </div>
  )
}
