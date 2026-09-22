import { create } from 'zustand'

function applyPrefs(theme, lang) {
  try {
    const root = document.documentElement
    // theme
    const light = theme === 'light'
    root.classList.toggle('dark', !light)
    root.dataset.theme = theme
    root.style.colorScheme = light ? 'light' : 'dark'
    // lang / dir
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
  } catch { /* ssr-safe */ }
}

function initial() {
  let theme = 'dark'
  let lang = 'en'
  try {
    theme = localStorage.getItem('elsum-theme') || 'dark'
    lang = localStorage.getItem('elsum-lang') || 'en'
  } catch { /* ignore */ }
  if (!['dark', 'light'].includes(theme)) theme = 'dark'
  if (!['en', 'ar'].includes(lang)) lang = 'en'
  // apply ASAP (also called from main.jsx on boot)
  applyPrefs(theme, lang)
  return { theme, lang }
}

export const usePrefsStore = create((set, get) => ({
  ...initial(),

  setTheme: (theme) => {
    try { localStorage.setItem('elsum-theme', theme) } catch { /* ignore */ }
    applyPrefs(theme, get().lang)
    set({ theme })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  setLang: (lang) => {
    try { localStorage.setItem('elsum-lang', lang) } catch { /* ignore */ }
    applyPrefs(get().theme, lang)
    set({ lang })
  },
  toggleLang: () => {
    const next = get().lang === 'en' ? 'ar' : 'en'
    get().setLang(next)
  },
}))

export function applyStoredPrefs() {
  try {
    const theme = localStorage.getItem('elsum-theme') || 'dark'
    const lang = localStorage.getItem('elsum-lang') || 'en'
    applyPrefs(theme, lang)
  } catch { applyPrefs('dark', 'en') }
}
