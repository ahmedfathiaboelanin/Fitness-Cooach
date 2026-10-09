/**
 * Admin account manager (lockout recovery + first setup).
 *
 *   npm run admin -- reset --username=admin --password=NEW-PASSWORD
 *   npm run admin -- create --username=admin --password=*** --name="Site Admin" --email=admin@example.com
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env (Dashboard -> Project Settings
 * -> API -> service_role). The key bypasses RLS, so NEVER expose it to
 * the browser (no VITE_ prefix) and NEVER commit .env.
 * Passwords are stored as SHA-256 hex — same as the dashboard Security tab.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
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

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    const i = a.indexOf('=')
    return i === -1 ? [a.slice(2), true] : [a.slice(2), a.slice(i + 1)]
  }),
)
const command = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'reset'

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !SERVICE_KEY) {
  console.error('❌ Need VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env')
  console.error('   Get the service-role key from: Supabase Dashboard -> Project Settings -> API.')
  console.error('   (No service key? Reset the password with SQL instead:)')
  console.error("   update users set password = encode(digest('NEW-PASSWORD','sha256'),'hex') where username = 'admin';")
  process.exit(1)
}

const username = String(args.username || 'admin').trim()
const password = String(args.password || '')
if (!username || password.length < 6) {
  console.error('❌ Usage: npm run admin -- reset --username=admin --password=NEW-PASSWORD (min 6 chars)')
  process.exit(1)
}

const sb = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } })
const hash = createHash('sha256').update(password, 'utf8').digest('hex')

if (command === 'create') {
  const { error } = await sb.from('users').upsert(
    {
      name: String(args.name || 'Site Admin'),
      username,
      password: hash,
      email: String(args.email || 'admin@example.com'),
      is_admin: true,
    },
    { onConflict: 'username' },
  )
  if (error) {
    console.error('❌ create failed:', error.message)
    process.exit(1)
  }
  console.log(`✅ admin "${username}" created/updated — log in with the new password.`)
} else {
  const { data, error } = await sb
    .from('users')
    .update({ password: hash })
    .eq('username', username)
    .eq('is_admin', true)
    .select('id')
  if (error) {
    console.error('❌ reset failed:', error.message)
    process.exit(1)
  }
  if (!data?.length) {
    console.error(`❌ no admin user named "${username}". Use: npm run admin -- create --username=${username} --password=***`)
    process.exit(1)
  }
  console.log(`✅ password reset for "${username}" — log in with the new password.`)
}
