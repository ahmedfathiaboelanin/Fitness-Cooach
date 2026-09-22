import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../store/useAdminStore'
import { useSiteStore } from '../store/useSiteStore'
import { Card, Button } from '../components/ui'
import { DashboardLayout } from '../layouts/layout'

const inputCls = 'w-full px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-white text-sm placeholder:text-stone-500'
const labelCls = 'text-xs font-bold text-stone-400 uppercase tracking-wider'

function Field({ label, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input {...props} className={`${inputCls} mt-1`} />
    </div>
  )
}
function Area({ label, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea {...props} className={`${inputCls} mt-1`} rows={props.rows || 3} />
    </div>
  )
}

// ---------- CONTENT (coach) ----------
function ContentTab() {
  const coach = useSiteStore((s) => s.coach)
  const updateCoach = useSiteStore((s) => s.updateCoach)
  const [form, setForm] = useState(coach)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    updateCoach(form)
    alert('Saved ✅ — written to src/data/site.json (when running npm run dev)')
  }
  return (
    <Card className="space-y-3">
      <h3 className="font-display text-xl uppercase">Site content 🔥 (EN + AR)</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name (EN)" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <Field label="Name (AR)" value={form.name_ar || ''} onChange={(e) => set('name_ar', e.target.value)} />
        <Field label="First name (EN)" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
        <Field label="First name (AR)" value={form.firstName_ar || ''} onChange={(e) => set('firstName_ar', e.target.value)} />
        <Field label="Title (EN)" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <Field label="Title (AR)" value={form.title_ar || ''} onChange={(e) => set('title_ar', e.target.value)} />
        <Field label="Tagline (EN)" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
        <Field label="Tagline (AR)" value={form.tagline_ar || ''} onChange={(e) => set('tagline_ar', e.target.value)} />
        <Field label="Location (EN)" value={form.location} onChange={(e) => set('location', e.target.value)} />
        <Field label="Location (AR)" value={form.location_ar || ''} onChange={(e) => set('location_ar', e.target.value)} />
        <Field label="WhatsApp display" value={form.whatsappDisplay} onChange={(e) => set('whatsappDisplay', e.target.value)} />
        <Field label="WhatsApp number (digits, e.g. 201...)" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} />
        <Field label="Avatar URL" value={form.avatar} onChange={(e) => set('avatar', e.target.value)} />
      </div>
      <Field label="Cover URL" value={form.cover} onChange={(e) => set('cover', e.target.value)} />
      <Area label="Bio (EN)" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} />
      <Area label="Bio (AR)" value={form.bio_ar || ''} onChange={(e) => set('bio_ar', e.target.value)} rows={3} />
      <Area label="Stats (one per line: value | label)" value={form.stats.map((s) => `${s.value} | ${s.label}`).join('\n')} onChange={(e) => set('stats', e.target.value.split('\n').map((l) => { const [value, label] = l.split('|').map((x) => (x || '').trim()); return { value: value || '', label: label || '' } }).filter((x) => x.value))} rows={4} />
      <Area label="Certifications EN (comma separated)" value={form.certifications.join(', ')} onChange={(e) => set('certifications', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
      <Area label="Certifications AR (comma separated)" value={(form.certifications_ar || []).join(', ')} onChange={(e) => set('certifications_ar', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
      <Area label="Specializations EN (comma separated)" value={form.specializations.join(', ')} onChange={(e) => set('specializations', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
      <Area label="Specializations AR (comma separated)" value={(form.specializations_ar || []).join(', ')} onChange={(e) => set('specializations_ar', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
      <Button onClick={save}>Save content ✅</Button>
    </Card>
  )
}

// ---------- PACKAGES ----------
function PackagesTab() {
  const packages = useSiteStore((s) => s.packages)
  const { addPackage, updatePackage, deletePackage } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', price: '', period: '', period_ar: '', tag: '', tag_ar: '', whatsappText: '', whatsappText_ar: '', highlight: false, features: '', features_ar: '' })
  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ ...p, features: (p.features || []).join('\n'), features_ar: (p.features_ar || []).join('\n') })
  }
  const save = () => {
    const payload = { ...form, features: String(form.features).split('\n').map((x) => x.trim()).filter(Boolean), features_ar: String(form.features_ar || '').split('\n').map((x) => x.trim()).filter(Boolean) }
    if (editing) updatePackage(editing, payload)
    else addPackage(payload)
    setEditing(null)
    setForm({ name: '', name_ar: '', price: '', period: '', period_ar: '', tag: '', tag_ar: '', whatsappText: '', whatsappText_ar: '', highlight: false, features: '', features_ar: '' })
  }
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3">{editing ? 'Edit package' : 'Add package'} 📦 (EN + AR)</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name EN" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Online Coaching" />
          <Field label="Name AR" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="التدريب الأونلاين" />
          <Field label="Tag EN" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Most Popular" />
          <Field label="Tag AR" value={form.tag_ar} onChange={(e) => setForm({ ...form, tag_ar: e.target.value })} placeholder="الأكثر طلباً" />
          <Field label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500 EGP" />
          <Field label="Period EN" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="/month" />
          <Field label="Period AR" value={form.period_ar} onChange={(e) => setForm({ ...form, period_ar: e.target.value })} placeholder="/شهر" />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area label="WhatsApp text EN" value={form.whatsappText} onChange={(e) => setForm({ ...form, whatsappText: e.target.value })} rows={2} />
          <Area label="WhatsApp text AR" value={form.whatsappText_ar} onChange={(e) => setForm({ ...form, whatsappText_ar: e.target.value })} rows={2} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area label="Features EN (one per line)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} />
          <Area label="Features AR (one per line)" value={form.features_ar} onChange={(e) => setForm({ ...form, features_ar: e.target.value })} rows={4} />
        </div>
        <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={!!form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} /> Highlighted</label>
        <div className="flex gap-2 mt-3">
          <Button onClick={save}>{editing ? 'Save ✅' : '+ Add 📦'}</Button>
          {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm({ name: '', name_ar: '', price: '', period: '', period_ar: '', tag: '', tag_ar: '', whatsappText: '', whatsappText_ar: '', highlight: false, features: '', features_ar: '' }) }}>Cancel</Button>}
        </div>
      </Card>
      {packages.map((p) => (
        <Card key={p.id} className="flex justify-between items-start gap-3">
          <div><b className="text-white">{p.name}</b> <span className="text-rose-400 text-sm">{p.price}{p.period}</span><div className="text-xs text-stone-400">{p.features.join(' • ')}</div></div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => startEdit(p)} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">Edit</button>
            <button onClick={() => confirm('Delete this package?') && deletePackage(p.id)} className="text-xs text-red-400 px-3 py-1.5">Delete</button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ---------- RESULTS ----------
function ResultsTab() {
  const list = useSiteStore((s) => s.transformations)
  const { addResult, updateResult, deleteResult } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', result: '', result_ar: '', goal: '', goal_ar: '', image: '', text: '', text_ar: '' })
  const save = () => {
    if (!form.name || !form.result) return alert('Name + result required')
    if (editing) updateResult(editing, form)
    else addResult(form)
    setEditing(null)
    setForm({ name: '', name_ar: '', result: '', result_ar: '', goal: '', goal_ar: '', image: '', text: '', text_ar: '' })
  }
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3">{editing ? 'Edit result' : 'Add result'} 🏆 (EN + AR)</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Client name EN" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmed — Fat Loss" />
          <Field label="Client name AR" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="أحمد — تخسيس" />
          <Field label="Result EN" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="-14 kg in 16 weeks" />
          <Field label="Result AR" value={form.result_ar} onChange={(e) => setForm({ ...form, result_ar: e.target.value })} placeholder="-14 كجم في 16 أسبوع" />
          <Field label="Goal tag EN" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Fat Loss" />
          <Field label="Goal tag AR" value={form.goal_ar} onChange={(e) => setForm({ ...form, goal_ar: e.target.value })} placeholder="تخسيس" />
          <Field label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area label="Story EN" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} />
          <Area label="Story AR" value={form.text_ar} onChange={(e) => setForm({ ...form, text_ar: e.target.value })} rows={2} />
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={save}>{editing ? 'Save ✅' : '+ Add 🏆'}</Button>
          {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm({ name: '', name_ar: '', result: '', result_ar: '', goal: '', goal_ar: '', image: '', text: '', text_ar: '' }) }}>Cancel</Button>}
        </div>
      </Card>
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex gap-3">
              {r.image && <img src={r.image} className="w-16 h-16 rounded-xl object-cover" alt="" />}
              <div className="flex-1"><b className="text-white text-sm">{r.name}</b><div className="text-rose-400 text-sm font-bold">{r.result}</div><div className="text-xs text-stone-400">{r.text}</div></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditing(r.id); setForm(r) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">Edit</button>
              <button onClick={() => confirm('Delete?') && deleteResult(r.id)} className="text-xs text-red-400 px-3 py-1.5">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------- TESTIMONIALS / SERVICES / PROGRAMS ----------
function TestimonialsTab() {
  const list = useSiteStore((s) => s.testimonials)
  const { addTestimonial, deleteTestimonial } = useSiteStore()
  const [form, setForm] = useState({ name: '', role: '', avatar: '', text: '' })
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3">Add review 💬</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="mt-3"><Field label="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
        <div className="mt-3"><Area label="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
        <Button className="mt-3" onClick={() => { if (!form.name || !form.text) return alert('Name + text required'); addTestimonial(form); setForm({ name: '', role: '', avatar: '', text: '' }) }}>+ Add review</Button>
      </Card>
      {list.map((t) => (
        <Card key={t.id} className="flex justify-between gap-3"><div className="text-sm"><b className="text-white">{t.name}</b> <span className="text-stone-400">— {t.role}</span><p className="text-stone-300 mt-1">“{t.text}”</p></div><button onClick={() => confirm('Delete?') && deleteTestimonial(t.id)} className="text-xs text-red-400 shrink-0">Delete</button></Card>
      ))}
    </div>
  )
}

function ServicesTab() {
  const list = useSiteStore((s) => s.services)
  const { addService, deleteService } = useSiteStore()
  const [form, setForm] = useState({ title: '', desc: '', icon: '🔥' })
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3">Add service ⚡</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label="Desc" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </div>
        <Button className="mt-3" onClick={() => { if (!form.title) return alert('Title required'); addService(form); setForm({ title: '', desc: '', icon: '🔥' }) }}>+ Add</Button>
      </Card>
      {list.map((sv, i) => (
        <Card key={i} className="flex justify-between"><span className="text-sm">{sv.icon} <b className="text-white">{sv.title}</b> <span className="text-stone-400">— {sv.desc}</span></span><button onClick={() => confirm('Delete?') && deleteService(i)} className="text-xs text-red-400">Delete</button></Card>
      ))}
    </div>
  )
}

function ProgramsTab() {
  const list = useSiteStore((s) => s.programs)
  const { addProgram, deleteProgram, updateProgram } = useSiteStore()
  const [form, setForm] = useState({ title: '', level: 'Beginner', goal: 'fat loss', durationWeeks: 4, daysPerWeek: 3, durationMin: 30, image: '', description: '', popular: false })
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3">Add program 🏋️</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div><label className={labelCls}>Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={`${inputCls} mt-1`}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
          <Field label="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          <Field label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Field label="Weeks" type="number" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: +e.target.value })} />
          <Field label="Days/week" type="number" value={form.daysPerWeek} onChange={(e) => setForm({ ...form, daysPerWeek: +e.target.value })} />
        </div>
        <div className="mt-3"><Area label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> Show on homepage</label>
        <Button className="mt-3" onClick={() => { if (!form.title) return alert('Title required'); addProgram(form); setForm({ title: '', level: 'Beginner', goal: 'fat loss', durationWeeks: 4, daysPerWeek: 3, durationMin: 30, image: '', description: '', popular: false }) }}>+ Add program</Button>
      </Card>
      {list.map((p) => (
        <Card key={p.id} className="flex justify-between items-center gap-3">
          <div className="text-sm"><b className="text-white">{p.title}</b> <span className="text-stone-400">• {p.level} • {p.goal}</span></div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => updateProgram(p.id, { popular: !p.popular })} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{p.popular ? '★ Homepage' : '☆ Homepage'}</button>
            <button onClick={() => confirm('Delete?') && deleteProgram(p.id)} className="text-xs text-red-400 px-2 py-1.5">Delete</button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function FileStatus() {
  const fileBackend = useSiteStore((s) => s.fileBackend)
  const lastFileSave = useSiteStore((s) => s.lastFileSave)
  const saveToFile = useSiteStore((s) => s.saveToFile)
  if (fileBackend === 'connected') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
        <span className="text-green-400 font-bold">● Auto-save to site.json ON</span>
        <span className="text-stone-400">every edit writes to src/data/site.json{lastFileSave ? ` • last saved ${lastFileSave}` : ''}</span>
        <button onClick={() => saveToFile()} className="ms-auto bg-green-600/20 border border-green-500/40 px-2.5 py-1 rounded-lg font-bold hover:bg-green-600/30">Save now 💾</button>
      </div>
    )
  }
  if (fileBackend === 'checking') {
    return <div className="text-xs text-stone-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2">◌ Checking file connection…</div>
  }
  return (
    <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
      <span className="text-amber-300 font-bold">● Dev file API unavailable</span>
      <span className="text-stone-400"> — are you running <code className="bg-stone-800 px-1 rounded">npm run dev</code>? Edits are kept in this browser only; use Export below as backup.</span>
    </div>
  )
}

function SettingsTab() {
  const exportJSON = useSiteStore((s) => s.exportJSON)
  const importJSON = useSiteStore((s) => s.importJSON)
  const resetAll = useSiteStore((s) => s.resetAll)
  const [text, setText] = useState('')
  const download = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'site.json'
    a.click()
  }
  return (
    <div className="space-y-4">
      <FileStatus />
      <Card>
        <h3 className="font-display text-xl uppercase">Save to JSON file 💾</h3>
        <p className="text-xs text-stone-400 mt-1">While running <code className="bg-stone-800 px-1 rounded">npm run dev</code>, every edit above is written straight into <b className="text-white">src/data/site.json</b> — no Export step needed. Export below is only a backup (e.g. for static hosting).</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={download}>⬇ Export site.json (backup)</Button>
          <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(exportJSON()); alert('Copied ✅ — paste into src/data/site.json') }}>📋 Copy JSON</Button>
          <Button variant="secondary" onClick={() => confirm('Reset everything to defaults?') && resetAll()}>↩ Reset defaults</Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-xl uppercase mb-2">Import JSON</h3>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder='Paste exported site.json here...' className="w-full px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-xs font-mono" />
        <Button className="mt-3" onClick={() => { try { importJSON(JSON.parse(text)); alert('Imported ✅') } catch { alert('Invalid JSON') } }}>Import ✅</Button>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const logout = useAdminStore((s) => s.logout)
  const nav = useNavigate()
  const [tab, setTab] = useState('content')
  const tabs = [
    { key: 'content', label: 'Content', icon: '📝' },
    { key: 'packages', label: 'Packages', icon: '📦' },
    { key: 'results', label: 'Results', icon: '🏆' },
    { key: 'testimonials', label: 'Reviews', icon: '💬' },
    { key: 'services', label: 'Services', icon: '⚡' },
    { key: 'programs', label: 'Programs', icon: '🏋️' },
    { key: 'settings', label: 'JSON / Save', icon: '💾' },
  ]
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-4 flex justify-between items-center">
        <h1 className="font-display text-2xl uppercase">🔒 Admin <span className="text-fire">Dashboard</span></h1>
        <div className="flex gap-2">
          <button onClick={() => nav('/')} className="text-xs bg-white/10 px-3 py-2 rounded-xl">View site →</button>
          <button onClick={() => { logout(); nav('/elsum-admin/login') }} className="text-xs bg-red-600 px-3 py-2 rounded-xl font-bold">Logout</button>
        </div>
      </div>
      <div className="container-x pt-4"><FileStatus /></div>
      <DashboardLayout tabs={tabs.map((t) => ({ ...t, onClick: () => setTab(t.key) }))}>
        {tab === 'content' && <ContentTab />}
        {tab === 'packages' && <PackagesTab />}
        {tab === 'results' && <ResultsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'programs' && <ProgramsTab />}
        {tab === 'settings' && <SettingsTab />}
      </DashboardLayout>
    </div>
  )
}
