/**
 * Pure Excel/JSON parsing + building helpers (NO browser or store imports).
 * Safe to unit-test in Node: `node scripts/test-sheets.mjs`.
 * Browser/store-backed ops live in ./adminIO.js (which re-exports this file).
 */
import * as XLSX from 'xlsx'

export const SUPP_COLS = {
  name: ['name', 'الاسم', 'product', 'المنتج'],
  name_ar: ['name_ar', 'الاسم بالعربية'],
  price: ['price', 'السعر'],
  category: ['category', 'الفئة', 'القسم'],
  category_ar: ['category_ar', 'الفئة بالعربية'],
  description: ['description', 'الوصف'],
  description_ar: ['description_ar', 'الوصف بالعربية'],
  image: ['image', 'img', 'صورة', 'رابط الصورة'],
}

export function rowGet(row, keys) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== '') return String(row[k]).trim()
  }
  return ''
}

export function splitList(v) {
  const lines = String(v ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
  if (lines.length <= 1 && String(v ?? '').includes('|')) {
    return String(v).split('|').map((x) => x.trim()).filter(Boolean)
  }
  return lines
}

export function truthy(v) {
  return ['true', '1', 'yes', 'y', '✓'].includes(String(v ?? '').trim().toLowerCase())
}

/** Which workbook sheet belongs to which collection (EN + AR names). */
export function matchSheet(name) {
  const n = String(name).toLowerCase()
  if (/coach|المدرب|المحتوى|content/.test(n)) return 'coach'
  if (/package|باق/.test(n)) return 'packages'
  if (/transformation|result|نتيج|تحول/.test(n)) return 'transformations'
  if (/testimonial|review|رأي|اراء|تقييم/.test(n)) return 'testimonials'
  if (/service|خدم/.test(n)) return 'services'
  if (/supplement|مكمل/.test(n)) return 'supplements'
  return null
}

/** Lowercase + trim every header so EN/AR/case variants all match. */
export function normRows(ws) {
  return XLSX.utils.sheet_to_json(ws, { defval: '' }).map((r) => {
    const o = {}
    Object.entries(r).forEach(([k, v]) => { o[String(k).trim().toLowerCase()] = v })
    return o
  })
}

/* ---------------- row builders (sheet rows -> store objects) ---------------- */

let seq = 0
const stamp = () => `${Date.now().toString(36)}-${seq++}`

export function buildPackages(rows) {
  const pick = (r, ...ks) => rowGet(r, ks)
  return rows.map((r) => ({
    id: `pkg-xls-${stamp()}`,
    name: pick(r, ...SUPP_COLS.name),
    name_ar: pick(r, 'name_ar', 'الاسم بالعربية'),
    price: pick(r, ...SUPP_COLS.price),
    period: pick(r, 'period', 'period_en', '/month', 'لكل') || '/month',
    period_ar: pick(r, 'period_ar', 'لكل بالعربية') || '/شهر',
    tag: pick(r, 'tag', 'الوسم'),
    tag_ar: pick(r, 'tag_ar', 'الوسم بالعربية'),
    features: splitList(pick(r, 'features', 'المميزات')),
    features_ar: splitList(pick(r, 'features_ar', 'المميزات بالعربية')),
    whatsappText: pick(r, 'whatsapptext', 'whatsapp_text', 'واتساب'),
    whatsappText_ar: pick(r, 'whatsapptext_ar', 'واتساب بالعربية'),
    highlight: truthy(pick(r, 'highlight', 'مميز')),
  })).filter((x) => x.name)
}

export function buildTransformations(rows) {
  const pick = (r, ...ks) => rowGet(r, ks)
  return rows.map((r) => ({
    id: `res-xls-${stamp()}`,
    name: pick(r, ...SUPP_COLS.name),
    name_ar: pick(r, 'name_ar', 'الاسم بالعربية'),
    result: pick(r, 'result', 'النتيجة'),
    result_ar: pick(r, 'result_ar', 'النتيجة بالعربية'),
    goal: pick(r, 'goal', 'الهدف'),
    goal_ar: pick(r, 'goal_ar', 'الهدف بالعربية'),
    image: pick(r, ...SUPP_COLS.image),
    text: pick(r, 'text', 'الوصف'),
    text_ar: pick(r, 'text_ar', 'الوصف بالعربية'),
  })).filter((x) => x.name)
}

export function buildTestimonials(rows) {
  const pick = (r, ...ks) => rowGet(r, ks)
  return rows.map((r) => ({
    id: `tes-xls-${stamp()}`,
    name: pick(r, ...SUPP_COLS.name),
    name_ar: pick(r, 'name_ar', 'الاسم بالعربية'),
    role: pick(r, 'role', 'الدور') || 'Client',
    role_ar: pick(r, 'role_ar', 'الدور بالعربية') || 'عميل',
    avatar: pick(r, 'avatar', 'الصورة') || 'https://i.pravatar.cc/100?img=11',
    text: pick(r, 'text', 'النص'),
    text_ar: pick(r, 'text_ar', 'النص بالعربية'),
  })).filter((x) => x.name && (x.text || x.text_ar))
}

export function buildServices(rows) {
  const pick = (r, ...ks) => rowGet(r, ks)
  return rows.map((r) => ({
    title: pick(r, 'title', 'العنوان'),
    title_ar: pick(r, 'title_ar', 'العنوان بالعربية'),
    desc: pick(r, 'desc', 'description', 'الوصف'),
    desc_ar: pick(r, 'desc_ar', 'description_ar', 'الوصف بالعربية'),
    icon: pick(r, 'icon', 'الأيقونة') || 'flame',
  })).filter((x) => x.title)
}

export function buildSupplements(rows) {
  const pick = (r, ...ks) => rowGet(r, ks)
  return rows.map((r) => ({
    id: `sup-xls-${stamp()}`,
    name: pick(r, ...SUPP_COLS.name),
    name_ar: pick(r, 'name_ar', 'الاسم بالعربية'),
    price: pick(r, ...SUPP_COLS.price),
    category: pick(r, ...SUPP_COLS.category),
    category_ar: pick(r, 'category_ar', 'الفئة بالعربية'),
    description: pick(r, 'description', 'الوصف'),
    description_ar: pick(r, 'description_ar', 'الوصف بالعربية'),
    image: pick(r, ...SUPP_COLS.image),
  })).filter((x) => x.name)
}

/* ---------------- export-row mappers (store objects -> sheet rows) ---------------- */

export const toSheetRow = {
  packages: (p) => ({
    name: p.name, name_ar: p.name_ar, price: p.price,
    period: p.period, period_ar: p.period_ar,
    tag: p.tag, tag_ar: p.tag_ar,
    features: (p.features || []).join('\n'),
    features_ar: (p.features_ar || []).join('\n'),
    whatsappText: p.whatsappText, whatsappText_ar: p.whatsappText_ar,
    highlight: p.highlight ? 'yes' : '',
  }),
  transformations: (r) => ({
    name: r.name, name_ar: r.name_ar, result: r.result, result_ar: r.result_ar,
    goal: r.goal, goal_ar: r.goal_ar, image: r.image, text: r.text, text_ar: r.text_ar,
  }),
  testimonials: (t) => ({
    name: t.name, name_ar: t.name_ar, role: t.role, role_ar: t.role_ar,
    avatar: t.avatar, text: t.text, text_ar: t.text_ar,
  }),
  services: (x) => ({
    title: x.title, title_ar: x.title_ar, desc: x.desc, desc_ar: x.desc_ar, icon: x.icon,
  }),
  supplements: (x) => ({
    name: x.name, name_ar: x.name_ar, price: x.price,
    category: x.category, category_ar: x.category_ar,
    description: x.description, description_ar: x.description_ar, image: x.image,
  }),
}

export const builders = {
  packages: buildPackages,
  transformations: buildTransformations,
  testimonials: buildTestimonials,
  services: buildServices,
  supplements: buildSupplements,
}

export const sheetNames = {
  packages: 'Packages',
  transformations: 'Results',
  testimonials: 'Testimonials',
  services: 'Services',
  supplements: 'Supplements',
}

/* ---------------- coach sheet ---------------- */

export function coachToSheetRow(c) {
  return {
    name: c.name, name_ar: c.name_ar, firstName: c.firstName, firstName_ar: c.firstName_ar,
    title: c.title, title_ar: c.title_ar, tagline: c.tagline, tagline_ar: c.tagline_ar,
    location: c.location, location_ar: c.location_ar,
    avatar: c.avatar, cover: c.cover, bio: c.bio, bio_ar: c.bio_ar,
    whatsappNumber: c.whatsappNumber, whatsappDisplay: c.whatsappDisplay,
    stats: JSON.stringify(c.stats || []),
    certifications: (c.certifications || []).join(' | '),
    certifications_ar: (c.certifications_ar || []).join(' | '),
    specializations: (c.specializations || []).join(' | '),
    specializations_ar: (c.specializations_ar || []).join(' | '),
    approach: JSON.stringify(c.approach || []),
  }
}

export function sheetRowToCoach(r) {
  const pick = (row, ...ks) => rowGet(row, ks)
  const parseArr = (v, sep = '|') => {
    const t = String(v ?? '').trim()
    if (!t) return []
    if (t.startsWith('[')) {
      try {
        const p = JSON.parse(t)
        if (Array.isArray(p)) return p
      } catch { /* fall through */ }
    }
    return t.split(sep).map((x) => x.trim()).filter(Boolean)
  }
  const parseObjs = (v) => {
    const t = String(v ?? '').trim()
    if (!t) return []
    try {
      const p = JSON.parse(t)
      if (Array.isArray(p)) return p
    } catch { /* ignore */ }
    return []
  }
  return {
    name: pick(r, 'name', 'الاسم'),
    name_ar: pick(r, 'name_ar', 'الاسم بالعربية'),
    firstName: pick(r, 'firstname', 'first_name'),
    firstName_ar: pick(r, 'firstname_ar', 'first_name_ar'),
    title: pick(r, 'title', 'العنوان'),
    title_ar: pick(r, 'title_ar', 'العنوان بالعربية'),
    tagline: pick(r, 'tagline'),
    tagline_ar: pick(r, 'tagline_ar'),
    location: pick(r, 'location', 'الموقع'),
    location_ar: pick(r, 'location_ar', 'الموقع بالعربية'),
    avatar: pick(r, 'avatar', 'الصورة'),
    cover: pick(r, 'cover', 'الغلاف'),
    bio: pick(r, 'bio'),
    bio_ar: pick(r, 'bio_ar'),
    whatsappNumber: pick(r, 'whatsappnumber', 'whatsapp_number', 'رقم الواتساب'),
    whatsappDisplay: pick(r, 'whatsappdisplay', 'whatsapp_display'),
    stats: parseObjs(pick(r, 'stats')),
    certifications: parseArr(pick(r, 'certifications')),
    certifications_ar: parseArr(pick(r, 'certifications_ar')),
    specializations: parseArr(pick(r, 'specializations')),
    specializations_ar: parseArr(pick(r, 'specializations_ar')),
    approach: parseObjs(pick(r, 'approach')),
  }
}

export function isMeaningfulCoach(c) {
  if (!c || typeof c !== 'object') return false
  return Object.values(c).some((v) => (Array.isArray(v) ? v.length : String(v ?? '').trim()))
}

/* ---------------- full-workbook parser ---------------- */
/**
 * Parse every recognized sheet of an uploaded workbook.
 * A sheet that yields NO valid rows is SKIPPED (reported in `skipped`)
 * — it must never wipe its table. Callers only apply `patch` keys.
 * Returns { patch, notes, skipped, coachPatch, sawCoach }.
 */
export function parseWorkbook(wb) {
  const patch = {}
  const notes = []
  const skipped = []
  let coachPatch = null
  let sawCoach = false
  for (const sn of wb.SheetNames || []) {
    const key = matchSheet(sn)
    if (!key) continue
    const rows = normRows(wb.Sheets[sn])
    if (key === 'coach') {
      sawCoach = true
      if (rows.length) coachPatch = sheetRowToCoach(rows[0])
      continue
    }
    const build = builders[key]
    if (!build) continue
    const items = build(rows)
    if (items.length) {
      patch[key] = items
      notes.push(`${sn}: ${items.length}`)
    } else {
      skipped.push(`${sn}: no valid rows — kept existing`)
    }
  }
  const coachValid = isMeaningfulCoach(coachPatch)
  if (coachValid) notes.push('Coach: profile')
  else if (sawCoach) skipped.push('Coach: no valid fields — kept existing profile')
  return { patch, notes, skipped, coachPatch: coachValid ? coachPatch : null, sawCoach }
}

/** Template row per table for the downloadable starter file. */
export function templateRow(tableKey) {
  switch (tableKey) {
    case 'packages':
      return { name: 'Online Coaching', name_ar: 'التدريب الأونلاين', price: '1500 EGP', period: '/month', period_ar: '/شهر', tag: 'Most Popular', tag_ar: 'الأكثر طلباً', features: 'Custom plan\nWeekly check-in', features_ar: 'خطة مخصصة\nمتابعة أسبوعية', whatsappText: 'Hi! I want to join', whatsappText_ar: 'أهلاً! عايز أشترك', highlight: 'yes' }
    case 'transformations':
      return { name: 'Ahmed — Fat Loss', name_ar: 'أحمد — تخسيس', result: '-14 kg in 16 weeks', result_ar: '-14 كجم في 16 أسبوع', goal: 'Fat Loss', goal_ar: 'تخسيس', image: 'https://...', text: 'Consistency story', text_ar: 'قصة التزام' }
    case 'testimonials':
      return { name: 'Ahmed R.', name_ar: 'أحمد ر.', role: 'Online Client', role_ar: 'عميل أونلاين', avatar: 'https://i.pravatar.cc/100?img=11', text: 'Great coaching!', text_ar: 'تدريب ممتاز!' }
    case 'services':
      return { title: 'Online Coaching', title_ar: 'تدريب أونلاين', desc: 'Train anywhere...', desc_ar: 'اتمرن من أي مكان...', icon: 'laptop' }
    case 'supplements':
      return { name: 'Whey Protein 2kg', name_ar: 'واي بروتين 2 كجم', price: '2400 EGP', category: 'Protein', category_ar: 'بروتين', description: '24g protein per scoop.', description_ar: '24 جم بروتين لكل سكوب.', image: 'https://...' }
    default:
      return {}
  }
}
