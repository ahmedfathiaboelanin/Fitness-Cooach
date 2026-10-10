/**
 * npm run seed:check — verifies Supabase connection + schema + row counts.
 * Read-only, safe to run anytime.
 */
import { createClient } from '@supabase/supabase-js'
import { publicEnv } from './lib/env.mjs'

const { url: URL, key: KEY } = publicEnv()

if (!URL || !KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env')
  process.exit(1)
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } })
console.log('🔌 Checking Supabase:', URL)

let fail = false
for (const t of ['coach', 'packages', 'transformations', 'testimonials', 'services', 'supplements']) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true })
  if (error) {
    fail = true
    console.log(`  ❌ ${t}: ${error.message} (${error.code || 'no code'})`)
  } else {
    const flag = count === 0 ? '⚠️ empty — run npm run seed' : `✅ ${count} rows`
    console.log(`  ${flag} — ${t}`)
    if (count === 0 && t !== 'coach') fail = false // empty is a warning, not fatal
  }
}
if (fail) {
  console.log('\n👉 Fix: paste supabase.sql into Supabase Dashboard -> SQL Editor -> Run.')
  process.exit(1)
}

// Admin login readiness (read-only probe with a dummy hash — never a real password)
try {
  const { data, error } = await sb.rpc('verify_admin', {
    p_username: 'admin',
    p_password_hash: '0'.repeat(64),
  })
  if (error) {
    const msg = String(error.message || '').toLowerCase()
    if (error.code === 'PGRST202' || msg.includes('not found') || msg.includes('schema cache')) {
      console.log('  ⚠️ admin login NOT migrated — re-run supabase.sql (verify_admin missing), then log in with admin / elsum123')
    } else {
      console.log(`  ⚠️ admin login check: ${error.message}`)
    }
  } else if (data === false) {
    console.log('  ✅ admin login ready (verify_admin alive)')
  } else {
    console.log('  ⚠️ admin login returned unexpected result — re-check supabase.sql functions')
  }
} catch (e) {
  console.log(`  ⚠️ admin login check skipped (${e.message})`)
}
console.log('\n✅ Connection OK')
