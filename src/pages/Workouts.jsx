import { useState } from 'react'
import { Flame, ArrowRight } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { WorkoutCard } from '../components/cards'

export default function Workouts() {
  const programs = useSiteStore((s) => s.programs)
  const coach = useSiteStore((s) => s.coach)
  const { isAR, t } = useT()
  const { pick } = useL()
  const [level, setLevel] = useState('All')
  const levels = isAR ? ['All', 'مبتدئ', 'متوسط', 'متقدم'] : ['All', 'Beginner', 'Intermediate', 'Advanced']
  const matchLevel = (w) => {
    if (level === 'All') return true
    return w.level === level || w.level_ar === level
  }
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-10">
        <span className="text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"><Flame size={12} /> {t('trainWith')} {pick(coach, 'firstName').toUpperCase()}</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3 uppercase">{isAR ? <>برامج <span className="text-fire">التدريب</span></> : <>Training <span className="text-fire">Programs</span></>}</h1>
        <p className="text-stone-400 mt-2">{isAR ? `مبتدئ / متوسط / متقدم — بتتفصل عليك لما تتمرن مع ${pick(coach, 'firstName')}` : `Beginner / Intermediate / Advanced — personalized when you coach with ${pick(coach, 'firstName')}`}</p>
        <div className="flex gap-2 mt-5 bg-stone-900 border border-white/10 rounded-2xl p-2 w-fit">
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`px-4 py-1.5 rounded-full text-sm font-extrabold transition ${level === l ? 'bg-fire-gradient text-white shadow-fire' : 'text-stone-400 hover:text-white'}`}>{l === 'All' ? (isAR ? 'الكل' : 'All') : l}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {programs.filter(matchLevel).map((w) => <WorkoutCard key={w.id} plan={w} />)}
          {programs.filter(matchLevel).length === 0 && <p className="text-stone-400">{isAR ? 'لا توجد برامج بعد.' : 'No programs yet.'}</p>}
        </div>
        <div className="mt-8 rounded-2xl p-[2px] bg-fire-gradient">
          <div className="bg-stone-950 rounded-2xl p-5 text-sm text-stone-300 flex items-start gap-2">
            <Flame size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{isAR ? <>عايز برنامج متفصل <b className="text-white">لجسمك</b> وهدفك وأدواتك؟ <a className="font-extrabold text-rose-400 underline inline-flex items-center gap-1" href="/booking">احجز مع {pick(coach, 'firstName')} على واتساب <ArrowRight size={14} className="rotate-180" /></a></> : <>Want a program built for <b className="text-white">your</b> body, goal and equipment? <a className="font-extrabold text-rose-400 underline inline-flex items-center gap-1" href="/booking">Book with {pick(coach, 'firstName')} on WhatsApp <ArrowRight size={14} /></a></>}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
