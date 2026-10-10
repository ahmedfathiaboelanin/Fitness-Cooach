/**
 * Regression test for the Excel roundtrip (the "services became 0" bug).
 * Uses the REAL parser (src/utils/sheetSync.js — pure, no browser needed):
 *   export columns -> xlsx bytes -> parseWorkbook -> assert counts.
 * Run: npm run test:sheets
 */
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import {
  parseWorkbook, toSheetRow, coachToSheetRow,
} from '../src/utils/sheetSync.js'
import { ROOT } from './lib/env.mjs'

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'site.json'), 'utf-8'))

let failures = 0
function check(name, cond, extra = '') {
  if (cond) console.log(`  ✅ ${name}`)
  else { failures++; console.log(`  ❌ ${name} ${extra}`) }
}

/** Build a workbook exactly like DataTab > Export site.xlsx */
function buildExportWorkbook(s) {
  const wb = XLSX.utils.book_new()
  const add = (name, rows) => XLSX.utils.book_append_sheet(
    wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name,
  )
  add('Coach', [coachToSheetRow(s.coach)])
  add('Packages', s.packages.map(toSheetRow.packages))
  add('Results', s.transformations.map(toSheetRow.transformations))
  add('Testimonials', s.testimonials.map(toSheetRow.testimonials))
  add('Services', s.services.map(toSheetRow.services))
  add('Supplements', s.supplements.map(toSheetRow.supplements))
  return wb
}

const roundtrip = (wb) => parseWorkbook(XLSX.read(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' }))

// ---- 1. clean download -> upload keeps everything ----
console.log('1. clean roundtrip (download -> upload, no edits)')
{
  const { patch, notes, skipped, coachPatch } = roundtrip(buildExportWorkbook(site))
  check('packages = 3', patch.packages?.length === 3, `got ${patch.packages?.length}`)
  check('transformations = 3', patch.transformations?.length === 3, `got ${patch.transformations?.length}`)
  check('testimonials = 3', patch.testimonials?.length === 3, `got ${patch.testimonials?.length}`)
  check('services = 4 (the reported bug)', patch.services?.length === 4, `got ${patch.services?.length}`)
  check('supplements = 4', patch.supplements?.length === 4, `got ${patch.supplements?.length}`)
  check('coach profile parsed', !!coachPatch && coachPatch.name === site.coach.name)
  check('nothing skipped', skipped.length === 0, JSON.stringify(skipped))
  check('service titles survive', patch.services?.[0]?.title === site.services[0].title)
  check('service AR + icon survive',
    patch.services?.[0]?.title_ar === site.services[0].title_ar && patch.services?.[0]?.icon === site.services[0].icon)
  void notes
}

// ---- 2. edited services sheet (rename a service, keep headers) ----
console.log('2. edited services sheet still imports fully')
{
  const wb = buildExportWorkbook(site)
  const ws = wb.Sheets.Services
  const rows = XLSX.utils.sheet_to_json(ws)
  rows[0].title = 'Edited Title'
  wb.Sheets.Services = XLSX.utils.json_to_sheet(rows)
  const { patch } = roundtrip(wb)
  check('services = 4 after edit', patch.services?.length === 4, `got ${patch.services?.length}`)
  check('edit applied', patch.services?.[0]?.title === 'Edited Title')
}

// ---- 3. mangled services headers -> skipped, NOT wiped ----
console.log('3. mangled services headers are skipped (old code wiped to 0)')
{
  const wb = buildExportWorkbook(site)
  const rows = XLSX.utils.sheet_to_json(wb.Sheets.Services)
  const broken = rows.map((r) => ({ wrong1: r.title, wrong2: r.desc }))
  wb.Sheets.Services = XLSX.utils.json_to_sheet(broken)
  const { patch, skipped } = roundtrip(wb)
  check('patch has NO services key', !('services' in patch))
  check('skipped mentions Services', skipped.some((s) => s.startsWith('Services')))
  check('other tables unaffected', patch.packages?.length === 3 && patch.supplements?.length === 4)
}

// ---- 4. emptied services sheet (headers only) -> skipped ----
console.log('4. emptied services sheet is skipped')
{
  const wb = buildExportWorkbook(site)
  wb.Sheets.Services = XLSX.utils.json_to_sheet([{ title: '', title_ar: '', desc: '', desc_ar: '', icon: '' }])
  const { patch, skipped } = roundtrip(wb)
  check('patch has NO services key', !('services' in patch))
  check('skipped mentions Services', skipped.some((s) => s.startsWith('Services')))
}

// ---- 5. unknown sheets ignored, garbage workbook safe ----
console.log('5. unknown/garbage input')
{
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ foo: 'bar' }]), 'Random')
  const { patch, notes } = roundtrip(wb)
  check('nothing parsed', Object.keys(patch).length === 0 && notes.length === 0)
}

console.log(failures ? `\n❌ ${failures} check(s) failed` : '\n✅ all sheet checks passed')
process.exit(failures ? 1 : 0)
