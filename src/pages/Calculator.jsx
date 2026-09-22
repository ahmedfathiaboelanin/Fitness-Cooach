import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator as CalculatorIcon, Target, Dumbbell, Droplets, ArrowRight, MessageCircle } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Button, SectionTitle } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground } from '../components/brand'
import { waLink } from '../utils/whatsapp'

const ACTIVITY = [
  { id: 'sedentary', factor: 1.2, en: 'Sedentary (desk job, no sport)', ar: 'خامل (شغل مكتب، بدون رياضة)' },
  { id: 'light', factor: 1.375, en: 'Light (1–2 workouts/week)', ar: 'خفيف (1–2 تمارين/أسبوع)' },
  { id: 'moderate', factor: 1.55, en: 'Moderate (3–4 workouts/week)', ar: 'متوسط (3–4 تمارين/أسبوع)' },
  { id: 'active', factor: 1.725, en: 'Active (5–6 workouts/week)', ar: 'نشيط (5–6 تمارين/أسبوع)' },
  { id: 'athlete', factor: 1.9, en: 'Athlete (daily / physical job)', ar: 'رياضي (يومي / شغل بدني)' },
]

const GOALS = [
  { id: 'lose', adj: -500, en: 'Fat loss (−500 kcal)', ar: 'تخسيس (−500 سعرة)' },
  { id: 'maintain', adj: 0, en: 'Maintain', ar: 'ثبات' },
  { id: 'gain', adj: 300, en: 'Muscle gain (+300 kcal)', ar: 'زيادة عضلات (+300 سعرة)' },
]

export default function Calculator() {
  const coach = useSiteStore((s) => s.coach)
  const { isAR } = useT()
  const { pick } = useL()
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('25')
  const [height, setHeight] = useState('175')
  const [weight, setWeight] = useState('80')
  const [activity, setActivity] = useState('moderate')
  const [goal, setGoal] = useState('maintain')
  const [show, setShow] = useState(false)

  const result = useMemo(() => {
    const a = parseFloat(age), h = parseFloat(height), w = parseFloat(weight)
    if (!a || !h || !w || a < 10 || a > 100 || h < 100 || h > 250 || w < 25 || w > 300) return null
    const bmr = Math.round(10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161))
    const factor = ACTIVITY.find((x) => x.id === activity)?.factor || 1.55
    const tdee = Math.round(bmr * factor)
    const adj = GOALS.find((x) => x.id === goal)?.adj || 0
    const target = tdee + adj
    const protein = `${Math.round(w * 1.6)}–${Math.round(w * 2.2)} g`
    const water = `${(w * 35 / 1000).toFixed(1)} L`
    return { bmr, tdee, target, protein, water }
  }, [age, height, weight, gender, activity, goal])

  const shareText = result
    ? (isAR
      ? `أهلاً ${pick(coach, 'firstName')}! حسبت سعراتي\n\nBMR: ${result.bmr}\nTDEE: ${result.tdee}\nالمستهدف: ${result.target} سعرة/يوم\nالبروتين: ${result.protein}\n\nعايز خطة مخصصة`
      : `Hi ${pick(coach, 'firstName')}! I calculated my calories\n\nBMR: ${result.bmr}\nTDEE: ${result.tdee}\nTarget: ${result.target} kcal/day\nProtein: ${result.protein}\n\nI want a custom plan`)
    : ''

  const numCls = 'w-full px-4 py-2.5 border border-white/10 rounded-xl bg-stone-950 text-white placeholder:text-stone-500'
  const segBtn = (on) => `px-4 py-2 rounded-xl text-sm font-extrabold transition ${on ? 'bg-fire-gradient text-white shadow-fire' : 'text-stone-400 hover:text-white'}`

  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden min-h-screen">
      <EmberBackground />
      <div className="relative container-x py-10 max-w-3xl">
        <SectionTitle
          center
          eyebrow={isAR ? 'احسب سعراتك' : 'KNOW YOUR NUMBERS'}
          title={isAR ? <>حاسبة <span className="text-fire">السعرات (BMR)</span></> : <>BMR <span className="text-fire">Calorie Calculator</span></>}
          subtitle={isAR ? 'معادلة Mifflin-St Jeor — تقدير مريح للعين وواضح، والنتيجة النهائية مع محمد على واتساب.' : 'Mifflin-St Jeor estimate — eye-comfort reading, final plan with Mohammad on WhatsApp.'}
        />
        <Card className="space-y-5">
          <div>
            <label className="text-sm font-bold text-stone-300">{isAR ? 'النوع' : 'Gender'}</label>
            <div className="flex gap-2 mt-2 bg-stone-950 border border-white/10 rounded-2xl p-1.5 w-fit">
              {[{ id: 'male', en: 'Male', ar: 'ذكر' }, { id: 'female', en: 'Female', ar: 'أنثى' }].map((g) => (
                <button key={g.id} onClick={() => setGender(g.id)} className={segBtn(gender === g.id)}>{isAR ? g.ar : g.en}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-bold text-stone-300">{isAR ? 'السن' : 'Age'}</label><input type="number" min="10" max="100" value={age} onChange={(e) => setAge(e.target.value)} className={`${numCls} mt-1.5`} /></div>
            <div><label className="text-sm font-bold text-stone-300">{isAR ? 'الطول (سم)' : 'Height (cm)'}</label><input type="number" min="100" max="250" value={height} onChange={(e) => setHeight(e.target.value)} className={`${numCls} mt-1.5`} /></div>
            <div><label className="text-sm font-bold text-stone-300">{isAR ? 'الوزن (كجم)' : 'Weight (kg)'}</label><input type="number" min="25" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${numCls} mt-1.5`} /></div>
          </div>

          <div>
            <label className="text-sm font-bold text-stone-300">{isAR ? 'مستوى النشاط' : 'Activity level'}</label>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {ACTIVITY.map((a) => (
                <button key={a.id} onClick={() => setActivity(a.id)} className={`text-start px-4 py-2.5 rounded-xl border text-sm font-bold transition ${activity === a.id ? 'border-rose-500 bg-rose-500/10 text-white shadow-fire' : 'border-white/10 text-stone-400 hover:border-rose-500/40'}`}>
                  {isAR ? a.ar : a.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-stone-300">{isAR ? 'الهدف' : 'Goal'}</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => setGoal(g.id)} className={segBtn(goal === g.id) + ' border border-white/10'}>{isAR ? g.ar : g.en}</button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => setShow(true)}><span className="inline-flex items-center gap-2"><CalculatorIcon size={18} /> {isAR ? 'احسب سعراتي' : 'Calculate my calories'}</span></Button>

          {show && (
            result ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'BMR', value: result.bmr, unit: isAR ? 'سعرة' : 'kcal', Icon: null },
                  { label: 'TDEE', value: result.tdee, unit: isAR ? 'سعرة' : 'kcal', Icon: null },
                  { label: isAR ? 'المستهدف' : 'Target', value: result.target, unit: isAR ? 'سعرة/يوم' : 'kcal/day', hot: true, Icon: Target },
                  { label: isAR ? 'بروتين' : 'Protein', value: result.protein, unit: '', Icon: Dumbbell },
                ].map((r) => (
                  <div key={r.label} className={`rounded-2xl p-4 text-center border ${r.hot ? 'bg-fire-gradient text-white border-transparent shadow-fire-lg' : 'bg-stone-950 border-white/10'}`}>
                    <div className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 ${r.hot ? 'text-white/85' : 'text-stone-400'}`}>{r.Icon && <r.Icon size={12} />}{r.label}</div>
                    <div className={`font-display text-2xl mt-1 ${r.hot ? '' : 'text-fire'}`}>{r.value}</div>
                    <div className={`text-[11px] ${r.hot ? 'text-white/80' : 'text-stone-500'}`}>{r.unit}</div>
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-4 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
                  <Droplets size={13} className="text-rose-400" /> {isAR ? `مياه مقترحة: ${result.water}/يوم` : `Suggested water: ${result.water}/day`} • {isAR ? 'تقدير مبدئي — خطتك النهائية مع محمد' : 'Rough estimate — final plan with Mohammad'}
                </div>
                <div className="col-span-2 sm:col-span-4 flex flex-col sm:flex-row gap-2">
                  <a href={waLink(shareText)} target="_blank" rel="noreferrer" className="btn-wa flex-1 text-center font-extrabold px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2"><MessageCircle size={18} /> {isAR ? 'ابعت النتيجة لمحمد على واتساب' : 'Send result to Mohammad'} <ArrowRight size={16} className="rtl:rotate-180" /></a>
                  <WhatsAppButton text={shareText} label={isAR ? 'استفسر عن الخطة' : 'Ask about a plan'} className="flex-1" />
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-red-400 text-center">{isAR ? 'لو سمحت دخل سن وطول ووزن صحيحين.' : 'Please enter a valid age, height and weight.'}</p>
            )
          )}
        </Card>
        <p className="text-[11px] text-stone-500 text-center mt-4">
          {isAR ? 'تنبيه: الحاسبة تقديرية (Mifflin-St Jeor) وليست بديلاً عن استشارة طبية.' : 'Note: estimator only (Mifflin-St Jeor), not medical advice.'}
        </p>
      </div>
    </div>
  )
}
