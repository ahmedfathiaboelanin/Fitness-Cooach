import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { waLink } from '../utils/whatsapp'
import { useSiteStore } from '../store/useSiteStore'
import { usePrefsStore } from '../store/usePrefsStore'
import { useT, useL } from '../i18n/useT'
import { WhatsAppFloat } from '../components/WhatsApp'

function Toggles({ compact }) {
  const theme = usePrefsStore((s) => s.theme)
  const toggleTheme = usePrefsStore((s) => s.toggleTheme)
  const toggleLang = usePrefsStore((s) => s.toggleLang)
  const { t } = useT()
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light (eye-comfort)' : 'Switch to dark'}
        className="text-xs font-bold px-2.5 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition"
      >
        {theme === 'dark' ? (compact ? '☀️' : `☀️ ${t('light')}`) : (compact ? '🌙' : `🌙 ${t('dark')}`)}
      </button>
      <button
        onClick={toggleLang}
        title="AR / EN"
        className="text-xs font-extrabold px-2.5 py-2 rounded-xl bg-fire-gradient text-white shadow-fire transition hover:brightness-110"
      >
        {t('langName')}
      </button>
    </div>
  )
}

const COACHING_LINKS = [
  { to: '/workouts', key: 'programs', icon: '🏋️' },
  { to: '/packages', key: 'packages', icon: '📦' },
  { to: '/results', key: 'results', icon: '🏆' },
  { to: '/booking', key: 'booking', icon: '📅' },
  { to: '/calculator', key: 'calculator', icon: '🧮' },
]

function CoachingDropdown({ mobile }) {
  const { t } = useT()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = COACHING_LINKS.some((l) => location.pathname.startsWith(l.to))

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [open ])

  if (mobile) {
    return (
      <div className="shrink-0">
        <button onClick={() => setOpen((o) => !o)} className={`text-sm font-bold tracking-wide transition ${active ? 'text-rose-400' : 'text-stone-300'}`}>
          {t('nav.coaching')} {open ? '▴' : '▾'}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-4 pt-2 pb-1">
                {COACHING_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} className={({ isActive }) => `text-sm whitespace-nowrap ${isActive ? 'text-rose-400 font-bold' : 'text-stone-300'}`}>
                    {l.icon} {t(`nav.${l.key}`)}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative text-sm font-bold tracking-wide transition flex items-center gap-1 ${active ? 'text-rose-400' : 'text-stone-300 hover:text-white'}`}
      >
        {t('nav.coaching')}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[10px]">▾</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute top-full mt-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-60 card-fire p-2 shadow-fire-lg z-50"
          >
            <div className="absolute -top-1.5 start-8 w-3 h-3 rotate-45 bg-inherit border-s border-t border-white/10" />
            {COACHING_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${isActive ? 'bg-rose-500/15 text-rose-300' : 'text-stone-300 hover:bg-rose-500/10 hover:text-white'}`}
              >
                <span className="text-lg">{l.icon}</span>
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar() {
  const coach = useSiteStore((s) => s.coach)
  const { t } = useT()
  const { pick } = useL()
  const link = ({ isActive }) => `relative text-sm font-bold tracking-wide transition ${isActive ? 'text-rose-400' : 'text-stone-300 hover:text-white' }`
  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-xl border-b border-rose-500/15">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-fire-gradient" />
      <div className="container-x flex items-center justify-between h-16 gap-2">
        <Link to="/" className="flex items-center gap-2 font-display text-xl uppercase tracking-wide shrink-0">
          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-2xl">🔥</motion.span>
          <span className="text-white">{pick(coach, 'name')}</span>
          {/* <span className="hidden sm:inline text-[10px] font-sans font-extrabold bg-fire-gradient text-white px-2 py-1 rounded-full">GYM • ONLINE</span> */}
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <NavLink to="/" className={link}>{t('nav.home')}</NavLink>
          <NavLink to="/about" className={link}>{t('nav.about')}</NavLink>
          <CoachingDropdown />
          <NavLink to="/contact" className={link}>{t('nav.contact')}</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Toggles compact />
          {/* <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={waLink('Hi Mohammad! I want to book coaching 🔥💪')} target="_blank" rel="noreferrer" className="btn-fire text-sm px-4 py-2 rounded-xl font-extrabold text-white hidden sm:block">💬 {t('whatsapp')}</motion.a> */}
          <Link to="/booking" className="hidden lg:block text-sm bg-white text-stone-950 px-4 py-2 rounded-xl font-extrabold hover:bg-rose-100">{t('bookNow')}</Link>
        </div>
      </div>
      <div className="md:hidden flex gap-4 overflow-x-auto px-4 pb-2 text-sm items-start">
        <NavLink to="/" className={link}>{t('nav.home')}</NavLink>
        <NavLink to="/about" className={link}>{t('nav.about')}</NavLink>
        <CoachingDropdown mobile />
        <NavLink to="/contact" className={link}>{t('nav.contact')}</NavLink>
      </div>
    </header>
  )
}

export function Footer() {
  const coach = useSiteStore((s) => s.coach)
  const { t } = useT()
  const { pick } = useL()
  return (
    <footer className="bg-stone-950 text-stone-400 mt-0 border-t border-rose-500/15 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-fire-gradient" />
      <div className="container-x py-12 grid md:grid-cols-4 gap-8 relative">
        <div>
          <div className="font-display text-white text-xl mb-2 uppercase">🔥 {pick(coach, 'name')}</div>
          <p className="text-sm">{pick(coach, 'title')}<br />{pick(coach, 'location')}</p>
          <a href={waLink('Hi Mohammad! 🔥')} target="_blank" rel="noreferrer" className="btn-fire inline-block mt-4 text-sm px-4 py-2 rounded-xl font-extrabold text-white">💬 {t('whatsapp')}</a>
        </div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">Portfolio</h4><ul className="text-sm space-y-1"><li><Link className="hover:text-rose-400" to="/about">{t('nav.about')}</Link></li><li><Link className="hover:text-rose-400" to="/results">{t('nav.results')}</Link></li><li><Link className="hover:text-rose-400" to="/workouts">{t('nav.programs')}</Link></li></ul></div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">Coaching</h4><ul className="text-sm space-y-1"><li><Link className="hover:text-rose-400" to="/packages">{t('nav.packages')}</Link></li><li><Link className="hover:text-rose-400" to="/booking">{t('bookNow')}</Link></li><li><Link className="hover:text-rose-400" to="/calculator">{t('nav.calculator')}</Link></li><li><Link className="hover:text-rose-400" to="/contact">{t('nav.contact')}</Link></li></ul></div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">No Excuses</h4><p className="font-display text-2xl text-fire uppercase leading-snug">{t('footerTagline')}</p></div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">© 2026 {pick(coach, 'name')} — Built with 🔥. All rights reserved.</div>
    </footer>
  )
}

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* <WhatsAppFloat /> */}
    </div>
  )
}

// Used only by the hidden admin dashboard
export function DashboardLayout({ children, tabs }) {
  return (
    <div className="container-x py-8 grid lg:grid-cols-[220px_1fr] gap-6">
      <aside className="card-fire p-4 h-fit space-y-1">
        {tabs.map((t) => (
          <button key={t.key || t.to} onClick={t.onClick} className="w-full text-start block px-3 py-2 rounded-xl text-sm font-bold text-stone-300 hover:bg-rose-500/10 hover:text-rose-300">
            {t.icon} {t.label}
          </button>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  )
}
