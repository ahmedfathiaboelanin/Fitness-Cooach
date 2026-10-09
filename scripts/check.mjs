/**
 * npm run seed:check — verifies Supabase connection + schema + row counts.
 * Read-only, safe to run anytime.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(ROOT, file)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m || process.env[m[1]]) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      process.env[m[1]] = v
    }
  }
}
loadEnv()

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

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
console.log('\n✅ Connection OK')
