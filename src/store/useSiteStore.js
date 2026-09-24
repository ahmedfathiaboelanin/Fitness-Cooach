import { create } from 'zustand'
import siteDefaults from '../data/site.json'

const STORAGE_KEY = 'elsum-site-v3'
const FILE_API = '/api/site' // served by vite.config dev middleware (`npm run dev` only)

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return siteDefaults
    const parsed = JSON.parse(raw)
    // shallow-merge to survive schema additions
    return {
      coach: { ...siteDefaults.coach, ...(parsed.coach || {}) },
      packages: parsed.packages || siteDefaults.packages,
      transformations: parsed.transformations || siteDefaults.transformations,
      testimonials: parsed.testimonials || siteDefaults.testimonials,
      services: parsed.services || siteDefaults.services,
      supplements: parsed.supplements || siteDefaults.supplements,
    }
  } catch {
    return siteDefaults
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

function validSite(obj) {
  return obj && typeof obj === 'object' && obj.coach && Array.isArray(obj.packages)
}

const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`

export const useSiteStore = create((set, get) => {
  // persist to browser AND to src/data/site.json (dev server file API)
  const persist = (state) => {
    persistLocal(state)
    get().saveToFile()
  }

  return {
    ...loadInitial(),

    // 'checking' | 'connected' | 'unavailable' — is the dev file API reachable?
    fileBackend: 'checking',
    lastFileSave: null,
    fileError: null,

    // Load truth from src/data/site.json via dev server (falls back silently)
    syncFromFile: async () => {
      try {
        const res = await fetch(FILE_API)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const obj = await res.json()
        if (!validSite(obj)) throw new Error('Invalid site data')
        set({
          coach: { ...siteDefaults.coach, ...obj.coach },
          packages: obj.packages || [],
          transformations: obj.transformations || [],
          testimonials: obj.testimonials || [],
          services: obj.services || [],
          supplements: obj.supplements || [],
          fileBackend: 'connected',
          fileError: null,
        })
        persistLocal(get())
        return true
      } catch (e) {
        set({ fileBackend: 'unavailable', fileError: String((e && e.message) || e) })
        return false
      }
    },

    // Write current state into src/data/site.json via dev server
    saveToFile: async () => {
      try {
        const res = await fetch(FILE_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(snapshot(get())),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        set({ fileBackend: 'connected', lastFileSave: new Date().toLocaleTimeString(), fileError: null })
        return true
      } catch (e) {
        // expected on static hosting — browser storage still holds the edits
        set({ fileBackend: 'unavailable', fileError: String((e && e.message) || e) })
        return false
      }
    },

    // ---- coach content ----
    updateCoach: (patch) => {
      set((s) => ({ coach: { ...s.coach, ...patch } }))
      persist(get())
    },
    updateCoachArray: (key, value) => {
      // value as comma-separated string -> array, or array passthrough
      const arr = Array.isArray(value) ? value : String(value).split(',').map((x) => x.trim()).filter(Boolean)
      set((s) => ({ coach: { ...s.coach, [key]: arr } }))
      persist(get())
    },

    // ---- generic CRUD helper ----
    _setList: (key, list) => {
      set({ [key]: list })
      persist(get())
    },

    // packages
    addPackage: (pkg) => {
      const list = [...get().packages, { id: uid('pkg'), highlight: false, features: [], ...pkg }]
      get()._setList('packages', list)
    },
    updatePackage: (id, patch) => {
      get()._setList('packages', get().packages.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    },
    deletePackage: (id) => get()._setList('packages', get().packages.filter((p) => p.id !== id)),

    // transformations / results
    addResult: (r) => {
      const list = [...get().transformations, { id: uid('res'), ...r }]
      get()._setList('transformations', list)
    },
    updateResult: (id, patch) => {
      get()._setList('transformations', get().transformations.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    },
    deleteResult: (id) => get()._setList('transformations', get().transformations.filter((r) => r.id !== id)),

    // testimonials
    addTestimonial: (t) => get()._setList('testimonials', [...get().testimonials, { id: uid('tes'), ...t }]),
    updateTestimonial: (id, patch) => get()._setList('testimonials', get().testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    deleteTestimonial: (id) => get()._setList('testimonials', get().testimonials.filter((t) => t.id !== id)),

    // services
    addService: (s) => get()._setList('services', [...get().services, { ...s }]),
    updateService: (idx, patch) => {
      const list = get().services.map((s, i) => (i === idx ? { ...s, ...patch } : s))
      get()._setList('services', list)
    },
    deleteService: (idx) => get()._setList('services', get().services.filter((_, i) => i !== idx)),

    // supplements (coach shop — bulk-replaced by Excel upload)
    setSupplements: (list) => {
      set({ supplements: list })
      persist(get())
    },
    addSupplement: (s) => get()._setList('supplements', [...get().supplements, { id: uid('sup'), ...s }]),
    updateSupplement: (id, patch) => get()._setList('supplements', get().supplements.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    deleteSupplement: (id) => get()._setList('supplements', get().supplements.filter((s) => s.id !== id)),

    // ---- import / export / reset ----
    exportJSON: () => {
      const { coach, packages, transformations, testimonials, services, supplements } = get()
      return JSON.stringify({ coach, packages, transformations, testimonials, services, supplements }, null, 2)
    },
    importJSON: (obj) => {
      set({
        coach: obj.coach || siteDefaults.coach,
        packages: obj.packages || [],
        transformations: obj.transformations || [],
        testimonials: obj.testimonials || [],
        services: obj.services || [],
        supplements: obj.supplements || [],
      })
      persist(get())
    },
    resetAll: () => {
      set({ ...siteDefaults })
      persist(get())
    },
  }
})

// On boot, prefer the real file when the dev server is running.
// (Static builds have no /api/site → falls back to bundled JSON + browser storage.)
if (typeof window !== 'undefined') {
  useSiteStore.getState().syncFromFile()
}
