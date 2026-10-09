import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../utils/supabase'
import { sha256Hex, passwordError } from '../utils/password'

// Hidden admin route: /elsum-admin (not linked anywhere in the site).
// Credentials live in the Supabase `users` table (see supabase.sql +
// the dashboard Security tab). The values below are ONLY an offline
// fallback for when Supabase is unreachable — they never override a
// definitive answer from the database.
const FALLBACK_USER = 'admin'
const FALLBACK_PASSWORD = 'elsum123'
const SESSION_KEY = 'elsum-admin-auth'
const SESSION_USER = 'elsum-admin-user'

function initialAuth() {
  try {
    return {
      isAdmin: sessionStorage.getItem(SESSION_KEY) === '1',
      adminUser: sessionStorage.getItem(SESSION_USER) || null,
    }
  } catch {
    return { isAdmin: false, adminUser: null }
  }
}

function persistSession(username) {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
    sessionStorage.setItem(SESSION_USER, username)
  } catch { /* ignore */ }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_USER)
  } catch { /* ignore */ }
}

/** The verify/change RPCs don't exist yet → DB predates the migration. */
function rpcMissing(err) {
  const msg = String(err?.message || '').toLowerCase()
  return err?.code === 'PGRST202' || msg.includes('not found') || msg.includes('schema cache')
}

function isNetworkError(err) {
  const msg = String(err?.message || '').toLowerCase()
  return msg.includes('fetch') || msg.includes('network') || msg.includes('load failed')
}

/** Pre-migration DBs still expose the users table directly. */
async function legacyTableLogin(username, hash) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('password')
      .eq('username', username)
      .eq('is_admin', true)
      .limit(1)
    if (error) return error && isNetworkError(error) ? 'unavailable' : false
    if (!data || !data.length) return false
    return data[0].password === hash
  } catch (e) {
    return isNetworkError(e) ? 'unavailable' : false
  }
}

const init = initialAuth()

export const useAdminStore = create((set) => ({
  isAdmin: init.isAdmin,
  adminUser: init.adminUser,
  // 'supabase' | 'legacy' | 'fallback' | null — how the session was earned
  authMethod: init.isAdmin ? 'supabase' : null,
  loginBusy: false,

  login: async (username, password) => {
    const u = String(username || '').trim() || 'admin'
    set({ loginBusy: true })
    try {
      if (isSupabaseConfigured && supabase) {
        let hash
        try {
          hash = await sha256Hex(password)
        } catch (e) {
          return { ok: false, error: String((e && e.message) || e) }
        }
        let rpc
        try {
          rpc = await supabase.rpc('verify_admin', { p_username: u, p_password_hash: hash })
        } catch (e) {
          rpc = { data: null, error: e }
        }
        if (!rpc.error) {
          if (rpc.data === true) {
            persistSession(u)
            set({ isAdmin: true, adminUser: u, authMethod: 'supabase' })
            return { ok: true }
          }
          // Definitive answer from the DB — stop here, no fallback.
          return { ok: false, error: 'Wrong username or password' }
        }
        if (!rpcMissing(rpc.error)) {
          if (isNetworkError(rpc.error)) {
            // Offline: degraded mode with the built-in fallback only.
            if (u === FALLBACK_USER && password === FALLBACK_PASSWORD) {
              persistSession(u)
              set({ isAdmin: true, adminUser: u, authMethod: 'fallback' })
              return { ok: true, offline: true }
            }
            return { ok: false, error: 'Database unreachable — check your connection' }
          }
          return { ok: false, error: `Login service error — ${rpc.error.message}` }
        }
        // No RPC yet (DB predates the migration) → legacy table check.
        const legacy = await legacyTableLogin(u, hash)
        if (legacy === true) {
          console.warn('[admin] logged in via legacy users-table check — run the new supabase.sql migration.')
          persistSession(u)
          set({ isAdmin: true, adminUser: u, authMethod: 'legacy' })
          return { ok: true, legacy: true }
        }
        if (legacy === 'unavailable') {
          if (u === FALLBACK_USER && password === FALLBACK_PASSWORD) {
            persistSession(u)
            set({ isAdmin: true, adminUser: u, authMethod: 'fallback' })
            return { ok: true, offline: true }
          }
          return { ok: false, error: 'Database unreachable — check your connection' }
        }
        return { ok: false, error: 'Wrong username or password' }
      }
      // Supabase not configured at all → offline fallback.
      if (u === FALLBACK_USER && password === FALLBACK_PASSWORD) {
        persistSession(u)
        set({ isAdmin: true, adminUser: u, authMethod: 'fallback' })
        return { ok: true, offline: true }
      }
      return { ok: false, error: 'Wrong username or password' }
    } finally {
      set({ loginBusy: false })
    }
  },

  /**
   * Change the logged-in admin's password (stored hashed in users table).
   * Returns { ok:true } or { ok:false, error }.
   */
  changePassword: async (currentPassword, newPassword) => {
    const username = useAdminStore.getState().adminUser || 'admin'
    const policy = passwordError(newPassword, 6)
    if (policy) return { ok: false, error: policy === 'Password required' ? 'Enter a new password' : `New password: ${policy.toLowerCase()}` }
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: 'Supabase is not connected — password can only be changed online' }
    }
    let oldHash, newHash
    try {
      oldHash = await sha256Hex(currentPassword)
      newHash = await sha256Hex(newPassword)
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) }
    }
    let rpc
    try {
      rpc = await supabase.rpc('change_admin_password', {
        p_username: username,
        p_old_hash: oldHash,
        p_new_hash: newHash,
      })
    } catch (e) {
      rpc = { data: null, error: e }
    }
    if (!rpc.error) {
      if (rpc.data === true) {
        set({ authMethod: 'supabase' })
        return { ok: true }
      }
      return { ok: false, error: 'Current password is wrong' }
    }
    if (!rpcMissing(rpc.error)) {
      return { ok: false, error: `Could not change password — ${rpc.error.message}` }
    }
    // Pre-migration fallback: direct table update (old open RLS policies).
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ password: newHash })
        .eq('username', username)
        .eq('password', oldHash)
        .eq('is_admin', true)
        .select('id')
      if (error) throw new Error(error.message)
      if (!data || !data.length) return { ok: false, error: 'Current password is wrong' }
      console.warn('[admin] password changed via legacy table update — run the new supabase.sql migration.')
      set({ authMethod: 'legacy' })
      return { ok: true, legacy: true }
    } catch (e) {
      return { ok: false, error: `Could not change password — ${String((e && e.message) || e)}` }
    }
  },

  logout: () => {
    clearSession()
    set({ isAdmin: false, adminUser: null, authMethod: null })
  },
}))
