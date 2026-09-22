import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from './ui'
import { useL, useT } from '../i18n/useT'

export function WorkoutCard({ plan }) {
  const { pick } = useL()
  const { t } = useT()
  return (
    <motion.div whileHover={{ y: -6 }} className="card-fire overflow-hidden group">
      <div className="relative overflow-hidden">
        <img src={plan.image} alt={plan.title} className="h-48 w-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <Badge color={plan.level === 'Beginner' ? 'green' : plan.level === 'Intermediate' ? 'amber' : 'red'}>{pick(plan, 'level')}</Badge>
          <Badge color="slate">{pick(plan, 'goal')}</Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white group-hover:text-rose-300 transition">{pick(plan, 'title')}</h3>
        <p className="text-sm text-stone-400 mt-1">🔥 {plan.durationWeeks} weeks • {plan.daysPerWeek}x/week • {plan.durationMin} min</p>
        <Link to={`/workouts/${plan.id}`} className="inline-block mt-3 text-sm font-bold text-rose-400 hover:text-rose-300">{t('viewProgram')}</Link>
      </div>
    </motion.div>
  )
}

export function ProgressChart({ data }) {
  const max = Math.max(...data.map((d) => d.weight))
  const min = Math.min(...data.map((d) => d.weight))
  const points = data.map((d, i) => {
    const x = 20 + (i * 300) / (data.length - 1)
    const y = 120 - ((d.weight - min + 0.3) / (max - min + 0.6)) * 100
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 340 150" className="w-full min-w-[320px] h-40">
        <defs>
          <linearGradient id="fireStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFD166" />
            <stop offset="50%" stopColor="#EF233C" />
            <stop offset="100%" stopColor="#E11D2E" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="url(#fireStroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = 20 + (i * 300) / (data.length - 1)
          const y = 120 - ((d.weight - min + 0.3) / (max - min + 0.6)) * 100
          return <g key={d.week}><circle cx={x} cy={y} r="4.5" fill="#EF233C" stroke="#fff" strokeWidth="1.5" /><text x={x} y={140} fontSize="9" textAnchor="middle" fill="#a8a29e">{d.week}</text></g>
        })}
      </svg>
    </div>
  )
}
