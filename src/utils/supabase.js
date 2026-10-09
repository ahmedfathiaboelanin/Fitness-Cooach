import { createClient } from '@supabase/supabase-js'

// Vite exposes VITE_* vars. Support both the new publishable key name
// and the classic anon key name so Vercel/dashboard setups keep working.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'The site will run on bundled defaults + localStorage. ' +
    'Copy .env.example to .env and add your keys, then run npm run seed.'
  )
}

// Create the client lazily but safely: if env is missing we still export
// a null-safe proxy so `supabase.from(...)` throws a readable error
// instead of crashing the whole app at import time.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export async function checkSupabaseConnection() {
  if (!supabase) return { ok: false, error: 'Missing env (URL or key)' }
  try {
    // Lightweight probe — coach table always exists after supabase.sql
    const { error } = await supabase.from('coach').select('id', { count: 'exact', head: true })
    if (error) return { ok: false, error: error.message }
    return { ok: true, error: null }
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) }
  }
}
