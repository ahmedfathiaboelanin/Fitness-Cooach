/**
 * Supabase seeder — pushes src/data/site.json into your Supabase tables.
 *
 * Usage:
 *   1. Run supabase.sql in Supabase Dashboard -> SQL Editor (once).
 *   2. Make sure .env has VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
 *   3. npm run seed
 *
 * What it does:
 *  - Clears coach/packages/transformations/testimonials/services/supplements
 *  - Inserts the current site.json content (coach first, then collections)
 *  - Prices stay as TEXT ('1500 EGP') — matches the fixed schema.
 *  - Arrays (features, stats, certifications...) go in as JSONB.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { ROOT, publicEnv } from './lib/env.mjs'

const { url: URL, key: KEY } = publicEnv()

if (!URL || !KEY) {
  console.error('❌ Missing Supabase URL/key. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const sitePath = path.join(ROOT, 'src', 'data', 'site.json')
if (!fs.existsSync(sitePath)) {
  console.error(`❌ site.json not found at ${sitePath}`)
  process.exit(1)
}
const site = JSON.parse(fs.readFileSync(sitePath, 'utf-8'))

const str = (v, fb = '') => (v == null ? fb : String(v))
const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v])
const bool = (v) => v === true || v === 'true' || v === 1 || v === '1'

async function wipe(table) {
  // delete all rows (RLS "Public write" policy must exist — see supabase.sql)
  const { error } = await supabase.from(table).delete().neq('id', 0)
  if (error) throw new Error(`wipe ${table}: ${error.message}`)
}

async function insertMany(table, rows) {
  if (!rows.length) {
    console.log(`  · ${table}: 0 rows (skipped)`)
    return []
  }
  const { data, error } = await supabase.from(table).insert(rows).select('id')
  if (error) throw new Error(`insert ${table}: ${error.message}`)
  console.log(`  ✓ ${table}: ${data.length} rows`)
  return data
}

// ---------- row mappers (site.json -> DB) ----------
function mapCoach(c) {
  return {
    name: str(c.name), name_ar: str(c.name_ar),
    firstName: str(c.firstName), firstName_ar: str(c.firstName_ar),
    title: str(c.title), title_ar: str(c.title_ar),
    tagline: str(c.tagline), tagline_ar: str(c.tagline_ar),
    location: str(c.location), location_ar: str(c.location_ar),
    avatar: str(c.avatar), cover: str(c.cover),
    bio: str(c.bio), bio_ar: str(c.bio_ar),
    whatsappNumber: str(c.whatsappNumber), whatsappDisplay: str(c.whatsappDisplay),
    stats: arr(c.stats),
    certifications: arr(c.certifications),
    certifications_ar: arr(c.certifications_ar),
    specializations: arr(c.specializations),
    specializations_ar: arr(c.specializations_ar),
    approach: arr(c.approach),
  }
}

function mapPackage(p) {
  return {
    name: str(p.name), name_ar: str(p.name_ar),
    price: str(p.price), // TEXT: '1500 EGP'
    period: str(p.period, '/month'), period_ar: str(p.period_ar, '/شهر'),
    tag: p.tag ?? null, tag_ar: p.tag_ar ?? null,
    features: arr(p.features), features_ar: arr(p.features_ar),
    whatsappText: p.whatsappText ?? null, whatsappText_ar: p.whatsappText_ar ?? null,
    highlight: bool(p.highlight),
  }
}

function mapTransformation(t) {
  return {
    name: str(t.name), name_ar: t.name_ar ?? null,
    result: str(t.result), result_ar: t.result_ar ?? null,
    goal: t.goal ?? null, goal_ar: t.goal_ar ?? null,
    image: t.image ?? null, text: t.text ?? null, text_ar: t.text_ar ?? null,
  }
}

function mapTestimonial(t) {
  return {
    name: str(t.name), name_ar: t.name_ar ?? null,
    role: str(t.role, 'Client'), role_ar: str(t.role_ar, 'عميل'),
    avatar: str(t.avatar, 'https://i.pravatar.cc/100?img=11'),
    text: str(t.text), text_ar: str(t.text_ar),
  }
}

function mapService(s) {
  return {
    title: str(s.title), title_ar: str(s.title_ar),
    desc: str(s.desc), desc_ar: str(s.desc_ar),
    icon: str(s.icon, 'flame'),
  }
}

function mapSupplement(s) {
  return {
    name: str(s.name), name_ar: str(s.name_ar),
    price: str(s.price), // TEXT: '2400 EGP'
    category: str(s.category), category_ar: str(s.category_ar),
    description: str(s.description), description_ar: str(s.description_ar),
    image: str(s.image),
  }
}

// ---------- run ----------
console.log('🌱 Seeding Supabase:', URL)
console.log('   source: src/data/site.json')

try {
  // quick connection probe
  const probe = await supabase.from('coach').select('id', { count: 'exact', head: true })
  if (probe.error) {
    if (probe.error.code === 'PGRST205' || /schema cache/i.test(probe.error.message)) {
      throw new Error('Tables not found. Run supabase.sql in the Supabase SQL Editor first.')
    }
    // transformations table missing is the most common case
    const t2 = await supabase.from('transformations').select('id', { count: 'exact', head: true })
    if (t2.error) throw new Error('Missing tables. Run supabase.sql first. (' + t2.error.message + ')')
  }

  for (const t of ['coach', 'packages', 'transformations', 'testimonials', 'services', 'supplements']) {
    await wipe(t)
  }
  console.log('  🧹 cleared old rows')

  await insertMany('coach', [mapCoach(site.coach || {})])
  await insertMany('packages', (site.packages || []).map(mapPackage))
  await insertMany('transformations', (site.transformations || []).map(mapTransformation))
  await insertMany('testimonials', (site.testimonials || []).map(mapTestimonial))
  await insertMany('services', (site.services || []).map(mapService))
  await insertMany('supplements', (site.supplements || []).map(mapSupplement))

  console.log('\n✅ Seed complete — refresh the site, it now reads from Supabase.')
} catch (e) {
  console.error('\n❌ Seed failed:', e.message)
  console.error('   1) Did you run supabase.sql in SQL Editor?')
  console.error('   2) Check RLS "Public write" policies exist (they are in supabase.sql).')
  process.exit(1)
}
