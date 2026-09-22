import { useParams, Link } from 'react-router-dom'
import { Flame, ArrowRight } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Badge, Card } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'

export default function WorkoutDetail() {
  const { id } = useParams()
  const programs = useSiteStore((s) => s.programs)
  const coach = useSiteStore((s) => s.coach)
  const { isAR } = useT()
  const { pick } = useL()
  const w = programs.find((x) => x.id === id)
  if (!w) return <div className="bg-stone-950 text-white min-h-screen"><div className="container-x py-10">{isAR ? 'غير موجود' : 'Not found'} <Link to="/workouts" className="text-rose-400">{isAR ? 'رجوع' : 'Back'}</Link></div></div>
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-8">
        <Link to="/workouts" className="text-sm text-stone-400 hover:text-rose-300 inline-flex items-center gap-1.5"><ArrowRight size={15} className={isAR ? '' : 'rotate-180'} /> {isAR ? 'كل البرامج' : 'All programs'}</Link>
        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          <div className="rounded-3xl p-1.5 bg-fire-gradient shadow-fire-lg h-fit">
            <img src={w.image} className="rounded-3xl h-80 w-full object-cover" alt={pick(w, 'title')} />
          </div>
          <Card>
            <div className="flex flex-wrap gap-2"><Badge color="green">{pick(w, 'level')}</Badge><Badge>{pick(w, 'goal')}</Badge><Badge color="fire"><span className="inline-flex items-center gap-1"><Flame size={11} /> {pick(coach, 'name')}</span></Badge></div>
            <h1 className="font-display text-3xl mt-2 uppercase">{pick(w, 'title')}</h1>
            <p className="text-stone-400 mt-1">{pick(w, 'description')}</p>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="bg-stone-950 border border-rose-500/20 rounded-xl p-3"><b className="block font-display text-xl text-fire">{w.durationWeeks} {isAR ? 'أسابيع' : 'wks'}</b><span className="text-xs text-stone-400">{isAR ? 'المدة' : 'Duration'}</span></div>
              <div className="bg-stone-950 border border-rose-500/20 rounded-xl p-3"><b className="block font-display text-xl text-fire">{w.daysPerWeek}x</b><span className="text-xs text-stone-400">{isAR ? 'أسبوعياً' : 'Per week'}</span></div>
              <div className="bg-stone-950 border border-rose-500/20 rounded-xl p-3"><b className="block font-display text-xl text-fire">{w.durationMin}m</b><span className="text-xs text-stone-400">{isAR ? 'للحصة' : 'Per session'}</span></div>
            </div>
            <WhatsAppButton className="w-full mt-4" text={isAR ? `أهلاً محمد! عايز برنامج "${pick(w, 'title')}" (${pick(w, 'level')}). هدفي هو:` : `Hi Mohammad! I want the program "${pick(w, 'title')}" (${pick(w, 'level')}). My goal is:`} label={isAR ? 'خد البرنامج ده' : 'Get This Program'} />
          </Card>
        </div>
        <Card className="mt-6">
          <h3 className="font-display text-xl uppercase">{isAR ? 'التمارين — المجموعات / التكرارات' : 'Exercises — Sets / Reps'}</h3>
          <p className="text-xs text-stone-400 mb-3">{isAR ? `هيكل تجريبي. خطتك بتتفصل من ${pick(coach, 'firstName')}` : `Sample structure. Your exact plan is customized by ${pick(coach, 'firstName')}`}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-rose-300"><th className="py-2">{isAR ? 'التمرين' : 'Exercise'}</th><th>{isAR ? 'مجموعات' : 'Sets'}</th><th>{isAR ? 'تكرارات' : 'Reps'}</th><th>{isAR ? 'راحة' : 'Rest'}</th></tr></thead>
              <tbody>{(w.exercises || []).map((e) => (
                <tr key={e.name} className="border-t border-white/10"><td className="py-2.5 font-medium text-white">{e.name}</td><td className="text-stone-300">{e.sets}</td><td className="text-stone-300">{e.reps}</td><td className="text-stone-300">{e.rest}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
