/** Shared form primitives for the hidden admin dashboard. */
import { useT } from '../i18n/useT'

export const inputCls = 'w-full px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-white text-sm placeholder:text-stone-500'
export const labelCls = 'text-xs font-bold text-stone-400 uppercase tracking-wider'

// t('admin.<key>') shortcut
export function useA() {
  const { t, isAR, lang } = useT()
  return { a: (key) => t(`admin.${key}`), isAR, lang }
}

export function Field({ label, ltr, ...props }) {
  return (
    <div className="min-w-0">
      <label className={labelCls}>{label}</label>
      <input {...props} dir={ltr ? 'ltr' : undefined} className={`${inputCls} mt-1`} />
    </div>
  )
}

export function Area({ label, ltr, ...props }) {
  return (
    <div className="min-w-0">
      <label className={labelCls}>{label}</label>
      <textarea {...props} dir={ltr ? 'ltr' : undefined} className={`${inputCls} mt-1`} rows={props.rows || 3} />
    </div>
  )
}

/** Small hint under each form pointing to bulk editing */
export function BulkHint({ goData }) {
  const { a } = useA()
  return (
    <p className="text-xs text-stone-500">
      {a('bulkHint')} <button onClick={goData} className="text-[#5B9CFF] font-bold underline">{a('bulkLink')}</button>
    </p>
  )
}

export function TabTitle({ icon: Icon, title, sub }) {
  return (
    <div className="mb-4 min-w-0">
      <h2 className="font-display text-xl sm:text-2xl uppercase flex items-center gap-2">
        <Icon size={22} className="text-rose-400 shrink-0" /> <span className="min-w-0">{title}</span>
      </h2>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}
