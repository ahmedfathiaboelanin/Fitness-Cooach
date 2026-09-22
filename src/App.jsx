import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MainLayout } from './layouts/layout'
import { useAdminStore } from './store/useAdminStore'
import Landing from './pages/Landing'
import About from './pages/About'
import Results from './pages/Results'
import Packages from './pages/Packages'
import Contact from './pages/Contact'
import Workouts from './pages/Workouts'
import WorkoutDetail from './pages/WorkoutDetail'
import Booking from './pages/Booking'
import Calculator from './pages/Calculator'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function AdminGuard({ children }) {
  const isAdmin = useAdminStore((s) => s.isAdmin)
  if (!isAdmin) return <Navigate to="/elsum-admin/login" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* Book-paper page turn: the old page lifts away to the left while the
   new one swings in from the right, with a passing page-edge shadow. */
function PageTurn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 90, rotateY: -13, transformPerspective: 1600, transformOrigin: 'left center', filter: 'brightness(0.82)' }}
      animate={{ opacity: 1, x: 0, rotateY: 0, filter: 'brightness(1)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: -80, rotateY: 12, transformOrigin: 'right center', filter: 'brightness(0.8)', transition: { duration: 0.3, ease: [0.64, 0, 0.78, 0] } }}
      className="relative"
    >
      {children}
      <motion.div
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(100deg, transparent 55%, rgba(0,0,0,0.35) 100%)' }}
      />
    </motion.div>
  )
}

function SiteRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTurn><Landing /></PageTurn>} />
        <Route path="/about" element={<PageTurn><About /></PageTurn>} />
        <Route path="/results" element={<PageTurn><Results /></PageTurn>} />
        <Route path="/packages" element={<PageTurn><Packages /></PageTurn>} />
        <Route path="/contact" element={<PageTurn><Contact /></PageTurn>} />
        <Route path="/booking" element={<PageTurn><Booking /></PageTurn>} />
        <Route path="/calculator" element={<PageTurn><Calculator /></PageTurn>} />
        <Route path="/workouts" element={<PageTurn><Workouts /></PageTurn>} />
        <Route path="/workouts/:id" element={<PageTurn><WorkoutDetail /></PageTurn>} />
        <Route path="*" element={<PageTurn><div className="bg-stone-950 text-white min-h-screen"><div className="container-x py-20 text-center"><h1 className="font-display text-5xl">404</h1><p className="text-stone-400">Page not found</p></div></div></PageTurn>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Hidden admin — kept snappy, no page-turn */}
      <Route path="/elsum-admin/login" element={<AdminLogin />} />
      <Route path="/elsum-admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

      <Route path="*" element={
        <MainLayout>
          <ScrollToTop />
          <SiteRoutes />
        </MainLayout>
      } />
    </Routes>
  )
}
