/**
 * Browser + store-backed Excel/JSON ops for the admin dashboard.
 * Pure parsing/building lives in ./sheetSync.js (unit-tested in Node).
 */
import * as XLSX from 'xlsx'
import { useSiteStore } from '../store/useSiteStore'

export * from './sheetSync.js'
import { builders, sheetNames, normRows, matchSheet, templateRow, toSheetRow } from './sheetSync.js'

export function readWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        resolve(XLSX.read(ev.target.result, { type: 'array' }))
      } catch {
        reject(new Error('Could not read that file. Use .xlsx, .xls or .csv.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsArrayBuffer(file)
  })
}

export function exportRowsToExcel(filename, sheetName, rows) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

export function downloadJSON(filename, obj) {
  const blob = new Blob([typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        resolve(JSON.parse(ev.target.result))
      } catch {
        reject(new Error('That file is not valid JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsText(file)
  })
}

/* ---------------- high-level ops ---------------- */

/** Export one collection to its own .xlsx file. */
export function exportTable(tableKey) {
  const s = JSON.parse(useSiteStore.getState().exportJSON())
  const rows = (s[tableKey] || []).map(toSheetRow[tableKey])
  exportRowsToExcel(`${tableKey}-export.xlsx`, sheetNames[tableKey] || tableKey, rows)
}

/** Export one collection to its own .json file. */
export function exportTableJSON(tableKey) {
  const s = JSON.parse(useSiteStore.getState().exportJSON())
  downloadJSON(`${tableKey}.json`, s[tableKey] || [])
}

/**
 * Import one collection from an Excel file.
 * Finds the matching sheet (or uses the first sheet for single-table files).
 * mode 'replace' (default) swaps the whole list, 'append' adds rows.
 * Returns { count, sheet }.
 */
export async function importTableExcel(tableKey, file, mode = 'replace') {
  const wb = await readWorkbook(file)
  const build = builders[tableKey]
  if (!build) throw new Error(`Unknown table: ${tableKey}`)
  // prefer the sheet whose name matches this table; else first sheet
  const wsName = wb.SheetNames.find((sn) => matchSheet(sn) === tableKey) || wb.SheetNames[0]
  const items = build(normRows(wb.Sheets[wsName]))
  if (!items.length) throw new Error('No valid rows found — check the columns.')
  const current = JSON.parse(useSiteStore.getState().exportJSON())
  const next = mode === 'append' ? [...(current[tableKey] || []), ...items] : items
  if (tableKey === 'supplements') {
    await useSiteStore.getState().setSupplements(next)
  } else {
    await useSiteStore.getState().importJSON({ ...current, [tableKey]: next })
  }
  return { count: items.length, sheet: wsName }
}

/** Import one collection from a JSON array file. Same replace/append modes. */
export async function importTableJSON(tableKey, data, mode = 'replace') {
  const arr = Array.isArray(data) ? data : data?.[tableKey]
  if (!Array.isArray(arr)) throw new Error('JSON must be an array of rows.')
  const build = builders[tableKey]
  // run through the builder to normalize headers/casing, then restore ids
  const normed = build(arr.map((r) => {
    const o = {}
    Object.entries(r || {}).forEach(([k, v]) => { o[String(k).trim().toLowerCase()] = v })
    return o
  }))
  // keep original ids when present so updates stay stable
  const items = normed.map((n, i) => ({ ...n, id: arr[i]?.id ?? n.id }))
  if (!items.length) throw new Error('No valid rows found in that JSON.')
  const current = JSON.parse(useSiteStore.getState().exportJSON())
  const next = mode === 'append' ? [...(current[tableKey] || []), ...items] : items
  if (tableKey === 'supplements') {
    await useSiteStore.getState().setSupplements(next)
  } else {
    await useSiteStore.getState().importJSON({ ...current, [tableKey]: next })
  }
  return { count: items.length }
}

export function downloadTemplate(tableKey) {
  exportRowsToExcel(
    `${tableKey}-template.xlsx`,
    sheetNames[tableKey] || tableKey,
    [templateRow(tableKey)]
  )
}
