import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only file API: lets the hidden admin dashboard read/write
// src/data/site.json directly while running `npm run dev`.
// NOTE: a browser can never write files on static production hosting,
// so the dashboard falls back to browser storage + Export JSON there.
function siteFileApi() {
  const file = path.resolve(process.cwd(), 'src/data/site.json')
  const read = () => JSON.parse(fs.readFileSync(file, 'utf-8'))
  return {
    name: 'site-file-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/site', (req, res) => {
        // charset=utf-8 is critical: without it some HTTP clients
        // (e.g. PowerShell 5.1) decode Arabic as Latin-1 and corrupt it
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        if (req.method === 'GET') {
          try {
            res.end(JSON.stringify(read()))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String((e && e.message) || e) }))
          }
          return
        }
        if (req.method === 'PUT') {
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', () => {
            try {
              const obj = JSON.parse(body)
              if (!obj || typeof obj !== 'object' || !obj.coach || !Array.isArray(obj.packages)) {
                throw new Error('Invalid site data (need coach + packages)')
              }
              fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf-8')
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: String((e && e.message) || e) }))
            }
          })
          return
        }
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), siteFileApi()],
  server: {
    // Don't hot-reload the page when the admin saves site.json —
    // the store already holds the fresh state in memory.
    watch: { ignored: ['**/src/data/site.json'] },
  },
})
