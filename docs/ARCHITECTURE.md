# Online-Coach — Architecture & Code Guide

A bilingual (EN/AR) gym + online-coaching site for Mohamed Elsum.
Visitors browse packages, results, supplements and book over WhatsApp —
there is no online payment. All content is editable from a hidden admin
dashboard backed by **Supabase** (Postgres).

> This file is the map of the codebase: folder structure, what each file
> does, how data flows, and the tricky points that will bite you if you
> change things blindly. Start here before touching anything.

---

## 1. Commands

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `npm run dev`         | Local dev server (also serves the dev-only `/api/site` file API)    |
| `npm run build`       | Production build into `dist/`                                       |
| `npm run preview`     | Serve the production build locally                                  |
| `npm run seed`        | Push `src/data/site.json` into Supabase (wipes those 6 tables first)|
| `npm run seed:check`  | Read-only health check: tables, row counts, admin-login readiness   |
| `npm run test:sheets` | Excel roundtrip regression test (17 checks, no DB writes)          |
| `npm run admin`       | Create / reset an admin password (needs service-role key, see §7)   |

First-time setup: paste **`supabase.sql`** into Supabase Dashboard →
SQL Editor → Run, set up `.env` (copy `.env.example`), then `npm run seed`.

---

## 2. Data flow (the one diagram that matters)

```
Supabase Postgres  ──refresh()──▶  useSiteStore (zustand, in-memory)
        ▲                                  │  ▲
        │  every admin edit                │  │  boot / Retry
        │  (insert-first, §8.4)            ▼  │
        │                          localStorage cache ("elsum-site-v3")
        │                                  │
   seed.mjs pushes                 Pages read via useSiteStore(s => s.*)
   site.json ──▶ DB                and re-render automatically
```

- **Supabase is the source of truth.** `src/data/site.json` is only the
  bundled fallback + seed input — editing it does nothing to the live site.
- On boot the store calls `refresh()`: all 6 content tables are fetched in
  parallel, normalized (`siteShapes.js`), cached to localStorage. If the DB
  is unreachable or empty, the app falls back to cache → bundled JSON, so the
  site never renders blank.
- Admin edits write to Supabase first (optimistic UI), then persist the cache.
- `npm run seed` is the only flow that goes `site.json → DB`.

---

## 3. Folder structure

```
Online-Coach/
├── index.html              # root div, fonts, title
├── vite.config.js          # react plugin + dev-only /api/site file API
├── tailwind.config.js      # only fire shadows/gradient survive (purged rest)
├── vercel.json             # SPA rewrite  /* → /index.html
├── .env / .env.example     # VITE_SUPABASE_URL + KEY (.env is gitignored)
├── supabase.sql            # FULL runnable schema + RLS + admin RPC (run it!)
├── package.json
│
├── src/
│   ├── main.jsx            # applyStoredPrefs() → Router → App
│   ├── App.jsx             # routes, AdminGuard, page-turn animation
│   ├── index.css           # theme system (dark/light, blue palette, remaps)
│   ├── data/site.json      # bundled fallback content + seed input
│   ├── assets/images/      # logo.png, hero.jpg, transformations/* (auto-gallery)
│   ├── components/
│   │   ├── ui.jsx          # Button, Badge, Card, Input, SectionTitle
│   │   ├── brand.jsx       # CoachLogo, EmberBackground, StatBurst
│   │   ├── WhatsApp.jsx    # WhatsAppButton (book/order CTAs)
│   │   ├── Gallery.jsx     # transformation slider + fullscreen lightbox
│   │   └── admin.jsx       # dashboard-only Field/Area/TabTitle/BulkHint/useA
│   ├── layouts/layout.jsx  # Navbar, MobileMenu, Footer, DashboardLayout
│   ├── pages/              # Landing, About, Results, Packages, Supplements,
│   │                       # Booking, Calculator, Contact, AdminLogin, AdminDashboard
│   ├── store/
│   │   ├── useSiteStore.js # ALL site content, Supabase-backed CRUD
│   │   ├── siteShapes.js   # DB rows <-> UI objects (norm* + *ToDb)
│   │   ├── useAdminStore.js# admin session: RPC login + change password
│   │   └── usePrefsStore.js# theme + language prefs (localStorage, <html> attrs)
│   ├── utils/
│   │   ├── supabase.js     # client + isSupabaseConfigured + connection probe
│   │   ├── password.js     # SHA-256 hex (matches Postgres pgcrypto)
│   │   ├── sheetSync.js    # PURE Excel parse/build (tested in Node, no browser)
│   │   ├── adminIO.js      # browser/store Excel ops (re-exports sheetSync)
│   │   ├── whatsapp.js     # wa.me link builder (reads cached coach number)
│   │   └── helpers.js      # timeSlots + next7Days (booking wizard)
│   └── i18n/
│       ├── dict.js         # en + ar string tables (incl. admin.* keys)
│       └── useT.js         # useT() + pick()/pickArr() localized field readers
│
├── scripts/
│   ├── lib/env.mjs         # shared .env loader (ROOT, publicEnv, serviceEnv)
│   ├── seed.mjs            # site.json → Supabase
│   ├── check.mjs           # health check incl. verify_admin probe
│   ├── admin.mjs           # create/reset admin password (service-role key)
│   └── test-sheets.mjs     # Excel roundtrip regression test
└── docs/ARCHITECTURE.md    # this file
```

Deleted during cleanup (were dead stubs/exports, zero imports): `src/features/*`
(6 placeholder files), `src/hooks/useCountdown.js`, `src/components/cards.jsx`
(`WorkoutCard`, `ProgressChart`), `Stars`/`RatingStars`/`Modal` (ui.jsx),
`FireButton`/`WhatsAppFloat` (WhatsApp.jsx), `MarqueeStrip` (brand.jsx),
`formatPrice`/`cx` (helpers.js), dead tailwind keyframes.

---

## 4. File-by-file guide

### Entry & shell
- **`src/main.jsx`** — calls `applyStoredPrefs()` *before* render (prevents a
  dark→light flash), then mounts Router → App.
- **`src/App.jsx`** — public routes wrapped in `MainLayout` + a book-paper
  `PageTurn` transition; hidden `/elsum-admin/login` + `/elsum-admin`
  (guarded by `AdminGuard`); `*` → 404 card. Admin routes skip PageTurn.
- **`vite.config.js`** — dev-only `/api/site` GET/PUT for `site.json` (legacy
  offline path) + `watch.ignored` so admin saves don't hot-reload.
- **`vercel.json`** — rewrites everything to `/index.html` so React Router
  paths work on refresh.

### Theme
- **`src/index.css`** — CSS variables drive both themes (`--accent #2E7BFF`,
  navy-black surfaces). Class names kept their old "fire/rose" names but
  render blue: `.text-fire`, `.btn-fire` (flat solid), `.bg-fire-gradient`
  (forced solid), plus a **rose→blue remap** so legacy `rose-*` markup needs
  no per-file edits. Light mode lives under `[data-theme='light']` overrides.
- **`tailwind.config.js`** — intentionally tiny now: only `shadow-fire`,
  `shadow-fire-lg`, `bg-fire-gradient`. Everything else was purged as unused.

### Data layer (the core)
- **`src/store/useSiteStore.js`** — single source of truth for `coach`,
  `packages`, `transformations`, `testimonials`, `services`, `supplements`.
  Exposes `refresh()`, per-table async CRUD, `importJSON`/`exportJSON`/
  `resetAll`, and `supabaseStatus` (`checking|connected|empty|unavailable`).
- **`src/store/siteShapes.js`** — pure mappers, no imports except the JSON
  fallback. `norm*` tolerate old schemas (numeric prices, TEXT arrays);
  `*ToDb` strip `id`/`created_at` (the DB auto-generates them).
- **`src/data/site.json`** — fallback + seed input. Shape must stay in sync
  with `siteShapes.js` and `supabase.sql`.
- **`src/utils/supabase.js`** — accepts `VITE_SUPABASE_PUBLISHABLE_KEY` **or**
  `VITE_SUPABASE_ANON_KEY`; exports `supabase` (`null` when unconfigured so
  imports never crash) + `isSupabaseConfigured`.
- **`supabase.sql`** — idempotent: `IF NOT EXISTS` tables, type-migration
  `DO` blocks, RLS, ordering indexes, and the ADMIN AUTH block (§7).

### Admin auth
- **`src/store/useAdminStore.js`** — session in `sessionStorage`
  (`elsum-admin-auth` + user). `login(username, password)` hashes (SHA-256)
  and calls the `verify_admin` RPC; `changePassword` calls
  `change_admin_password`. Three-tier fallback: Supabase → legacy table →
  offline (see §8.6).
- **`src/utils/password.js`** — `sha256Hex()` (WebCrypto) + min-length policy.
- **`src/pages/AdminLogin.jsx`** — username + password form, async, no
  password ever displayed.
- **Security tab** (`AdminDashboard.jsx` + `admin.security*` dict keys) —
  shows who is logged in + change-password form.

### i18n
- **`src/i18n/dict.js`** — `en`/`ar` trees; admin strings under `admin.*`.
- **`src/i18n/useT.js`** — `useT()` → `{ t, lang, isAR }`; `pick(obj, base)`
  returns `base_ar` in Arabic when present (EN fallback); `pickArr` same for
  arrays. `usePrefsStore` sets `<html lang dir>` (RTL flips layout).

### Public pages (all read the store; all write via WhatsApp links)
`Landing` (hero + services + results + supplements teaser + packages +
reviews), `About` (bio + stats + approach), `Results` (transformations +
reviews + auto `GallerySlider`), `Packages`, `Supplements` (search + category
filter), `Booking` (3-step wizard → `wa.me` message), `Calculator`
(Mifflin-St Jeor BMR/TDEE → share to WhatsApp), `Contact` (form → `wa.me`).
- **`src/components/Gallery.jsx`** — `import.meta.glob` auto-loads every
  image in `assets/images/transformations/`; snap carousel + lightbox
  (always dark via `.lightbox` scope).
- **`src/utils/whatsapp.js`** — builds `wa.me/<digits>?text=…`, normalizes
  Egyptian numbers (`01…` → `201…`), reads the cached coach number.
- **`src/components/admin.jsx`** — `Field`/`Area`/`TabTitle`/`BulkHint` used
  only by the dashboard (kept out of the public `ui.jsx`).

### Admin dashboard (`src/pages/AdminDashboard.jsx`, ~900 lines)
Tabs: Guide → Content (coach + approach steps) → Packages → Results →
Reviews → Services → Supplements → **Security** → Data (Excel/JSON).
Each content tab: manual form + `BulkHint` link. All writes hit Supabase
instantly. `DataTab` = full-workbook export (Coach + 5 sheets) + upload via
`parseWorkbook`, full-JSON backup/restore, reset-to-defaults.

### Scripts & Excel engine
- **`src/utils/sheetSync.js`** — pure functions only (imports just `xlsx`,
  so Node can test it): header-tolerant parsing, per-table builders,
  `toSheetRow` export mappers, coach sheet converters, **`parseWorkbook`**.
- **`src/utils/adminIO.js`** — browser/store layer (`FileReader`, downloads,
  `useSiteStore` calls); re-exports everything from `sheetSync.js`.
- **`scripts/seed.mjs`** — wipes the 6 content tables, inserts `site.json`
  (NOT users — admin accounts survive reseeding).
- **`scripts/check.mjs`** — row counts + `verify_admin` probe (detects a
  missing SQL migration).
- **`scripts/admin.mjs`** — lockout recovery with service-role key.
- **`scripts/test-sheets.mjs`** — 17-assertion Excel roundtrip test.
- **`scripts/lib/env.mjs`** — one `.env` parser shared by all scripts.

---

## 5. Core functionalities

1. **Dynamic content system** — every public string/image/price comes from
   Supabase; the dashboard edits it; the site re-renders. No rebuilds.
2. **Bilingual EN/AR with RTL** — every content object carries `_ar` fields;
   missing Arabic falls back to English; `<html dir>` flips.
3. **Dark/light themes** — persisted prefs, applied pre-render.
4. **WhatsApp booking & ordering** — package/supplement/contact actions deep-
   link to `wa.me` with prefilled bilingual messages; no payments online.
5. **BMR calculator** — validated inputs → BMR/TDEE/target/protein/water →
   share result on WhatsApp.
6. **Supplements shop** — live search + category pills.
7. **Admin CRUD + bulk Excel/JSON** — per-tab forms plus full-workbook and
   full-JSON import/export with skip-empty and failure-safe sync.
8. **Admin auth in DB** — username + password login, password change in the
   Security tab, SHA-256 hashes, lockout recovery script.

---

## 6. Tricky points (read before changing code)

1. **Supabase is truth; `site.json` is fallback.** Editing `site.json` never
   updates the live site. To change live data: dashboard, Excel upload, or
   `npm run seed`.
2. **IDs: numbers (DB) vs strings (local).** New rows are inserted without an
   `id`; the DB assigns a bigint. `dbUpdate`/`dbDelete` skip string ids
   (local-only rows) — so after any bulk import, `refresh()` must run to swap
   temp string ids for real numeric ones, or later edits silently stay local.
   `importJSON`/`setSupplements` already do this.
3. **Prices are TEXT, not numbers** (`"1500 EGP"`). The old schema used
   `double precision` and broke on `"1500 EGP"`. Never change price columns
   back to numeric; `toPrice()` stringifies legacy numeric values.
4. **Arrays are JSONB, read tolerantly.** `toArray()` also parses stringified
   JSON arrays and newline/`|`-separated TEXT (pre-migration leftovers).
5. **Bulk sync is insert-first, prune-stale-second** (`importJSON`,
   `setSupplements`). It never deletes before a successful insert, rolls a
   failed table back locally, and returns `{ ok, failures }`. Do not
   reintroduce wipe-then-insert.
6. **`parseWorkbook` never emits empty tables.** A sheet with 0 valid rows is
   reported in `skipped` and left out of `patch` — this was the
   "services became 0" bug (empty array is truthy, so `[]` used to wipe).
   Same guard protects the Coach profile (`isMeaningfulCoach`).
7. **Admin auth: RPC-only, hashes only.** `users` has NO public RLS policies;
   login/password-change go through `SECURITY DEFINER` `verify_admin` /
   `change_admin_password`. The browser hashes with SHA-256 (must match
   Postgres `encode(digest(...,'sha256'),'hex')` — both are lowercase hex of
   UTF-8). The SQL default admin uses `ON CONFLICT (username) DO NOTHING`,
   so re-running `supabase.sql` never resets a changed password.
8. **Login fallback chain is deliberate:** definitive RPC true/false stops the
   chain (a changed password kills the old one); pre-migration DBs use a
   legacy table check (with a console warning); the hardcoded fallback works
   ONLY when the DB is unreachable/misconfigured (offline mode). If you
   touch this, keep that property or you create a backdoor.
9. **Service-role key is CLI-only** (`scripts/admin.mjs`, no `VITE_` prefix,
   never committed). The seed script intentionally uses the anon key.
10. **Old `rose-*` class names render blue.** The palette moved to electric
    blue but markup kept `rose-*`/`fire-*` names; `index.css` remaps them.
    When writing new markup, prefer the `fire`/blue utilities, but old
    classes keep working.
11. **Light-mode `text-white` trap.** The global rule turns bare `text-white`
    dark in light mode — except inside `[class*='bg-']` (solid chips stay
    white) and `.photo-cap` (captions on photos stay white). If you add text
    over an image, add `photo-cap` to its container. The `.lightbox` subtree
    is pinned dark via scoped overrides.
12. **Excel headers are normalized** (trimmed + lowercased; Arabic aliases
    accepted). Never compare raw headers. Keep the first header row untouched
    in templates; `matchSheet()` maps sheet names (EN + AR).
13. **Admin session is per-tab** (`sessionStorage`). Closing the tab logs out;
    content cache is per-browser (`localStorage elsum-site-v3`).
14. **Coach number for WhatsApp comes from cache.** `whatsapp.js` reads the
    store's localStorage snapshot (no store import → no cycle). Changing the
    number in the dashboard updates links after refresh.
15. **Dev-only `/api/site`** exists only under `npm run dev`; production
    builds have no file API (store treats it as best-effort).
16. **RTL is structural, not cosmetic.** `pick`/`pickArr` choose `_ar` fields;
    `ms-/me-`, `start-/end-`, `rtl:` variants handle direction. Test both.
17. **Inputs are 16px on mobile** (kills iOS auto-zoom) and `overflow-x: clip`
    guards against sideways scroll — don't add fixed-width rows.
18. **Gallery needs no code changes for new photos** — drop files into
    `assets/images/transformations/` and `import.meta.glob` picks them up.
19. **Hidden routes:** `/elsum-admin/login` + `/elsum-admin` are unlinked
    (security by obscurity + real DB auth). `vercel.json` rewrite keeps
    direct links working; Vercel env vars must mirror `.env`.
20. **Adding a column end-to-end:** `supabase.sql` (column) → `siteShapes.js`
    (norm + toDb) → `sheetSync.js` (builder + toSheetRow) → `AdminDashboard`
    form → `seed.mjs` mapper → `npm run seed` → `npm run test:sheets`.

---

## 7. Lockout recovery (admin password)

1. Dashboard → Security tab (needs current password).
2. Forgot it? `npm run admin -- reset --username=admin --password=NEW-PASS`
   (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env`).
3. No service key? In SQL Editor:
   `update users set password = encode(digest('NEW-PASS','sha256'),'hex') where username='admin';`
