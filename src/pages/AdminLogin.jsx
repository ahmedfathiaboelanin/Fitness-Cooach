import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Lock, ArrowLeft, User } from 'lucide-react'
import { CoachLogo } from '../components/brand'
import { useAdminStore } from '../store/useAdminStore'
import { Card, Button, Input } from '../components/ui'

export default function AdminLogin() {
  const login = useAdminStore((s) => s.login)
  const isAdmin = useAdminStore((s) => s.isAdmin)
  const loginBusy = useAdminStore((s) => s.loginBusy)
  const nav = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAdmin) {
    return <Navigate to="/elsum-admin" replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(username, password)
    if (res.ok) nav('/elsum-admin')
    else setError(res.error || 'Wrong username or password')
  }

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-16 max-w-md">
        <Card className="text-center">
          <div className="flex justify-center"><CoachLogo size={72} /></div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full mt-4"><Lock size={12} /> HIDDEN ADMIN</span>
          <h1 className="font-display text-3xl uppercase mt-3">Coach <span className="text-fire">Login</span></h1>
          <p className="text-xs text-stone-400 mt-1">This page is not linked anywhere. Only you know this URL.</p>
          <form onSubmit={submit} className="space-y-3 mt-4 text-start">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" autoComplete="username" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button className="w-full" disabled={loginBusy}>
              <span className="inline-flex items-center gap-1.5"><Lock size={16} /> {loginBusy ? 'Checking…' : 'Unlock Dashboard'}</span>
            </Button>
          </form>
          <p className="text-[11px] text-stone-500 mt-3 inline-flex items-center gap-1"><User size={12} /> First login? Username <b>admin</b> — default password <b>elsum123</b> (change it in the dashboard Security tab).</p>
          <div><Link to="/" className="text-xs text-stone-500 hover:text-rose-300 mt-2 inline-flex items-center gap-1"><ArrowLeft size={13} /> Back to site</Link></div>
        </Card>
      </div>
    </div>
  )
}
