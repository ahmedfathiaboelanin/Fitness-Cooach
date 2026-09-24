import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { FileText, Package, Trophy, MessageCircle, Zap, Dumbbell, Save, Lock, Download, Copy, RotateCcw, Upload, Plus, Star, Pill, FileSpreadsheet, FileJson, ArrowRight, Laptop, Salad, Video, Flame } from 'lucide-react'
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
    alert('Saved! Written to src/data/site.json (when running npm run dev)')
  }
  return (
    <Card className="space-y-3">
      <h3 className="font-display text-xl uppercase flex items-center gap-2"><FileText size={20} className="text-rose-400" /> Site content (EN + AR)</h3>
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
        <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2"><Package size={20} className="text-rose-400" /> {editing ? 'Edit package' : 'Add package'} (EN + AR)</h3>
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
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> Save</> : <><Plus size={16} /> Add package</>}</span></Button>
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
        <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2"><Trophy size={20} className="text-rose-400" /> {editing ? 'Edit result' : 'Add result'} (EN + AR)</h3>
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
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> Save</> : <><Plus size={16} /> Add result</>}</span></Button>
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
        <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2"><MessageCircle size={20} className="text-rose-400" /> Add review</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="mt-3"><Field label="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
        <div className="mt-3"><Area label="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
        <Button className="mt-3" onClick={() => { if (!form.name || !form.text) return alert('Name + text required'); addTestimonial(form); setForm({ name: '', role: '', avatar: '', text: '' }) }}><span className="inline-flex items-center gap-1.5"><Plus size={16} /> Add review</span></Button>
      </Card>
      {list.map((t) => (
        <Card key={t.id} className="flex justify-between gap-3"><div className="text-sm"><b className="text-white">{t.name}</b> <span className="text-stone-400">— {t.role}</span><p className="text-stone-300 mt-1">“{t.text}”</p></div><button onClick={() => confirm('Delete?') && deleteTestimonial(t.id)} className="text-xs text-red-400 shrink-0">Delete</button></Card>
      ))}
    </div>
  )
}

const SERVICE_ICON_OPTIONS = [
  { value: 'dumbbell', label: 'Gym', Icon: Dumbbell },
  { value: 'laptop', label: 'Online', Icon: Laptop },
  { value: 'salad', label: 'Nutrition', Icon: Salad },
  { value: 'video', label: 'Video review', Icon: Video },
  { value: 'flame', label: 'General', Icon: Flame },
]

function ServicesTab() {
  const list = useSiteStore((s) => s.services)
  const { addService, deleteService } = useSiteStore()
  const [form, setForm] = useState({ title: '', desc: '', icon: 'dumbbell' })
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2"><Zap size={20} className="text-rose-400" /> Add service</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className={labelCls}>Icon</label><select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={`${inputCls} mt-1`}>{SERVICE_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label="Desc" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </div>
        <Button className="mt-3" onClick={() => { if (!form.title) return alert('Title required'); addService(form); setForm({ title: '', desc: '', icon: 'dumbbell' }) }}><span className="inline-flex items-center gap-1.5"><Plus size={16} /> Add</span></Button>
      </Card>
      {list.map((sv, i) => {
        const Icon = (SERVICE_ICON_OPTIONS.find((o) => o.value === sv.icon) || { Icon: Flame }).Icon
        return (
        <Card key={i} className="flex justify-between items-center"><span className="text-sm flex items-center gap-2"><Icon size={16} className="text-rose-400 shrink-0" /> <b className="text-white">{sv.title}</b> <span className="text-stone-400">— {sv.desc}</span></span><button onClick={() => confirm('Delete?') && deleteService(i)} className="text-xs text-red-400 shrink-0">Delete</button></Card>
        )
      })}
    </div>
  )
}

// ---------- SUPPLEMENTS (Excel upload replaces the whole list) ----------
const SUPP_COLS = {
  name: ['name', 'الاسم', 'product', 'المنتج'],
  name_ar: ['name_ar', 'الاسم بالعربية'],
  price: ['price', 'السعر'],
  category: ['category', 'الفئة', 'القسم'],
  category_ar: ['category_ar', 'الفئة بالعربية'],
  description: ['description', 'الوصف'],
  description_ar: ['description_ar', 'الوصف بالعربية'],
  image: ['image', 'img', 'صورة', 'رابط الصورة'],
}

function rowGet(row, keys) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== '') return String(row[k]).trim()
  }
  return ''
}

function SupplementsTab() {
  const list = useSiteStore((s) => s.supplements)
  const { setSupplements, addSupplement, updateSupplement, deleteSupplement } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', price: '', category: '', category_ar: '', description: '', description_ar: '', image: '' })
  const [msg, setMsg] = useState('')

  const downloadTemplate = () => {
    const rows = [{
      name: 'Whey Protein 2kg', name_ar: 'واي بروتين 2 كجم', price: '2400 EGP',
      category: 'Protein', category_ar: 'بروتين',
      description: '24g protein per scoop.', description_ar: '24 جم بروتين لكل سكوب.',
      image: 'https://...',
    }]
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Supplements')
    XLSX.writeFile(wb, 'supplements-template.xlsx')
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setMsg('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        const norm = rows.map((r) => {
          const o = {}
          Object.entries(r).forEach(([k, v]) => { o[String(k).trim().toLowerCase()] = v })
          return o
        })
        const items = norm
          .map((r, i) => ({
            id: `sup-xls-${Date.now().toString(36)}-${i}`,
            name: rowGet(r, SUPP_COLS.name),
            name_ar: rowGet(r, SUPP_COLS.name_ar),
            price: rowGet(r, SUPP_COLS.price),
            category: rowGet(r, SUPP_COLS.category),
            category_ar: rowGet(r, SUPP_COLS.category_ar),
            description: rowGet(r, SUPP_COLS.description),
            description_ar: rowGet(r, SUPP_COLS.description_ar),
            image: rowGet(r, SUPP_COLS.image),
          }))
          .filter((s) => s.name)
        if (!items.length) {
          setMsg('No valid rows found — the sheet needs at least a "name" column.')
          return
        }
        if (!confirm(`Replace all ${list.length} supplements with ${items.length} from "${f.name}"?`)) return
        setSupplements(items)
        setMsg(`Imported ${items.length} supplements from Excel — live on the site now.`)
      } catch {
        setMsg('Could not read that file. Use .xlsx, .xls or .csv.')
      }
      e.target.value = ''
    }
    reader.readAsArrayBuffer(f)
  }

  const saveOne = () => {
    if (!form.name.trim()) return alert('Name required')
    if (editing) updateSupplement(editing, form)
    else addSupplement(form)
    setEditing(null)
    setForm({ name: '', name_ar: '', price: '', category: '', category_ar: '', description: '', description_ar: '', image: '' })
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-xl uppercase mb-1 flex items-center gap-2"><FileSpreadsheet size={20} className="text-rose-400" /> Supplements from Excel</h3>
        <p className="text-xs text-stone-400">Upload an Excel sheet to <b className="text-white">replace</b> the whole shop list. Columns: <code className="bg-stone-800 px-1 rounded">name, name_ar, price, category, category_ar, description, description_ar, image</code> (Arabic headers الاسم/السعر/الفئة/الوصف/صورة also work).</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <label className="btn-fire text-white text-sm font-extrabold px-4 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
            <Upload size={16} /> Upload Excel sheet
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} className="hidden" />
          </label>
          <Button variant="secondary" onClick={downloadTemplate}><span className="inline-flex items-center gap-1.5"><Download size={16} /> Template</span></Button>
        </div>
        {msg && <p className="text-xs text-green-400 font-bold mt-2">{msg}</p>}
      </Card>

      <Card>
        <h3 className="font-display text-xl uppercase mb-3 flex items-center gap-2"><Pill size={20} className="text-rose-400" /> {editing ? 'Edit supplement' : 'Add supplement manually'}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name EN" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Name AR" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <Field label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1800 EGP" />
          <Field label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Field label="Category EN" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Field label="Category AR" value={form.category_ar} onChange={(e) => setForm({ ...form, category_ar: e.target.value })} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area label="Description EN" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Area label="Description AR" value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={2} />
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={saveOne}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> Save</> : <><Plus size={16} /> Add supplement</>}</span></Button>
          {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm({ name: '', name_ar: '', price: '', category: '', category_ar: '', description: '', description_ar: '', image: '' }) }}>Cancel</Button>}
        </div>
      </Card>

      {list.map((s) => (
        <Card key={s.id} className="flex justify-between items-center gap-3">
          <div className="text-sm"><b className="text-white">{s.name}</b> <span className="text-rose-400 font-bold">{s.price}</span> <span className="text-stone-400">• {s.category}</span></div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setEditing(s.id); setForm({ name: s.name || '', name_ar: s.name_ar || '', price: s.price || '', category: s.category || '', category_ar: s.category_ar || '', description: s.description || '', description_ar: s.description_ar || '', image: s.image || '' }) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">Edit</button>
            <button onClick={() => confirm('Delete?') && deleteSupplement(s.id)} className="text-xs text-red-400 px-2 py-1.5">Delete</button>
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
        <span className="text-green-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> Auto-save to site.json ON</span>
        <span className="text-stone-400">every edit writes to src/data/site.json{lastFileSave ? ` • last saved ${lastFileSave}` : ''}</span>
        <button onClick={() => saveToFile()} className="ms-auto bg-green-600/20 border border-green-500/40 px-2.5 py-1 rounded-lg font-bold hover:bg-green-600/30 inline-flex items-center gap-1.5"><Save size={13} /> Save now</button>
      </div>
    )
  }
  if (fileBackend === 'checking') {
    return <div className="text-xs text-stone-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2">Checking file connection…</div>
  }
  return (
    <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
      <span className="text-amber-300 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" /> Dev file API unavailable</span>
      <span className="text-stone-400"> — are you running <code className="bg-stone-800 px-1 rounded">npm run dev</code>? Edits are kept in this browser only; use Export below as backup.</span>
    </div>
  )
}

function splitList(v) {
  const lines = String(v ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
  if (lines.length <= 1 && String(v ?? '').includes('|')) {
    return String(v).split('|').map((x) => x.trim()).filter(Boolean)
  }
  return lines
}

function truthy(v) {
  return ['true', '1', 'yes', 'y', '✓'].includes(String(v ?? '').trim().toLowerCase())
}

// Full-site Excel sheets: which sheet name belongs to which collection
function matchSheet(name) {
  const n = String(name).toLowerCase()
  if (/package|باق/.test(n)) return 'packages'
  if (/transformation|result|نتيج|تحول/.test(n)) return 'transformations'
  if (/testimonial|review|رأي|اراء|تقييم/.test(n)) return 'testimonials'
  if (/service|خدم/.test(n)) return 'services'
  if (/supplement|مكمل/.test(n)) return 'supplements'
  return null
}

function SettingsTab() {
  const exportJSON = useSiteStore((s) => s.exportJSON)
  const importJSON = useSiteStore((s) => s.importJSON)
  const resetAll = useSiteStore((s) => s.resetAll)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const download = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'site.json'
    a.click()
  }

  const onJsonFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importJSON(JSON.parse(ev.target.result))
        setMsg(`JSON file "${f.name}" applied — live on the site now.`)
      } catch {
        setMsg('That file is not valid JSON.')
      }
      e.target.value = ''
    }
    reader.readAsText(f)
  }

  const exportExcel = () => {
    const s = JSON.parse(useSiteStore.getState().exportJSON())
    const wb = XLSX.utils.book_new()
    const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name)
    add('Packages', s.packages.map((p) => ({
      name: p.name, name_ar: p.name_ar, price: p.price, period: p.period, period_ar: p.period_ar,
      tag: p.tag, tag_ar: p.tag_ar, features: (p.features || []).join('\n'), features_ar: (p.features_ar || []).join('\n'),
      whatsappText: p.whatsappText, whatsappText_ar: p.whatsappText_ar, highlight: p.highlight ? 'yes' : '',
    })))
    add('Results', s.transformations.map((r) => ({
      name: r.name, name_ar: r.name_ar, result: r.result, result_ar: r.result_ar,
      goal: r.goal, goal_ar: r.goal_ar, image: r.image, text: r.text, text_ar: r.text_ar,
    })))
    add('Testimonials', s.testimonials.map((t) => ({
      name: t.name, name_ar: t.name_ar, role: t.role, role_ar: t.role_ar,
      avatar: t.avatar, text: t.text, text_ar: t.text_ar,
    })))
    add('Services', s.services.map((x) => ({
      title: x.title, title_ar: x.title_ar, desc: x.desc, desc_ar: x.desc_ar, icon: x.icon,
    })))
    add('Supplements', s.supplements.map((x) => ({
      name: x.name, name_ar: x.name_ar, price: x.price, category: x.category, category_ar: x.category_ar,
      description: x.description, description_ar: x.description_ar, image: x.image,
    })))
    XLSX.writeFile(wb, 'site-export.xlsx')
  }

  const onExcelFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setMsg('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const norm = (ws) => XLSX.utils.sheet_to_json(ws, { defval: '' }).map((r) => {
          const o = {}
          Object.entries(r).forEach(([k, v]) => { o[String(k).trim().toLowerCase()] = v })
          return o
        })
        const stamp = Date.now().toString(36)
        let n = 0
        const pick = (r, ...ks) => rowGet(r, ks)
        const patch = {}
        const notes = []
        wb.SheetNames.forEach((sn) => {
          const key = matchSheet(sn)
          if (!key) return
          const rows = norm(wb.Sheets[sn])
          if (key === 'packages') {
            patch.packages = rows.map((r) => ({
              id: `pkg-xls-${stamp}-${n++}`, name: pick(r, ...SUPP_COLS.name), name_ar: pick(r, ...['name_ar', 'الاسم بالعربية']),
              price: pick(r, ...SUPP_COLS.price), period: pick(r, 'period', '/month', 'لكل'), period_ar: pick(r, 'period_ar', 'لكل بالعربية'),
              tag: pick(r, 'tag', 'الوسم'), tag_ar: pick(r, 'tag_ar', 'الوسم بالعربية'),
              features: splitList(pick(r, 'features', 'المميزات')), features_ar: splitList(pick(r, 'features_ar', 'المميزات بالعربية')),
              whatsappText: pick(r, 'whatsapptext', 'واتساب'), whatsappText_ar: pick(r, 'whatsapptext_ar', 'واتساب بالعربية'),
              highlight: truthy(pick(r, 'highlight', 'مميز')),
            })).filter((x) => x.name)
          } else if (key === 'transformations') {
            patch.transformations = rows.map((r) => ({
              id: `res-xls-${stamp}-${n++}`, name: pick(r, ...SUPP_COLS.name), name_ar: pick(r, ...['name_ar', 'الاسم بالعربية']),
              result: pick(r, 'result', 'النتيجة'), result_ar: pick(r, 'result_ar', 'النتيجة بالعربية'),
              goal: pick(r, 'goal', 'الهدف'), goal_ar: pick(r, 'goal_ar', 'الهدف بالعربية'),
              image: pick(r, ...SUPP_COLS.image), text: pick(r, 'text', 'الوصف'), text_ar: pick(r, 'text_ar', 'الوصف بالعربية'),
            })).filter((x) => x.name)
          } else if (key === 'testimonials') {
            patch.testimonials = rows.map((r) => ({
              id: `tes-xls-${stamp}-${n++}`, name: pick(r, ...SUPP_COLS.name), name_ar: pick(r, ...['name_ar', 'الاسم بالعربية']),
              role: pick(r, 'role', 'الدور'), role_ar: pick(r, 'role_ar', 'الدور بالعربية'),
              avatar: pick(r, 'avatar', 'الصورة'), text: pick(r, 'text', 'النص'), text_ar: pick(r, 'text_ar', 'النص بالعربية'),
            })).filter((x) => x.name)
          } else if (key === 'services') {
            patch.services = rows.map((r) => ({
              title: pick(r, 'title', 'العنوان'), title_ar: pick(r, 'title_ar', 'العنوان بالعربية'),
              desc: pick(r, 'desc', 'الوصف'), desc_ar: pick(r, 'desc_ar', 'الوصف بالعربية'),
              icon: pick(r, 'icon', 'الأيقونة') || 'flame',
            })).filter((x) => x.title)
          } else if (key === 'supplements') {
            patch.supplements = rows.map((r) => ({
              id: `sup-xls-${stamp}-${n++}`, name: pick(r, ...SUPP_COLS.name), name_ar: pick(r, ...['name_ar', 'الاسم بالعربية']),
              price: pick(r, ...SUPP_COLS.price), category: pick(r, ...SUPP_COLS.category), category_ar: pick(r, ...['category_ar', 'الفئة بالعربية']),
              description: pick(r, ...['description', 'الوصف']), description_ar: pick(r, ...['description_ar', 'الوصف بالعربية']),
              image: pick(r, ...SUPP_COLS.image),
            })).filter((x) => x.name)
          }
          if (patch[key]) notes.push(`${sn}: ${patch[key].length}`)
        })
        if (!notes.length) {
          setMsg('No recognized sheets. Name sheets: Packages, Results, Testimonials, Services, Supplements.')
          return
        }
        if (!confirm(`Apply Excel data?\n${notes.join('\n')}\nSheets missing from the file stay unchanged.`)) return
        const current = JSON.parse(useSiteStore.getState().exportJSON())
        useSiteStore.getState().importJSON({ ...current, ...patch })
        setMsg(`Applied — ${notes.join(' • ')}. Live on the site now.`)
      } catch {
        setMsg('Could not read that file. Use .xlsx, .xls or .csv.')
      }
      e.target.value = ''
    }
    reader.readAsArrayBuffer(f)
  }

  return (
    <div className="space-y-4">
      <FileStatus />
      <Card>
        <h3 className="font-display text-xl uppercase flex items-center gap-2"><Save size={20} className="text-rose-400" /> Save to JSON file</h3>
        <p className="text-xs text-stone-400 mt-1">While running <code className="bg-stone-800 px-1 rounded">npm run dev</code>, every edit above is written straight into <b className="text-white">src/data/site.json</b> — no Export step needed. Export below is only a backup (e.g. for static hosting).</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={download}><span className="inline-flex items-center gap-1.5"><Download size={16} /> Export site.json (backup)</span></Button>
          <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(exportJSON()); alert('Copied! Paste into src/data/site.json') }}><span className="inline-flex items-center gap-1.5"><Copy size={16} /> Copy JSON</span></Button>
          <Button variant="secondary" onClick={() => confirm('Reset everything to defaults?') && resetAll()}><span className="inline-flex items-center gap-1.5"><RotateCcw size={16} /> Reset defaults</span></Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-xl uppercase mb-1 flex items-center gap-2"><FileSpreadsheet size={20} className="text-rose-400" /> Excel: edit the whole site</h3>
        <p className="text-xs text-stone-400">Export everything to one <b className="text-white">.xlsx</b> workbook (sheets: Packages, Results, Testimonials, Services, Supplements), edit it in Excel, then upload it back — only the sheets inside get replaced.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={exportExcel}><span className="inline-flex items-center gap-1.5"><Download size={16} /> Export site.xlsx</span></Button>
          <label className="btn-fire text-white text-sm font-extrabold px-4 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
            <Upload size={16} /> Upload Excel file
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onExcelFile} className="hidden" />
          </label>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-xl uppercase mb-1 flex items-center gap-2"><FileJson size={20} className="text-rose-400" /> Import JSON</h3>
        <p className="text-xs text-stone-400">Upload a <b className="text-white">site.json</b> file or paste its content below.</p>
        <label className="mt-3 inline-flex items-center gap-1.5 text-sm bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl cursor-pointer font-bold hover:bg-white/20">
          <Upload size={16} /> Upload JSON file
          <input type="file" accept=".json,application/json" onChange={onJsonFile} className="hidden" />
        </label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder='...or paste exported site.json here' className="w-full mt-3 px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-xs font-mono" />
        <Button className="mt-3" onClick={() => { try { importJSON(JSON.parse(text)); setMsg('Pasted JSON applied.'); setText('') } catch { setMsg('That text is not valid JSON.') } }}><span className="inline-flex items-center gap-1.5"><Upload size={16} /> Import pasted JSON</span></Button>
        {msg && <p className="text-xs text-green-400 font-bold mt-2">{msg}</p>}
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  const logout = useAdminStore((s) => s.logout)
  const nav = useNavigate()
  const [tab, setTab] = useState('content')
  const tabs = [
    { key: 'content', label: 'Content', Icon: FileText },
    { key: 'packages', label: 'Packages', Icon: Package },
    { key: 'results', label: 'Results', Icon: Trophy },
    { key: 'testimonials', label: 'Reviews', Icon: MessageCircle },
    { key: 'services', label: 'Services', Icon: Zap },
    { key: 'supplements', label: 'Supplements', Icon: Pill },
    { key: 'settings', label: 'JSON / Save', Icon: Save },
  ]
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-4 flex justify-between items-center">
        <h1 className="font-display text-2xl uppercase flex items-center gap-2"><Lock size={22} className="text-rose-400" /> Admin <span className="text-fire">Dashboard</span></h1>
        <div className="flex gap-2">
          <button onClick={() => nav('/')} className="text-xs bg-white/10 px-3 py-2 rounded-xl inline-flex items-center gap-1.5">View site <ArrowRight size={13} /></button>
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
        {tab === 'supplements' && <SupplementsTab />}
        {tab === 'settings' && <SettingsTab />}
      </DashboardLayout>
    </div>
  )
}
