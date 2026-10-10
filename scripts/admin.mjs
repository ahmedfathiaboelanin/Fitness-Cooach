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
import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { serviceEnv } from './lib/env.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    const i = a.indexOf('=')
    return i === -1 ? [a.slice(2), true] : [a.slice(2), a.slice(i + 1)]
  }),
)
const command = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'reset'

const { url: URL, key: SERVICE_KEY } = serviceEnv()

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
