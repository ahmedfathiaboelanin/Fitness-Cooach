/**
 * Shape helpers for site content: Supabase rows <-> UI objects.
 *
 * Two directions, both tolerant of old + new schemas:
 *  - norm*   : DB row  -> UI shape (arrays guaranteed, prices as strings)
 *  - *ToDb   : UI form -> insert/update payload (no id / created_at)
 */
import siteDefaults from '../data/site.json'

export function toArray(v, fallback = []) {
  if (Array.isArray(v)) return v
  if (v == null || v === '') return fallback
  if (typeof v === 'string') {
    const t = v.trim()
    // old TEXT column sometimes holds a stringified JSON array
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t)
        if (Array.isArray(parsed)) return parsed
      } catch { /* fall through */ }
    }
    // newline- or pipe-separated plain text
    if (t.includes('\n')) return t.split('\n').map((x) => x.trim()).filter(Boolean)
    if (t.includes('|')) return t.split('|').map((x) => x.trim()).filter(Boolean)
    return [t]
  }
  return fallback
}

export const toStr = (v, fb = '') => (v == null ? fb : String(v))
export const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1'
export const toPrice = (v) => (v == null || v === '' ? '' : String(v)) // TEXT in new schema, numeric in old

/* ---------------- DB rows -> UI shape ---------------- */

export function normCoach(r) {
  if (!r) return { ...siteDefaults.coach }
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    firstName: toStr(r.firstName), firstName_ar: toStr(r.firstName_ar),
    title: toStr(r.title), title_ar: toStr(r.title_ar),
    tagline: toStr(r.tagline), tagline_ar: toStr(r.tagline_ar),
    location: toStr(r.location), location_ar: toStr(r.location_ar),
    avatar: toStr(r.avatar), cover: toStr(r.cover),
    bio: toStr(r.bio), bio_ar: toStr(r.bio_ar),
    whatsappNumber: toStr(r.whatsappNumber), whatsappDisplay: toStr(r.whatsappDisplay),
    stats: toArray(r.stats),
    certifications: toArray(r.certifications),
    certifications_ar: toArray(r.certifications_ar),
    specializations: toArray(r.specializations),
    specializations_ar: toArray(r.specializations_ar),
    approach: toArray(r.approach),
  }
}

export function normPackage(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    price: toPrice(r.price),
    period: toStr(r.period, '/month'), period_ar: toStr(r.period_ar, '/شهر'),
    tag: r.tag ?? '', tag_ar: r.tag_ar ?? '',
    features: toArray(r.features), features_ar: toArray(r.features_ar),
    whatsappText: r.whatsappText ?? '', whatsappText_ar: r.whatsappText_ar ?? '',
    highlight: toBool(r.highlight),
  }
}

export function normTransformation(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    result: toStr(r.result), result_ar: toStr(r.result_ar),
    goal: toStr(r.goal), goal_ar: toStr(r.goal_ar),
    image: r.image ?? '', text: r.text ?? '', text_ar: r.text_ar ?? '',
  }
}

export function normTestimonial(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    role: toStr(r.role, 'Client'), role_ar: toStr(r.role_ar, 'عميل'),
    avatar: toStr(r.avatar, 'https://i.pravatar.cc/100?img=11'),
    text: toStr(r.text), text_ar: toStr(r.text_ar),
  }
}

export function normService(r, idx = 0) {
  if (r == null) return null
  if (typeof r === 'object' && ('title' in r || 'desc' in r)) {
    return {
      id: r.id ?? `local-${idx}`,
      title: toStr(r.title), title_ar: toStr(r.title_ar),
      desc: toStr(r.desc), desc_ar: toStr(r.desc_ar),
      icon: toStr(r.icon, 'flame'),
    }
  }
  return null
}

export function normSupplement(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    price: toPrice(r.price),
    category: toStr(r.category), category_ar: toStr(r.category_ar),
    description: toStr(r.description), description_ar: toStr(r.description_ar),
    image: toStr(r.image),
  }
}

/* ---------------- UI objects -> DB payloads ---------------- */

export function coachToDb(c) {
  return {
    name: toStr(c.name), name_ar: toStr(c.name_ar),
    firstName: toStr(c.firstName), firstName_ar: toStr(c.firstName_ar),
    title: toStr(c.title), title_ar: toStr(c.title_ar),
    tagline: toStr(c.tagline), tagline_ar: toStr(c.tagline_ar),
    location: toStr(c.location), location_ar: toStr(c.location_ar),
    avatar: toStr(c.avatar), cover: toStr(c.cover),
    bio: toStr(c.bio), bio_ar: toStr(c.bio_ar),
    whatsappNumber: toStr(c.whatsappNumber), whatsappDisplay: toStr(c.whatsappDisplay),
    stats: Array.isArray(c.stats) ? c.stats : [],
    certifications: Array.isArray(c.certifications) ? c.certifications : [],
    certifications_ar: Array.isArray(c.certifications_ar) ? c.certifications_ar : [],
    specializations: Array.isArray(c.specializations) ? c.specializations : [],
    specializations_ar: Array.isArray(c.specializations_ar) ? c.specializations_ar : [],
    approach: Array.isArray(c.approach) ? c.approach : [],
  }
}

export function packageToDb(p) {
  return {
    name: toStr(p.name), name_ar: toStr(p.name_ar),
    price: toPrice(p.price),
    period: toStr(p.period, '/month'), period_ar: toStr(p.period_ar, '/شهر'),
    tag: p.tag || null, tag_ar: p.tag_ar || null,
    features: Array.isArray(p.features) ? p.features : toArray(p.features),
    features_ar: Array.isArray(p.features_ar) ? p.features_ar : toArray(p.features_ar),
    whatsappText: p.whatsappText || null, whatsappText_ar: p.whatsappText_ar || null,
    highlight: toBool(p.highlight),
  }
}

export function transformationToDb(t) {
  return {
    name: toStr(t.name), name_ar: t.name_ar || null,
    result: toStr(t.result), result_ar: t.result_ar || null,
    goal: t.goal || null, goal_ar: t.goal_ar || null,
    image: t.image || null, text: t.text || null, text_ar: t.text_ar || null,
  }
}

export function testimonialToDb(t) {
  return {
    name: toStr(t.name), name_ar: t.name_ar || null,
    role: toStr(t.role, 'Client'), role_ar: toStr(t.role_ar, 'عميل'),
    avatar: toStr(t.avatar, 'https://i.pravatar.cc/100?img=11'),
    text: toStr(t.text), text_ar: toStr(t.text_ar),
  }
}

export function serviceToDb(s) {
  return {
    title: toStr(s.title), title_ar: toStr(s.title_ar),
    desc: toStr(s.desc), desc_ar: toStr(s.desc_ar),
    icon: toStr(s.icon, 'flame'),
  }
}

export function supplementToDb(s) {
  return {
    name: toStr(s.name), name_ar: toStr(s.name_ar),
    price: toPrice(s.price),
    category: toStr(s.category), category_ar: toStr(s.category_ar),
    description: toStr(s.description), description_ar: toStr(s.description_ar),
    image: toStr(s.image),
  }
}
