import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAdminStore, ADMIN_PASSWORD } from '../store/useAdminStore'
import { Card, Button, Input } from '../components/ui'

export default function AdminLogin() {
  const login = useAdminStore((s) => s.login)
  const isAdmin = useAdminStore((s) => s.isAdmin)
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAdmin) {
    return <Navigate to="/elsum-admin" replace />
  }

  const submit = (e) => {
    e.preventDefault()
    if (login(password)) nav('/elsum-admin')
    else setError('Wrong password')
  }

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-16 max-w-md">
        <Card>
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-full">🔒 HIDDEN ADMIN</span>
          <h1 className="font-display text-3xl uppercase mt-3">Coach <span className="text-fire">Login</span></h1>
          <p className="text-xs text-stone-400 mt-1">This page is not linked anywhere. Only you know this URL.</p>
          <form onSubmit={submit} className="space-y-3 mt-4">
            <Input label="Admin password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button className="w-full">Unlock Dashboard 🔥</Button>
          </form>
          <p className="text-[11px] text-stone-500 mt-3">Default: <code className="bg-stone-800 px-1.5 py-0.5 rounded">{ADMIN_PASSWORD}</code> — change it in <code className="bg-stone-800 px-1.5 py-0.5 rounded">src/store/useAdminStore.js</code></p>
          <Link to="/" className="text-xs text-stone-500 hover:text-rose-300 block mt-2">← Back to site</Link>
        </Card>
      </div>
    </div>
  )
}
