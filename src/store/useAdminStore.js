import { create } from 'zustand'

// Frontend-only admin gate. Change password here.
// Hidden route: /elsum-admin (not linked anywhere in the site).
export const ADMIN_PASSWORD = 'elsum123'
const SESSION_KEY = 'elsum-admin-auth'

function initialAuth() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export const useAdminStore = create((set) => ({
  isAdmin: initialAuth(),
  login: (password) => {
    if (password === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
      set({ isAdmin: true })
      return true
    }
    return false
  },
  logout: () => {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
    set({ isAdmin: false })
  },
}))
