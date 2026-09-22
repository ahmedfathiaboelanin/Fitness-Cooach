import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      {/* Hidden admin — not linked anywhere in the site */}
      <Route path="/elsum-admin/login" element={<AdminLogin />} />
      <Route path="/elsum-admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

      <Route path="*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/results" element={<Results />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workouts/:id" element={<WorkoutDetail />} />
            <Route path="*" element={<div className="bg-stone-950 text-white min-h-screen"><div className="container-x py-20 text-center"><h1 className="font-display text-5xl">404</h1><p className="text-stone-400">Page not found</p></div></div>} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  )
}
