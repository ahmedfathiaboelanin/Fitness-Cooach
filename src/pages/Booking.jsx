import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, ArrowRight, MessageCircle } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { timeSlots, next7Days } from '../utils/helpers'
import { Button, Card, Input } from '../components/ui'
import { waLink } from '../utils/whatsapp'

export default function Booking() {
  const packages = useSiteStore((s) => s.packages)
  const coach = useSiteStore((s) => s.coach)
  const { isAR, t } = useT()
  const { pick } = useL()
  const [params] = useSearchParams()
  const [step, setStep] = useState(1)
  const [pkgId, setPkgId] = useState(params.get('package') || packages[0]?.id || 'online')
  const [date, setDate] = useState(next7Days()[0])
  const [time, setTime] = useState('17:00')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(isAR ? 'زيادة عضلات' : 'Muscle Gain')
  const days = useMemo(() => next7Days(), [])
  const pkg = packages.find((p) => p.id === pkgId) || packages[0]

  if (!pkg) return <div className="bg-stone-950 text-white min-h-screen"><div className="container-x py-10">{isAR ? 'لا توجد باقات بعد.' : 'No packages yet.'}</div></div>

  const message = isAR
    ? `أهلاً ${pick(coach, 'firstName')}! عايز أحجز\n\nالباقة: ${pick(pkg, 'name')} (${pkg.price}${pick(pkg, 'period')})\nالاسم: ${name || '-'}\nالهدف: ${goal}\nالموعد المفضل: ${date} الساعة ${time}\n\nلو سمحت أكد الحجز`
    : `Hi ${pick(coach, 'firstName')}! I want to book\n\nPackage: ${pick(pkg, 'name')} (${pkg.price}${pick(pkg, 'period')})\nName: ${name || '-'}\nGoal: ${goal}\nPreferred: ${date} at ${time}\n\nPlease confirm availability`

  const goals = isAR ? ['زيادة عضلات', 'تخسيس', 'قوة', 'بداية كمبتدئ'] : ['Muscle Gain', 'Fat Loss', 'Strength', 'Beginner Start']

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-10 max-w-3xl">
        <span className="text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"><Flame size={12} /> {t('bookCoaching')}</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3 uppercase">{isAR ? <>احجز مع <span className="text-fire">{pick(coach, 'firstName')}</span></> : <>Book with <span className="text-fire">{pick(coach, 'firstName')}</span></>}</h1>
        <p className="text-stone-400">{isAR ? '3 خطوات سريعة — التأكيد النهائي على واتساب' : '3 quick steps — final confirmation happens on WhatsApp'}</p>
        <div className="flex gap-2 mt-5">{[1, 2, 3].map((s) => <motion.div key={s} animate={{ scale: step >= s ? 1 : 0.95 }} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-fire-gradient shadow-fire' : 'bg-white/10'}`} />)}</div>

        {step === 1 && (
          <Card className="mt-6">
            <h3 className="font-display text-xl uppercase mb-3">{isAR ? '1. اختار باقتك' : '1. Choose your package'}</h3>
            <div className="space-y-3">
              {packages.map((p) => (
                <motion.button key={p.id} whileHover={{ scale: 1.01 }} onClick={() => setPkgId(p.id)} className={`w-full flex justify-between items-center p-4 rounded-2xl border text-left transition ${pkgId === p.id ? 'border-rose-500 bg-rose-500/10 shadow-fire' : 'border-white/10 hover:border-rose-500/40'}`}>
                  <div><div className="font-bold text-white">{pick(p, 'name')} <span className="text-[10px] bg-fire-gradient text-white px-2 py-0.5 rounded-full ml-1 inline-flex items-center gap-1"><Flame size={10} /> {pick(p, 'tag')}</span></div><div className="text-xs text-stone-400">{(p.features || []).slice(0, 2).join(' • ')}</div></div>
                  <div className="font-display text-xl text-fire">{p.price}</div>
                </motion.button>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={() => setStep(2)}><span className="inline-flex items-center gap-2">{isAR ? 'كمل' : 'Continue'} <ArrowRight size={16} className="rtl:rotate-180" /></span></Button>
          </Card>
        )}
        {step === 2 && (
          <Card className="mt-6 space-y-4">
            <h3 className="font-display text-xl uppercase">{isAR ? '2. بياناتك والوقت المفضل' : '2. Details & preferred time'}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label={isAR ? 'اسمك' : 'Your name'} placeholder={isAR ? 'مثال: أحمد' : 'e.g. Ahmed'} value={name} onChange={(e) => setName(e.target.value)} />
              <div><label className="text-sm font-semibold text-stone-300">{isAR ? 'الهدف' : 'Goal'}</label><select value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 border border-white/10 rounded-xl bg-stone-900 text-white">{goals.map((g) => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-300">{isAR ? 'اليوم المفضل' : 'Preferred date'}</label>
              <div className="flex flex-wrap gap-2 mt-2">{days.map((d) => <button key={d} onClick={() => setDate(d)} className={`px-3 py-2 rounded-xl text-sm border font-bold transition ${date === d ? 'bg-fire-gradient text-white border-transparent shadow-fire' : 'border-white/10 text-stone-300'}`}>{d.slice(5)}</button>)}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-300">{isAR ? 'الوقت المفضل' : 'Preferred time'}</label>
              <div className="flex flex-wrap gap-2 mt-2">{timeSlots.map((tm) => <button key={tm} onClick={() => setTime(tm)} className={`px-3 py-2 rounded-xl text-sm border font-bold transition ${time === tm ? 'bg-green-600 text-white border-transparent' : 'border-white/10 text-stone-300'}`}>{tm}</button>)}</div>
            </div>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(1)}>{isAR ? 'رجوع' : 'Back'}</Button><Button onClick={() => setStep(3)}>{isAR ? 'مراجعة' : 'Review'}</Button></div>
          </Card>
        )}
        {step === 3 && (
          <Card className="mt-6">
            <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2">{isAR ? '3. أكد على واتساب' : '3. Confirm on WhatsApp'} <MessageCircle size={18} className="text-rose-400" /></h3>
            <div className="bg-stone-950 border border-rose-500/20 rounded-xl p-4 text-sm whitespace-pre-line text-stone-200">{message}</div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>{isAR ? 'رجوع' : 'Back'}</Button>
              <a href={waLink(message)} target="_blank" rel="noreferrer" className="btn-wa flex-1 text-center font-extrabold px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2"><MessageCircle size={18} /> {isAR ? 'أكد على واتساب' : 'Confirm via WhatsApp'} <ArrowRight size={16} className="rtl:rotate-180" /></a>
            </div>
            <p className="text-xs text-stone-500 mt-3">{isAR ? `بدون دفع أونلاين. ${pick(coach, 'firstName')} بيأكد الموعد وتفاصيل الدفع على واتساب.` : `No payment online. ${pick(coach, 'firstName')} confirms availability and payment details on WhatsApp.`}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
