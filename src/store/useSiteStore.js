import { create } from 'zustand'
import siteDefaults from '../data/site.json'
import { supabase, isSupabaseConfigured } from '../utils/supabase'

const STORAGE_KEY = 'elsum-site-v3'
const FILE_API = '/api/site' // dev-only file API (vite.config) — kept as offline fallback

/* ------------------------------------------------------------------ */
/* Normalizers: DB rows -> UI shape (tolerant of old + new schemas)    */
/* ------------------------------------------------------------------ */

function toArray(v, fallback = []) {
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
    // newline- or comma-separated plain text
    if (t.includes('\n')) return t.split('\n').map((x) => x.trim()).filter(Boolean)
    if (t.includes('|')) return t.split('|').map((x) => x.trim()).filter(Boolean)
    return [t]
  }
  return fallback
}

const toStr = (v, fb = '') => (v == null ? fb : String(v))
const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1'
const toPrice = (v) => (v == null || v === '' ? '' : String(v)) // TEXT in new schema, numeric in old

function normCoach(r) {
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

function normPackage(r) {
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

function normTransformation(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    result: toStr(r.result), result_ar: toStr(r.result_ar),
    goal: toStr(r.goal), goal_ar: toStr(r.goal_ar),
    image: r.image ?? '', text: r.text ?? '', text_ar: r.text_ar ?? '',
  }
}

function normTestimonial(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    role: toStr(r.role, 'Client'), role_ar: toStr(r.role_ar, 'عميل'),
    avatar: toStr(r.avatar, 'https://i.pravatar.cc/100?img=11'),
    text: toStr(r.text), text_ar: toStr(r.text_ar),
  }
}

function normService(r, idx = 0) {
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

function normSupplement(r) {
  return {
    id: r.id,
    name: toStr(r.name), name_ar: toStr(r.name_ar),
    price: toPrice(r.price),
    category: toStr(r.category), category_ar: toStr(r.category_ar),
    description: toStr(r.description), description_ar: toStr(r.description_ar),
    image: toStr(r.image),
  }
}

/* ------------------------------------------------------------------ */
/* DB mappers: UI objects -> insert/update payloads (no id/created_at) */
/* ------------------------------------------------------------------ */

function coachToDb(c) {
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

function packageToDb(p) {
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

function transformationToDb(t) {
  return {
    name: toStr(t.name), name_ar: t.name_ar || null,
    result: toStr(t.result), result_ar: t.result_ar || null,
    goal: t.goal || null, goal_ar: t.goal_ar || null,
    image: t.image || null, text: t.text || null, text_ar: t.text_ar || null,
  }
}

function testimonialToDb(t) {
  return {
    name: toStr(t.name), name_ar: t.name_ar || null,
    role: toStr(t.role, 'Client'), role_ar: toStr(t.role_ar, 'عميل'),
    avatar: toStr(t.avatar, 'https://i.pravatar.cc/100?img=11'),
    text: toStr(t.text), text_ar: toStr(t.text_ar),
  }
}

function serviceToDb(s) {
  return {
    title: toStr(s.title), title_ar: toStr(s.title_ar),
    desc: toStr(s.desc), desc_ar: toStr(s.desc_ar),
    icon: toStr(s.icon, 'flame'),
  }
}

function supplementToDb(s) {
  return {
    name: toStr(s.name), name_ar: toStr(s.name_ar),
    price: toPrice(s.price),
    category: toStr(s.category), category_ar: toStr(s.category_ar),
    description: toStr(s.description), description_ar: toStr(s.description_ar),
    image: toStr(s.image),
  }
}

/* ------------------------------------------------------------------ */
/* Local cache helpers                                                 */
/* ------------------------------------------------------------------ */

function loadCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.coach) return null
    return {
      coach: { ...siteDefaults.coach, ...(parsed.coach || {}) },
      packages: Array.isArray(parsed.packages) ? parsed.packages : siteDefaults.packages,
      transformations: Array.isArray(parsed.transformations) ? parsed.transformations : siteDefaults.transformations,
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : siteDefaults.testimonials,
      services: Array.isArray(parsed.services) ? parsed.services : siteDefaults.services,
      supplements: Array.isArray(parsed.supplements) ? parsed.supplements : siteDefaults.supplements,
    }
  } catch {
    return null
  }
}

function snapshot(state) {
  const { coach, packages, transformations, testimonials, services, supplements } = state
  return { coach, packages, transformations, testimonials, services, supplements }
}

function persistLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot(state)))
  } catch { /* ignore */ }
}

const initial = loadCached() || siteDefaults
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`

/* ------------------------------------------------------------------ */
/* Store — Supabase is the source of truth, cache is the fallback      */
/* ------------------------------------------------------------------ */

export const useSiteStore = create((set, get) => {
  // Local-only mutation + cache (used when Supabase is down, then synced)
  const setLocal = (patch) => {
    set(patch)
    persistLocal(get())
    get().saveToFile().catch(() => {})
  }

  async function dbInsert(table, payload, norm) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.from(table).insert(payload).select().single()
    if (error) throw new Error(`${table} insert: ${error.message}`)
    return norm(data)
  }

  async function dbUpdate(table, id, payload) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
    // numeric ids -> DB row; string ids (local-only) -> cannot update remotely
    if (typeof id === 'string' || id == null) return null
    const { error } = await supabase.from(table).update(payload).eq('id', id)
    if (error) throw new Error(`${table} update: ${error.message}`)
    return true
  }

  async function dbDelete(table, id) {
    if (!isSupabaseConfigured || !supabase) return
    if (typeof id === 'string' || id == null) return // local-only row, nothing remote
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw new Error(`${table} delete: ${error.message}`)
  }

  return {
    ...initial,

    // ---- connection state ----
    // supabaseStatus: 'checking' | 'connected' | 'empty' | 'unavailable'
    supabaseStatus: isSupabaseConfigured ? 'checking' : 'unavailable',
    supabaseError: isSupabaseConfigured ? null : 'Missing VITE_SUPABASE_URL / KEY in .env',
    loading: false,
    lastSync: null,

    // Back-compat aliases for the admin FileStatus component
    fileBackend: isSupabaseConfigured ? 'checking' : 'unavailable',
    lastFileSave: null,
    fileError: isSupabaseConfigured ? null : 'Missing Supabase env',

    /**
     * Fetch everything from Supabase. Falls back to cache/bundled JSON.
     * Called once on boot; call again from admin "Refresh" if needed.
     */
    refresh: async () => {
      if (!isSupabaseConfigured || !supabase) {
        set({ supabaseStatus: 'unavailable', fileBackend: 'unavailable', loading: false })
        return false
      }
      set({ loading: true })
      try {
        const [coachRes, pkgRes, resRes, tesRes, srvRes, supRes] = await Promise.all([
          supabase.from('coach').select('*').order('id', { ascending: true }).limit(1).maybeSingle(),
          supabase.from('packages').select('*').order('created_at', { ascending: true }),
          supabase.from('transformations').select('*').order('created_at', { ascending: true }),
          supabase.from('testimonials').select('*').order('created_at', { ascending: true }),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('supplements').select('*').order('created_at', { ascending: true }),
        ])

        // Missing table = user hasn't run supabase.sql yet
        const missing = [coachRes, pkgRes, resRes, tesRes, srvRes, supRes].find(
          (r) => r.error && (r.error.code === 'PGRST205' || /schema cache/i.test(r.error.message))
        )
        if (missing) {
          throw new Error(
            `Table missing (${missing.error.message}). Run supabase.sql in Supabase SQL Editor, then npm run seed.`
          )
        }
        for (const r of [coachRes, pkgRes, tesRes, srvRes, supRes]) {
          if (r.error) throw new Error(r.error.message)
        }
        // transformations is new — tolerate its absence on old DBs until migration runs
        let transformations = []
        if (resRes.error) {
          console.warn('[site] transformations table missing — run supabase.sql. Using local data.')
          transformations = get().transformations
        } else {
          transformations = (resRes.data || []).map(normTransformation)
        }

        const allEmpty =
          !coachRes.data &&
          (pkgRes.data || []).length === 0 &&
          (tesRes.data || []).length === 0 &&
          (srvRes.data || []).length === 0 &&
          (supRes.data || []).length === 0

        if (allEmpty) {
          // DB connected but not seeded — keep local content visible, flag it
          set({
            supabaseStatus: 'empty',
            fileBackend: 'connected',
            supabaseError: 'Supabase is connected but empty — run: npm run seed',
            lastSync: new Date().toLocaleTimeString(),
            loading: false,
          })
          return false
        }

        const next = {
          coach: coachRes.data ? normCoach(coachRes.data) : get().coach,
          packages: (pkgRes.data || []).map(normPackage),
          transformations,
          testimonials: (tesRes.data || []).map(normTestimonial),
          services: (srvRes.data || []).map(normService).filter(Boolean),
          supplements: (supRes.data || []).map(normSupplement),
          supabaseStatus: 'connected',
          fileBackend: 'connected',
          supabaseError: null,
          fileError: null,
          lastSync: new Date().toLocaleTimeString(),
          loading: false,
        }
        // Don't blank out a section just because its table is momentarily empty
        // while other tables have data (prevents flash-of-empty on partial seeds).
        const prev = get()
        if (next.packages.length === 0 && prev.packages.length) next.packages = prev.packages
        if (next.transformations.length === 0 && prev.transformations.length) next.transformations = prev.transformations
        if (next.testimonials.length === 0 && prev.testimonials.length) next.testimonials = prev.testimonials
        if (next.services.length === 0 && prev.services.length) next.services = prev.services
        if (next.supplements.length === 0 && prev.supplements.length) next.supplements = prev.supplements
        set(next)
        persistLocal(get())
        return true
      } catch (e) {
        const msg = String((e && e.message) || e)
        console.warn('[site] Supabase refresh failed, using cache:', msg)
        set({
          supabaseStatus: 'unavailable',
          fileBackend: 'unavailable',
          supabaseError: msg,
          fileError: msg,
          loading: false,
        })
        return false
      }
    },

    // Legacy name — now just re-exports refresh() (+ dev file fallback)
    syncFromFile: async () => {
      const ok = await get().refresh()
      if (ok) return true
      try {
        const res = await fetch(FILE_API)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const obj = await res.json()
        if (obj && obj.coach && Array.isArray(obj.packages)) {
          set({
            coach: { ...siteDefaults.coach, ...obj.coach },
            packages: obj.packages || [],
            transformations: obj.transformations || [],
            testimonials: obj.testimonials || [],
            services: obj.services || [],
            supplements: obj.supplements || [],
          })
          persistLocal(get())
          return true
        }
      } catch { /* ignore — cache already loaded */ }
      return ok
    },

    saveToFile: async () => {
      // Supabase is the backend now; the dev file API is a best-effort extra.
      try {
        const res = await fetch(FILE_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(snapshot(get())),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        set({ lastFileSave: new Date().toLocaleTimeString() })
        return true
      } catch {
        return false
      }
    },

    /* ---------------- coach ---------------- */
    updateCoach: async (patch) => {
      const prev = get().coach
      set((s) => ({ coach: { ...s.coach, ...patch } }))
      persistLocal(get())
      try {
        if (isSupabaseConfigured && supabase && prev.id != null && typeof prev.id !== 'string') {
          const { error } = await supabase.from('coach').update(coachToDb(get().coach)).eq('id', prev.id)
          if (error) throw new Error(error.message)
        } else if (isSupabaseConfigured && supabase && prev.id == null) {
          const { data, error } = await supabase.from('coach').insert(coachToDb(get().coach)).select().single()
          if (error) throw new Error(error.message)
          set((s) => ({ coach: { ...s.coach, id: data.id } }))
          persistLocal(get())
        }
        set({ supabaseError: null, lastSync: new Date().toLocaleTimeString() })
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
      get().saveToFile().catch(() => {})
    },

    updateCoachArray: async (key, value) => {
      const arrV = Array.isArray(value) ? value : String(value).split(',').map((x) => x.trim()).filter(Boolean)
      await get().updateCoach({ [key]: arrV })
    },

    /* ---------------- generic ---------------- */
    _setList: (key, list) => setLocal({ [key]: list }),

    /* ---------------- packages ---------------- */
    addPackage: async (pkg) => {
      const payload = packageToDb({ highlight: false, features: [], ...pkg })
      try {
        const row = await dbInsert('packages', payload, normPackage)
        setLocal({ packages: [...get().packages, row] })
        return row
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
        const fallback = { id: uid('pkg'), highlight: false, features: [], ...pkg }
        setLocal({ packages: [...get().packages, fallback] })
        return fallback
      }
    },
    updatePackage: async (id, patch) => {
      setLocal({ packages: get().packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
      try {
        const current = get().packages.find((p) => p.id === id)
        if (current) await dbUpdate('packages', id, packageToDb(current))
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
    deletePackage: async (id) => {
      setLocal({ packages: get().packages.filter((p) => p.id !== id) })
      try { await dbDelete('packages', id) } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },

    /* ---------------- transformations / results ---------------- */
    addResult: async (r) => {
      try {
        const row = await dbInsert('transformations', transformationToDb(r), normTransformation)
        setLocal({ transformations: [...get().transformations, row] })
        return row
      } catch (e) {
        // table may not exist on old DBs — keep local so the UI still works
        set({ supabaseError: String((e && e.message) || e) })
        const fallback = { id: uid('res'), ...r }
        setLocal({ transformations: [...get().transformations, fallback] })
        return fallback
      }
    },
    updateResult: async (id, patch) => {
      setLocal({ transformations: get().transformations.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
      try {
        const current = get().transformations.find((r) => r.id === id)
        if (current) await dbUpdate('transformations', id, transformationToDb(current))
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
    deleteResult: async (id) => {
      setLocal({ transformations: get().transformations.filter((r) => r.id !== id) })
      try { await dbDelete('transformations', id) } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },

    /* ---------------- testimonials ---------------- */
    addTestimonial: async (t) => {
      try {
        const row = await dbInsert('testimonials', testimonialToDb(t), normTestimonial)
        setLocal({ testimonials: [...get().testimonials, row] })
        return row
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
        const fallback = { id: uid('tes'), ...t }
        setLocal({ testimonials: [...get().testimonials, fallback] })
        return fallback
      }
    },
    updateTestimonial: async (id, patch) => {
      setLocal({ testimonials: get().testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
      try {
        const current = get().testimonials.find((t) => t.id === id)
        if (current) await dbUpdate('testimonials', id, testimonialToDb(current))
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
    deleteTestimonial: async (id) => {
      setLocal({ testimonials: get().testimonials.filter((t) => t.id !== id) })
      try { await dbDelete('testimonials', id) } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },

    /* ---------------- services (index API kept, id-aware) ---------------- */
    _resolveServiceId: (idxOrId) => {
      const list = get().services
      if (typeof idxOrId === 'number' && list[idxOrId] && (typeof list[idxOrId].id === 'number')) {
        return list[idxOrId].id
      }
      if (typeof idxOrId === 'number' && list[idxOrId] && String(list[idxOrId].id || '').startsWith('local-')) {
        return list[idxOrId].id
      }
      return idxOrId
    },
    addService: async (s) => {
      try {
        const row = await dbInsert('services', serviceToDb(s), (d) => normService(d))
        setLocal({ services: [...get().services, row] })
        return row
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
        const fallback = { id: uid('srv'), ...s }
        setLocal({ services: [...get().services, fallback] })
        return fallback
      }
    },
    updateService: async (idx, patch) => {
      const list = get().services
      const target = typeof idx === 'number' ? list[idx] : list.find((s) => s.id === idx)
      const id = target?.id
      setLocal({
        services: list.map((s, i) => (typeof idx === 'number' ? (i === idx ? { ...s, ...patch } : s) : (s.id === idx ? { ...s, ...patch } : s))),
      })
      try {
        const current = typeof idx === 'number' ? get().services[idx] : get().services.find((s) => s.id === idx)
        if (current) await dbUpdate('services', typeof id === 'number' ? id : current.id, serviceToDb(current))
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
    deleteService: async (idx) => {
      const list = get().services
      const target = typeof idx === 'number' ? list[idx] : list.find((s) => s.id === idx)
      setLocal({
        services: typeof idx === 'number' ? list.filter((_, i) => i !== idx) : list.filter((s) => s.id !== idx),
      })
      try {
        if (target) await dbDelete('services', target.id)
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },

    /* ---------------- supplements ---------------- */
    setSupplements: async (list) => {
      // bulk replace (Excel upload): insert new rows first, prune the rest.
      // If the insert fails the old rows are untouched — an upload can
      // never leave the table at 0.
      const clean = list.map((s) => ({ id: s.id ?? uid('sup'), ...s }))
      const before = get().supplements
      setLocal({ supplements: clean })
      if (!isSupabaseConfigured || !supabase) return { ok: true, failures: [] }
      try {
        if (clean.length) {
          const { data, error } = await supabase.from('supplements').insert(clean.map(supplementToDb)).select()
          if (error) throw new Error(error.message)
          const newIds = (data || []).map((d) => d.id)
          const { data: existing, error: e2 } = await supabase.from('supplements').select('id')
          if (e2) throw new Error(e2.message)
          const stale = (existing || []).map((r) => r.id).filter((id) => !newIds.includes(id))
          if (stale.length) {
            const { error: e3 } = await supabase.from('supplements').delete().in('id', stale)
            if (e3) throw new Error(e3.message)
          }
          setLocal({ supplements: (data || []).map(normSupplement) })
        } else {
          const { error } = await supabase.from('supplements').delete().neq('id', 0)
          if (error) throw new Error(error.message)
        }
        set({ supabaseError: null })
        return { ok: true, failures: [] }
      } catch (e) {
        setLocal({ supplements: before })
        const msg = `supplements: ${String((e && e.message) || e)}`
        set({ supabaseError: msg })
        return { ok: false, failures: [msg] }
      }
    },
    addSupplement: async (s) => {
      try {
        const row = await dbInsert('supplements', supplementToDb(s), normSupplement)
        setLocal({ supplements: [...get().supplements, row] })
        return row
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
        const fallback = { id: uid('sup'), ...s }
        setLocal({ supplements: [...get().supplements, fallback] })
        return fallback
      }
    },
    updateSupplement: async (id, patch) => {
      setLocal({ supplements: get().supplements.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
      try {
        const current = get().supplements.find((s) => s.id === id)
        if (current) await dbUpdate('supplements', id, supplementToDb(current))
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
    deleteSupplement: async (id) => {
      setLocal({ supplements: get().supplements.filter((s) => s.id !== id) })
      try { await dbDelete('supplements', id) } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },

    /* ---------------- import / export / reset ---------------- */
    exportJSON: () => JSON.stringify(snapshot(get()), null, 2),

    importJSON: async (obj) => {
      const next = {
        coach: obj.coach || siteDefaults.coach,
        packages: obj.packages || [],
        transformations: obj.transformations || [],
        testimonials: obj.testimonials || [],
        services: obj.services || [],
        supplements: obj.supplements || [],
      }
      const before = snapshot(get())
      setLocal(next)
      // push everything to Supabase (best effort, keeps working offline)
      if (!isSupabaseConfigured || !supabase) return { ok: true, failures: [] }
      const failures = []
      // Insert-first, prune-stale-second: if an insert fails the old rows
      // are still in the table, so an upload can never zero out data.
      // A failed table is rolled back locally to the pre-import copy.
      const syncTable = async (table, rows, toDb) => {
        try {
          if (rows.length) {
            const { data, error } = await supabase.from(table).insert(rows.map(toDb)).select()
            if (error) throw new Error(error.message)
            const newIds = (data || []).map((d) => d.id)
            const { data: existing, error: e2 } = await supabase.from(table).select('id')
            if (e2) throw new Error(e2.message)
            const stale = (existing || []).map((r) => r.id).filter((id) => !newIds.includes(id))
            if (stale.length) {
              const { error: e3 } = await supabase.from(table).delete().in('id', stale)
              if (e3) throw new Error(e3.message)
            }
          } else {
            // explicit empty list = intentional clear
            const { error } = await supabase.from(table).delete().neq('id', 0)
            if (error) throw new Error(error.message)
          }
        } catch (e) {
          failures.push(`${table}: ${String((e && e.message) || e)}`)
          setLocal({ [table]: before[table] })
        }
      }
      await syncTable('packages', next.packages, packageToDb)
      await syncTable('transformations', next.transformations, transformationToDb)
      await syncTable('testimonials', next.testimonials, testimonialToDb)
      await syncTable('services', next.services, serviceToDb)
      await syncTable('supplements', next.supplements, supplementToDb)
      try {
        const prev = get().coach
        if (prev?.id != null && typeof prev.id !== 'string') {
          const { error } = await supabase.from('coach').update(coachToDb(next.coach)).eq('id', prev.id)
          if (error) throw new Error(`coach: ${error.message}`)
        }
      } catch (e) {
        failures.push(String((e && e.message) || e))
        setLocal({ coach: before.coach })
      }
      await get().refresh()
      if (failures.length) set({ supabaseError: failures.join(' • ') })
      else set({ supabaseError: null })
      return { ok: failures.length === 0, failures }
    },

    resetAll: async () => {
      setLocal({ ...siteDefaults })
      if (!isSupabaseConfigured || !supabase) return
      try {
        await get().importJSON(siteDefaults)
      } catch (e) {
        set({ supabaseError: String((e && e.message) || e) })
      }
    },
  }
})

// On boot: Supabase first, dev-file/cache as fallback.
if (typeof window !== 'undefined') {
  useSiteStore.getState().refresh()
}
