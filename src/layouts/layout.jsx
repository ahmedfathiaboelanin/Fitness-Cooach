import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Sun, Moon, MessageCircle, Dumbbell, Package, Trophy, CalendarDays, Calculator, Menu, X, ChevronDown, Globe } from 'lucide-react'
import { CoachLogo } from '../components/brand'
import { waLink } from '../utils/whatsapp'
import { useSiteStore } from '../store/useSiteStore'
import { usePrefsStore } from '../store/usePrefsStore'
import { useT, useL } from '../i18n/useT'
import { WhatsAppFloat } from '../components/WhatsApp'

function Toggles() {
  const theme = usePrefsStore((s) => s.theme)
  const toggleTheme = usePrefsStore((s) => s.toggleTheme)
  const toggleLang = usePrefsStore((s) => s.toggleLang)
  const { t } = useT()
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light (eye-comfort)' : 'Switch to dark'}
        className="p-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        onClick={toggleLang}
        title="AR / EN"
        className="lang-toggle text-xs font-extrabold px-2.5 py-2 rounded-xl bg-fire-gradient text-white shadow-fire transition hover:brightness-110 inline-flex items-center gap-1.5"
      >
        <Globe size={15} /> {t('langName')}
      </button>
    </div>
  )
}

const COACHING_LINKS = [
  { to: '/workouts', key: 'programs', Icon: Dumbbell },
  { to: '/packages', key: 'packages', Icon: Package },
  { to: '/results', key: 'results', Icon: Trophy },
  { to: '/booking', key: 'booking', Icon: CalendarDays },
  { to: '/calculator', key: 'calculator', Icon: Calculator },
]

function CoachingDropdown() {
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
                <l.Icon size={18} />
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileMenu() {
  const { t } = useT()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open ])

  const mlink = ({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition min-h-[52px] ${isActive ? 'bg-rose-500/15 text-rose-300' : 'text-stone-200 active:bg-white/5'}`
  const coachingActive = COACHING_LINKS.some((l) => location.pathname.startsWith(l.to))

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="p-2.5 -me-1 rounded-xl text-stone-200 hover:bg-white/10 active:scale-95 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="menu-panel absolute top-full inset-x-0 z-50"
          >
            <div className="container-x py-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
              <NavLink to="/" className={mlink}>{t('nav.home')}</NavLink>
              <NavLink to="/about" className={mlink}>{t('nav.about')}</NavLink>

              <button
                onClick={() => setCoachOpen((o) => !o)}
                aria-expanded={coachOpen}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition min-h-[52px] ${coachingActive ? 'text-rose-300' : 'text-stone-200'}`}
              >
                {t('nav.coaching')}
                <motion.span animate={{ rotate: coachOpen ? 180 : 0 }} className="ms-auto"><ChevronDown size={18} /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {coachOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ps-4 pb-1 space-y-0.5">
                      {COACHING_LINKS.map((l) => (
                        <NavLink key={l.to} to={l.to} className={mlink}>
                          <l.Icon size={19} className="text-rose-400" /> {t(`nav.${l.key}`)}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <NavLink to="/contact" className={mlink}>{t('nav.contact')}</NavLink>

              <div className="grid grid-cols-2 gap-2.5 px-1 pt-3 pb-1">
                <WhatsAppCta />
                <Link to="/booking" className="btn-fire rounded-xl font-extrabold text-white text-center text-sm px-4 py-3.5 min-h-[52px] flex items-center justify-center">{t('bookNow')}</Link>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-bold text-stone-400">{t('themeLang')}</span>
                <Toggles />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

function WhatsAppCta() {
  const { t } = useT()
  return (
    <a href={waLink('Hi Mohammad! I want to book coaching')} target="_blank" rel="noreferrer" className="btn-wa rounded-xl font-extrabold text-sm px-4 py-3.5 min-h-[52px] flex items-center justify-center gap-1.5">
      <MessageCircle size={17} /> {t('whatsapp')}
    </a>
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
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl uppercase tracking-wide shrink-0">
          <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity }} className="flex"><CoachLogo size={38} /></motion.span>
          <span className="text-white">{pick(coach, 'name')}</span>
          {/* <span className="hidden sm:inline text-[10px] font-sans font-extrabold bg-fire-gradient text-white px-2 py-1 rounded-full">GYM • ONLINE</span> */}
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <NavLink to="/" className={link}>{t('nav.home')}</NavLink>
          <NavLink to="/about" className={link}>{t('nav.about')}</NavLink>
          <CoachingDropdown />
          <NavLink to="/contact" className={link}>{t('nav.contact')}</NavLink>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Toggles />
          <Link to="/booking" className="hidden lg:block text-sm bg-white text-stone-950 px-4 py-2 rounded-xl font-extrabold hover:bg-rose-100">{t('bookNow')}</Link>
        </div>
        <MobileMenu />
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
          <div className="flex items-center gap-3 mb-2"><CoachLogo size={46} /><span className="font-display text-white text-xl uppercase">{pick(coach, 'name')}</span></div>
          <p className="text-sm">{pick(coach, 'title')}<br />{pick(coach, 'location')}</p>
          <a href={waLink('Hi Mohammad!')} target="_blank" rel="noreferrer" className="btn-wa inline-flex items-center gap-1.5 mt-4 text-sm px-4 py-2 rounded-xl font-extrabold"><MessageCircle size={16} /> {t('whatsapp')}</a>
        </div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">Portfolio</h4><ul className="text-sm space-y-1"><li><Link className="hover:text-rose-400" to="/about">{t('nav.about')}</Link></li><li><Link className="hover:text-rose-400" to="/results">{t('nav.results')}</Link></li><li><Link className="hover:text-rose-400" to="/workouts">{t('nav.programs')}</Link></li></ul></div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">Coaching</h4><ul className="text-sm space-y-1"><li><Link className="hover:text-rose-400" to="/packages">{t('nav.packages')}</Link></li><li><Link className="hover:text-rose-400" to="/booking">{t('bookNow')}</Link></li><li><Link className="hover:text-rose-400" to="/calculator">{t('nav.calculator')}</Link></li><li><Link className="hover:text-rose-400" to="/contact">{t('nav.contact')}</Link></li></ul></div>
        <div><h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider">No Excuses</h4><p className="font-display text-2xl text-fire uppercase leading-snug">{t('footerTagline')}</p></div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs flex items-center justify-center gap-1.5">© 2026 {pick(coach, 'name')} — Built with <Flame size={13} className="text-rose-500" />. All rights reserved.</div>
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
          <button key={t.key || t.to} onClick={t.onClick} className="w-full text-start px-3 py-2 rounded-xl text-sm font-bold text-stone-300 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2">
            {t.Icon && <t.Icon size={15} />} {t.label}
          </button>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  )
}
