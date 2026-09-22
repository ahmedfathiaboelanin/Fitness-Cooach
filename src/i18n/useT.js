import { usePrefsStore } from '../store/usePrefsStore'
import { dict } from './dict'

// t('nav.home') style lookup with EN fallback
export function useT() {
  const lang = usePrefsStore((s) => s.lang)
  const d = dict[lang] || dict.en
  const t = (path) => {
    const parts = String(path).split('.')
    let cur = d
    for (const p of parts) cur = cur?.[p]
    if (cur != null) return cur
    cur = dict.en
    for (const p of parts) cur = cur?.[p]
    return cur ?? path
  }
  return { t, lang, dir: lang === 'ar' ? 'rtl' : 'ltr', isAR: lang === 'ar' }
}

// pick localized field: L(item, 'name') -> item.name_ar when AR & present
export function L(obj, base) {
  if (!obj) return ''
  const lang = usePrefsStore.getState().lang
  if (lang === 'ar') {
    const v = obj[`${base}_ar`]
    if (v && String(v).trim()) return v
  }
  return obj[base] ?? ''
}

// Hook version (reactive)
export function useL() {
  const lang = usePrefsStore((s) => s.lang)
  const pick = (obj, base) => {
    if (!obj) return ''
    if (lang === 'ar') {
      const v = obj[`${base}_ar`]
      if (v && String(v).trim()) return v
    }
    return obj[base] ?? ''
  }
  // arrays: pickArr(pkg, 'features') -> features_ar or features
  const pickArr = (obj, base) => {
    if (!obj) return []
    if (lang === 'ar') {
      const v = obj[`${base}_ar`]
      if (Array.isArray(v) && v.length) return v
    }
    return obj[base] || []
  }
  return { pick, pickArr, lang, isAR: lang === 'ar' }
}
