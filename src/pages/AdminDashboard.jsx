import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { FileText, Package, Trophy, MessageCircle, Zap, Dumbbell, Save, Lock, Download, RotateCcw, Upload, Plus, Pill, FileSpreadsheet, FileJson, ArrowRight, Laptop, Salad, Video, Flame, RefreshCw, BookOpen, Globe, ShieldCheck } from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'
import { useSiteStore } from '../store/useSiteStore'
import { usePrefsStore } from '../store/usePrefsStore'
import { useT } from '../i18n/useT'
import { Card, Button } from '../components/ui'
import { parseWorkbook, coachToSheetRow } from '../utils/adminIO'

const inputCls = 'w-full px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-white text-sm placeholder:text-stone-500'
const labelCls = 'text-xs font-bold text-stone-400 uppercase tracking-wider'

// t('admin.<key>') shortcut
function useA() {
  const { t, isAR, lang } = useT()
  return { a: (key) => t(`admin.${key}`), isAR, lang }
}

function Field({ label, ltr, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input {...props} dir={ltr ? 'ltr' : undefined} className={`${inputCls} mt-1`} />
    </div>
  )
}
function Area({ label, ltr, ...props }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea {...props} dir={ltr ? 'ltr' : undefined} className={`${inputCls} mt-1`} rows={props.rows || 3} />
    </div>
  )
}

/* Small hint under each form pointing to bulk editing */
function BulkHint({ goData }) {
  const { a } = useA()
  return (
    <p className="text-xs text-stone-500">
      {a('bulkHint')} <button onClick={goData} className="text-[#5B9CFF] font-bold underline">{a('bulkLink')}</button>
    </p>
  )
}

function TabTitle({ icon: Icon, title, sub }) {
  return (
    <div className="mb-4 min-w-0">
      <h2 className="font-display text-xl sm:text-2xl uppercase flex items-center gap-2">
        <Icon size={22} className="text-rose-400 shrink-0" /> <span className="min-w-0">{title}</span>
      </h2>
      {sub && <p className="text-sm text-stone-400 mt-1">{sub}</p>}
    </div>
  )
}

// ---------- GUIDE (user manual) ----------
function GuideTab({ go }) {
  const { t } = useT()
  const tips = t('admin.guideTips')
  const ways = [
    { title: t('admin.guideWay1T'), desc: t('admin.guideWay1D'), btn: t('admin.tabs.content'), to: 'content', Icon: FileText },
    { title: t('admin.guideWay2T'), desc: t('admin.guideWay2D'), btn: t('admin.tabs.data'), to: 'data', Icon: FileSpreadsheet },
    { title: t('admin.guideWay3T'), desc: t('admin.guideWay3D'), btn: t('admin.tabs.data'), to: 'data', Icon: FileJson },
  ]
  const tabRows = [
    { key: 'content', Icon: FileText },
    { key: 'packages', Icon: Package },
    { key: 'results', Icon: Trophy },
    { key: 'testimonials', Icon: MessageCircle },
    { key: 'services', Icon: Zap },
    { key: 'supplements', Icon: Pill },
    { key: 'security', Icon: ShieldCheck },
    { key: 'data', Icon: Save },
  ]
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-2xl uppercase flex items-center gap-2">
          <BookOpen size={22} className="text-rose-400" /> {t('admin.guideTitle')}
        </h2>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">{t('admin.guideIntro')}</p>
      </Card>
      <h3 className="font-display text-lg uppercase text-stone-200">{t('admin.guideStepsTitle')}</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ways.map((w) => (
          <Card key={w.title} className="flex flex-col">
            <span className="text-[#5B9CFF]"><w.Icon size={26} /></span>
            <b className="text-white mt-2">{w.title}</b>
            <p className="text-xs text-stone-400 mt-1 flex-1 leading-relaxed">{w.desc}</p>
            <Button variant="secondary" className="mt-3" onClick={() => go(w.to)}>
              {t('admin.open')}: {w.btn}
            </Button>
          </Card>
        ))}
      </div>
      <h3 className="font-display text-lg uppercase text-stone-200">{t('admin.guideTabsTitle')}</h3>
      <Card className="!p-2">
        {tabRows.map((r) => (
          <button key={r.key} onClick={() => go(r.key)} className="w-full text-start flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition">
            <r.Icon size={18} className="text-rose-400 shrink-0" />
            <span>
              <span className="block text-sm font-bold text-white">{t(`admin.tabs.${r.key}`)}</span>
              <span className="block text-xs text-stone-400">{t(`admin.tabDesc.${r.key}`)}</span>
            </span>
            <ArrowRight size={14} className="ms-auto text-stone-500 rtl:rotate-180 shrink-0" />
          </button>
        ))}
      </Card>
      <Card>
        <b className="text-white text-sm">{t('admin.guideModesTitle')}</b>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{t('admin.guideModesD')}</p>
      </Card>
      <Card>
        <b className="text-white text-sm">{t('admin.guideTipsTitle')}</b>
        <ul className="text-xs text-stone-300 mt-2 space-y-1.5">
          {Array.isArray(tips) ? tips.map((tip, i) => <li key={i} className="flex gap-2"><span className="text-[#5B9CFF] font-bold">•</span> {tip}</li>) : null}
        </ul>
      </Card>
    </div>
  )
}

// ---------- CONTENT (coach) ----------
function statToLine(s) {
  return [s.value, s.label, s.label_ar].filter((x) => x != null && String(x) !== '').join(' | ')
}
function lineToStat(l) {
  const [value, label, label_ar] = l.split('|').map((x) => (x || '').trim())
  return { value: value || '', label: label || '', label_ar: label_ar || '' }
}

function ContentTab() {
  const { a, isAR } = useA()
  const coach = useSiteStore((s) => s.coach)
  const updateCoach = useSiteStore((s) => s.updateCoach)
  const refresh = useSiteStore((s) => s.refresh)
  const lastSync = useSiteStore((s) => s.lastSync)
  const [form, setForm] = useState(coach)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (k, v) => { setDirty(true); setMsg(''); setForm((f) => ({ ...f, [k]: v })) }

  // Re-sync the form when fresh data arrives (but never clobber edits)
  useEffect(() => {
    if (!dirty) setForm(coach)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSync])

  const reload = async () => {
    await refresh()
    setForm(useSiteStore.getState().coach)
    setDirty(false)
    setMsg(a('reloaded'))
  }

  const setApproach = (i, patch) => {
    setDirty(true); setMsg('')
    setForm((f) => ({ ...f, approach: (f.approach || []).map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  }

  const save = async () => {
    await updateCoach(form)
    setDirty(false)
    setMsg(a('savedLive'))
  }

  return (
    <div className="space-y-4">
      <TabTitle icon={FileText} title={`${a('contentTitle')} ${a('enAr')}`} />
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <b className="text-white text-sm">{a('contentTitle')}</b>
          <button onClick={reload} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"><RefreshCw size={13} /> {a('reload')}</button>
        </div>
        {dirty && <p className="text-xs text-amber-300 font-bold">{a('unsaved')}</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('fNameEn')} value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
          <Field label={a('fNameAr')} value={form.name_ar || ''} onChange={(e) => set('name_ar', e.target.value)} />
          <Field ltr label={a('fFirstEn')} value={form.firstName || ''} onChange={(e) => set('firstName', e.target.value)} />
          <Field label={a('fFirstAr')} value={form.firstName_ar || ''} onChange={(e) => set('firstName_ar', e.target.value)} />
          <Field ltr label={a('fTitleEn')} value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
          <Field label={a('fTitleAr')} value={form.title_ar || ''} onChange={(e) => set('title_ar', e.target.value)} />
          <Field ltr label={a('fTaglineEn')} value={form.tagline || ''} onChange={(e) => set('tagline', e.target.value)} />
          <Field label={a('fTaglineAr')} value={form.tagline_ar || ''} onChange={(e) => set('tagline_ar', e.target.value)} />
          <Field ltr label={a('fLocEn')} value={form.location || ''} onChange={(e) => set('location', e.target.value)} />
          <Field label={a('fLocAr')} value={form.location_ar || ''} onChange={(e) => set('location_ar', e.target.value)} />
          <Field ltr label={a('fWaDisplay')} value={form.whatsappDisplay || ''} onChange={(e) => set('whatsappDisplay', e.target.value)} />
          <Field ltr label={a('fWaNumber')} value={form.whatsappNumber || ''} onChange={(e) => set('whatsappNumber', e.target.value)} />
          <Field ltr label={a('fAvatar')} value={form.avatar || ''} onChange={(e) => set('avatar', e.target.value)} />
        </div>
        <Field ltr label={a('fCover')} value={form.cover || ''} onChange={(e) => set('cover', e.target.value)} />
        <Area ltr label={a('fBioEn')} value={form.bio || ''} onChange={(e) => set('bio', e.target.value)} rows={3} />
        <Area label={a('fBioAr')} value={form.bio_ar || ''} onChange={(e) => set('bio_ar', e.target.value)} rows={3} />
        <Area ltr label={a('fStats')} value={(form.stats || []).map(statToLine).join('\n')} onChange={(e) => set('stats', e.target.value.split('\n').map(lineToStat).filter((x) => x.value))} rows={4} />
        <Area ltr label={a('fCertEn')} value={(form.certifications || []).join(', ')} onChange={(e) => set('certifications', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
        <Area label={a('fCertAr')} value={(form.certifications_ar || []).join(', ')} onChange={(e) => set('certifications_ar', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
        <Area ltr label={a('fSpecEn')} value={(form.specializations || []).join(', ')} onChange={(e) => set('specializations', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
        <Area label={a('fSpecAr')} value={(form.specializations_ar || []).join(', ')} onChange={(e) => set('specializations_ar', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} rows={2} />
        <div className="flex gap-2">
          <Button onClick={save}>{a('save')} ✅</Button>
        </div>
        {msg && <p className="text-xs text-green-400 font-bold">{msg}</p>}
      </Card>

      <Card className="space-y-3">
        <b className="text-white text-sm">{a('approachTitle')}</b>
        <p className="text-xs text-stone-400">{a('approachSub')}</p>
        {(form.approach || []).map((x, i) => (
          <div key={i} className="border border-white/10 rounded-xl p-3 grid sm:grid-cols-2 gap-2">
            <Field ltr label={`${isAR ? 'خطوة' : 'Step'} ${i + 1} — ${a('stepTitleEn')}`} value={x.title || ''} onChange={(e) => setApproach(i, { title: e.target.value })} />
            <Field label={`${isAR ? 'خطوة' : 'Step'} ${i + 1} — ${a('stepTitleAr')}`} value={x.title_ar || ''} onChange={(e) => setApproach(i, { title_ar: e.target.value })} />
            <Area ltr label={a('stepTextEn')} value={x.text || ''} onChange={(e) => setApproach(i, { text: e.target.value })} rows={2} />
            <Area label={a('stepTextAr')} value={x.text_ar || ''} onChange={(e) => setApproach(i, { text_ar: e.target.value })} rows={2} />
            <div className="sm:col-span-2">
              <button onClick={() => { setDirty(true); setMsg(''); setForm((f) => ({ ...f, approach: (f.approach || []).filter((_, j) => j !== i) })) }} className="text-xs text-red-400">{a('removeStep')}</button>
            </div>
          </div>
        ))}
        <Button variant="secondary" onClick={() => { setDirty(true); setMsg(''); setForm((f) => ({ ...f, approach: [...(f.approach || []), { title: '', title_ar: '', text: '', text_ar: '' }] })) }}>
          <span className="inline-flex items-center gap-1.5"><Plus size={15} /> {a('addStep')}</span>
        </Button>
        <div><Button onClick={save}>{a('save')} ✅</Button></div>
      </Card>
    </div>
  )
}

// ---------- PACKAGES ----------
function PackagesTab({ goData }) {
  const { a } = useA()
  const packages = useSiteStore((s) => s.packages)
  const { addPackage, updatePackage, deletePackage } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', price: '', period: '', period_ar: '', tag: '', tag_ar: '', whatsappText: '', whatsappText_ar: '', highlight: false, features: '', features_ar: '' })
  const startEdit = (p) => {
    setEditing(p.id)
    setForm({ ...p, features: (p.features || []).join('\n'), features_ar: (p.features_ar || []).join('\n') })
  }
  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', name_ar: '', price: '', period: '', period_ar: '', tag: '', tag_ar: '', whatsappText: '', whatsappText_ar: '', highlight: false, features: '', features_ar: '' })
  }
  const save = async () => {
    if (!form.name.trim()) return alert(a('nameRequired'))
    const payload = { ...form, features: String(form.features).split('\n').map((x) => x.trim()).filter(Boolean), features_ar: String(form.features_ar || '').split('\n').map((x) => x.trim()).filter(Boolean) }
    if (editing) await updatePackage(editing, payload)
    else await addPackage(payload)
    resetForm()
  }
  return (
    <div className="space-y-4">
      <TabTitle icon={Package} title={`${editing ? a('pkgEdit') : a('pkgAdd')} ${a('enAr')}`} />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('nameEn')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Online Coaching" />
          <Field label={a('nameAr')} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="التدريب الأونلاين" />
          <Field ltr label={a('tagEn')} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Most Popular" />
          <Field label={a('tagAr')} value={form.tag_ar} onChange={(e) => setForm({ ...form, tag_ar: e.target.value })} placeholder="الأكثر طلباً" />
          <Field ltr label={a('price')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500 EGP" />
          <Field ltr label={a('periodEn')} value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="/month" />
          <Field label={a('periodAr')} value={form.period_ar} onChange={(e) => setForm({ ...form, period_ar: e.target.value })} placeholder="/شهر" />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area ltr label={a('waEn')} value={form.whatsappText} onChange={(e) => setForm({ ...form, whatsappText: e.target.value })} rows={2} />
          <Area label={a('waAr')} value={form.whatsappText_ar} onChange={(e) => setForm({ ...form, whatsappText_ar: e.target.value })} rows={2} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area ltr label={a('featEn')} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} />
          <Area label={a('featAr')} value={form.features_ar} onChange={(e) => setForm({ ...form, features_ar: e.target.value })} rows={4} />
        </div>
        <label className="flex items-center gap-2 text-sm mt-3"><input type="checkbox" checked={!!form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} /> {a('highlight')}</label>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> {a('save')}</> : <><Plus size={16} /> {a('add')}</>}</span></Button>
          {editing && <Button variant="secondary" onClick={resetForm}>{a('cancel')}</Button>}
        </div>
        <div className="mt-3"><BulkHint goData={goData} /></div>
      </Card>
      {packages.length === 0 && <p className="text-sm text-stone-400">{a('emptyPkg')}</p>}
      {packages.map((p) => (
        <Card key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="min-w-0"><b className="text-white">{p.name}</b> <span className="text-rose-400 text-sm">{p.price}{p.period}</span><div className="text-xs text-stone-400">{(p.features || []).join(' • ')}</div></div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => startEdit(p)} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{a('edit')}</button>
            <button onClick={() => confirm(a('confirmDelete')) && deletePackage(p.id)} className="text-xs text-red-400 px-3 py-1.5">{a('delete')}</button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ---------- RESULTS ----------
function ResultsTab({ goData }) {
  const { a } = useA()
  const list = useSiteStore((s) => s.transformations)
  const { addResult, updateResult, deleteResult } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', result: '', result_ar: '', goal: '', goal_ar: '', image: '', text: '', text_ar: '' })
  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', name_ar: '', result: '', result_ar: '', goal: '', goal_ar: '', image: '', text: '', text_ar: '' })
  }
  const save = async () => {
    if (!form.name || !form.result) return alert(a('nameResultRequired'))
    if (editing) await updateResult(editing, form)
    else await addResult(form)
    resetForm()
  }
  return (
    <div className="space-y-4">
      <TabTitle icon={Trophy} title={`${editing ? a('resEdit') : a('resAdd')} ${a('enAr')}`} />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('clientEn')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmed — Fat Loss" />
          <Field label={a('clientAr')} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="أحمد — تخسيس" />
          <Field ltr label={a('resultEn')} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="-14 kg in 16 weeks" />
          <Field label={a('resultAr')} value={form.result_ar} onChange={(e) => setForm({ ...form, result_ar: e.target.value })} placeholder="-14 كجم في 16 أسبوع" />
          <Field ltr label={a('goalEn')} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Fat Loss" />
          <Field label={a('goalAr')} value={form.goal_ar} onChange={(e) => setForm({ ...form, goal_ar: e.target.value })} placeholder="تخسيس" />
          <Field ltr label={a('imageUrl')} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area ltr label={a('storyEn')} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} />
          <Area label={a('storyAr')} value={form.text_ar} onChange={(e) => setForm({ ...form, text_ar: e.target.value })} rows={2} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> {a('save')}</> : <><Plus size={16} /> {a('add')}</>}</span></Button>
          {editing && <Button variant="secondary" onClick={resetForm}>{a('cancel')}</Button>}
        </div>
        <div className="mt-3"><BulkHint goData={goData} /></div>
      </Card>
      {list.length === 0 && <p className="text-sm text-stone-400">{a('emptyRes')}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex gap-3">
              {r.image && <img src={r.image} className="w-16 h-16 rounded-xl object-cover" alt="" />}
              <div className="flex-1"><b className="text-white text-sm">{r.name}</b><div className="text-rose-400 text-sm font-bold">{r.result}</div><div className="text-xs text-stone-400">{r.text}</div></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => { setEditing(r.id); setForm({ name: r.name || '', name_ar: r.name_ar || '', result: r.result || '', result_ar: r.result_ar || '', goal: r.goal || '', goal_ar: r.goal_ar || '', image: r.image || '', text: r.text || '', text_ar: r.text_ar || '' }) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{a('edit')}</button>
              <button onClick={() => confirm(a('confirmDelete')) && deleteResult(r.id)} className="text-xs text-red-400 px-3 py-1.5">{a('delete')}</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------- TESTIMONIALS ----------
function TestimonialsTab({ goData }) {
  const { a } = useA()
  const list = useSiteStore((s) => s.testimonials)
  const { addTestimonial, updateTestimonial, deleteTestimonial } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', role: '', role_ar: '', avatar: '', text: '', text_ar: '' })
  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', name_ar: '', role: '', role_ar: '', avatar: '', text: '', text_ar: '' })
  }
  const save = async () => {
    if (!form.name.trim() || (!form.text.trim() && !form.text_ar.trim())) return alert(a('nameTextRequired'))
    if (editing) await updateTestimonial(editing, form)
    else await addTestimonial(form)
    resetForm()
  }
  return (
    <div className="space-y-4">
      <TabTitle icon={MessageCircle} title={`${editing ? a('revEdit') : a('revAdd')} ${a('enAr')}`} />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('nameEn')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label={a('nameAr')} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <Field ltr label={a('roleEn')} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Online Client — Lost 14kg" />
          <Field label={a('roleAr')} value={form.role_ar} onChange={(e) => setForm({ ...form, role_ar: e.target.value })} placeholder="عميل أونلاين — خسر 14 كجم" />
        </div>
        <div className="mt-3"><Field ltr label={a('avatarUrl')} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area ltr label={a('textEn')} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          <Area label={a('textAr')} value={form.text_ar} onChange={(e) => setForm({ ...form, text_ar: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> {a('save')}</> : <><Plus size={16} /> {a('add')}</>}</span></Button>
          {editing && <Button variant="secondary" onClick={resetForm}>{a('cancel')}</Button>}
        </div>
        <div className="mt-3"><BulkHint goData={goData} /></div>
      </Card>
      {list.length === 0 && <p className="text-sm text-stone-400">{a('emptyRev')}</p>}
      {list.map((t) => (
        <Card key={t.id} className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="text-sm min-w-0">
            <b className="text-white">{t.name}</b> <span className="text-stone-400">— {t.role}</span>
            <p className="text-stone-300 mt-1">“{t.text || t.text_ar}”</p>
            {t.name_ar && <p className="text-stone-500 text-xs mt-0.5">{t.name_ar} — {t.role_ar}</p>}
          </div>
          <div className="flex gap-2 shrink-0 items-start">
            <button onClick={() => { setEditing(t.id); setForm({ name: t.name || '', name_ar: t.name_ar || '', role: t.role || '', role_ar: t.role_ar || '', avatar: t.avatar || '', text: t.text || '', text_ar: t.text_ar || '' }) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{a('edit')}</button>
            <button onClick={() => confirm(a('confirmDelete')) && deleteTestimonial(t.id)} className="text-xs text-red-400 px-2 py-1.5">{a('delete')}</button>
          </div>
        </Card>
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

// ---------- SERVICES ----------
function ServicesTab({ goData }) {
  const { a } = useA()
  const list = useSiteStore((s) => s.services)
  const { addService, updateService, deleteService } = useSiteStore()
  const [editing, setEditing] = useState(null) // index
  const [form, setForm] = useState({ title: '', title_ar: '', desc: '', desc_ar: '', icon: 'dumbbell' })
  const resetForm = () => {
    setEditing(null)
    setForm({ title: '', title_ar: '', desc: '', desc_ar: '', icon: 'dumbbell' })
  }
  const save = async () => {
    if (!form.title.trim()) return alert(a('titleRequired'))
    if (editing != null) await updateService(editing, form)
    else await addService(form)
    resetForm()
  }
  return (
    <div className="space-y-4">
      <TabTitle icon={Zap} title={`${editing != null ? a('srvEdit') : a('srvAdd')} ${a('enAr')}`} />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('titleEn')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Field label={a('titleAr')} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} />
          <div><label className={labelCls}>{a('iconL')}</label><select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={`${inputCls} mt-1`}>{SERVICE_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div />
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
            <Area ltr label={a('descEn')} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} />
            <Area label={a('descAr')} value={form.desc_ar} onChange={(e) => setForm({ ...form, desc_ar: e.target.value })} rows={2} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={save}><span className="inline-flex items-center gap-1.5">{editing != null ? <><Save size={16} /> {a('save')}</> : <><Plus size={16} /> {a('add')}</>}</span></Button>
          {editing != null && <Button variant="secondary" onClick={resetForm}>{a('cancel')}</Button>}
        </div>
        <div className="mt-3"><BulkHint goData={goData} /></div>
      </Card>
      {list.length === 0 && <p className="text-sm text-stone-400">{a('emptySrv')}</p>}
      {list.map((sv, i) => {
        const Icon = (SERVICE_ICON_OPTIONS.find((o) => o.value === sv.icon) || { Icon: Flame }).Icon
        return (
          <Card key={sv.id ?? i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm flex items-center gap-2 min-w-0"><Icon size={16} className="text-rose-400 shrink-0" /> <b className="text-white truncate">{sv.title}</b> <span className="text-stone-400 truncate">— {sv.desc}</span></span>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing(i); setForm({ title: sv.title || '', title_ar: sv.title_ar || '', desc: sv.desc || '', desc_ar: sv.desc_ar || '', icon: sv.icon || 'dumbbell' }) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{a('edit')}</button>
              <button onClick={() => confirm(a('confirmDelete')) && deleteService(i)} className="text-xs text-red-400">{a('delete')}</button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ---------- SUPPLEMENTS ----------
function SupplementsTab({ goData }) {
  const { a } = useA()
  const list = useSiteStore((s) => s.supplements)
  const { addSupplement, updateSupplement, deleteSupplement } = useSiteStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', name_ar: '', price: '', category: '', category_ar: '', description: '', description_ar: '', image: '' })
  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', name_ar: '', price: '', category: '', category_ar: '', description: '', description_ar: '', image: '' })
  }
  const saveOne = async () => {
    if (!form.name.trim()) return alert(a('nameRequired'))
    if (editing) await updateSupplement(editing, form)
    else await addSupplement(form)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <TabTitle icon={Pill} title={`${editing ? a('supEdit') : a('supAdd')} ${a('enAr')}`} />
      <Card>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field ltr label={a('nameEn')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label={a('nameAr')} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <Field ltr label={a('price')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1800 EGP" />
          <Field ltr label={a('imageUrl')} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Field ltr label={a('catEn')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Field label={a('catAr')} value={form.category_ar} onChange={(e) => setForm({ ...form, category_ar: e.target.value })} />
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <Area ltr label={a('descEn')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Area label={a('descAr')} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={2} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={saveOne}><span className="inline-flex items-center gap-1.5">{editing ? <><Save size={16} /> {a('save')}</> : <><Plus size={16} /> {a('add')}</>}</span></Button>
          {editing && <Button variant="secondary" onClick={resetForm}>{a('cancel')}</Button>}
        </div>
        <div className="mt-3"><BulkHint goData={goData} /></div>
      </Card>

      {list.length === 0 && <p className="text-sm text-stone-400">{a('emptySup')}</p>}
      {list.map((s) => (
        <Card key={s.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-sm min-w-0"><b className="text-white">{s.name}</b> <span className="text-rose-400 font-bold">{s.price}</span> <span className="text-stone-400">• {s.category}</span></div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => { setEditing(s.id); setForm({ name: s.name || '', name_ar: s.name_ar || '', price: s.price || '', category: s.category || '', category_ar: s.category_ar || '', description: s.description || '', description_ar: s.description_ar || '', image: s.image || '' }) }} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">{a('edit')}</button>
            <button onClick={() => confirm(a('confirmDelete')) && deleteSupplement(s.id)} className="text-xs text-red-400 px-2 py-1.5">{a('delete')}</button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function FileStatus() {
  const { t } = useT()
  const supabaseStatus = useSiteStore((s) => s.supabaseStatus)
  const supabaseError = useSiteStore((s) => s.supabaseError)
  const lastSync = useSiteStore((s) => s.lastSync)
  const loading = useSiteStore((s) => s.loading)
  const refresh = useSiteStore((s) => s.refresh)
  if (supabaseStatus === 'connected') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
        <span className="text-green-400 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /> {t('admin.statusLive')}</span>
        <span className="text-stone-400">{t('admin.statusLiveSub')}{lastSync ? ` • ${t('admin.lastSync')} ${lastSync}` : ''}</span>
        <button onClick={() => refresh()} className="ms-auto bg-green-600/20 border border-green-500/40 px-2.5 py-1 rounded-lg font-bold hover:bg-green-600/30 inline-flex items-center gap-1.5"><Save size={13} /> {loading ? t('admin.syncing') : t('admin.refresh')}</button>
      </div>
    )
  }
  if (supabaseStatus === 'empty') {
    return (
      <div className="text-xs bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-2">
        <span className="text-sky-300 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-300" /> {t('admin.statusEmpty')}</span>
        <span className="text-stone-400"> — {t('admin.statusEmptySub')} </span>
        <button onClick={() => refresh()} className="underline font-bold text-sky-300">{t('admin.refresh')}</button>
        <span className="text-stone-400">.</span>
      </div>
    )
  }
  if (supabaseStatus === 'checking' || loading) {
    return <div className="text-xs text-stone-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2">{t('admin.statusChecking')}</div>
  }
  return (
    <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
      <span className="text-amber-300 font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300" /> {t('admin.statusOff')}</span>
      <span className="text-stone-400"> — {supabaseError || ''} </span>
      <button onClick={() => refresh()} className="underline font-bold text-amber-300">{t('admin.retry')}</button>
    </div>
  )
}

// ---------- EXCEL / JSON (bulk + backup) ----------
function DataTab() {
  const { a } = useA()
  const exportJSON = useSiteStore((s) => s.exportJSON)
  const importJSON = useSiteStore((s) => s.importJSON)
  const resetAll = useSiteStore((s) => s.resetAll)
  const updateCoach = useSiteStore((s) => s.updateCoach)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const download = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const aEl = document.createElement('a')
    aEl.href = URL.createObjectURL(blob)
    aEl.download = 'site.json'
    aEl.click()
  }

  const onJsonFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const current = JSON.parse(useSiteStore.getState().exportJSON())
        const known = ['coach', 'packages', 'transformations', 'testimonials', 'services', 'supplements']
        if (!parsed || typeof parsed !== 'object' || !known.some((k) => parsed[k] !== undefined)) {
          setMsg(a('invalidFile'))
          return
        }
        // Missing sections stay untouched — a partial file can never wipe tables.
        const res = await importJSON({ ...current, ...parsed })
        setMsg(res.ok ? `"${f.name}" ${a('appliedLive')}` : `"${f.name}" ${a('appliedLive')} — ⚠️ ${res.failures.join(' • ')}`)
      } catch {
        setMsg(a('invalidFile'))
      }
      e.target.value = ''
    }
    reader.readAsText(f)
  }

  const exportExcel = () => {
    const s = JSON.parse(useSiteStore.getState().exportJSON())
    const wb = XLSX.utils.book_new()
    const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name)
    add('Coach', [coachToSheetRow(s.coach)])
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
    setBusy(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const current = JSON.parse(useSiteStore.getState().exportJSON())
        // parseWorkbook skips sheets with no valid rows — they can never
        // wipe their table (this was the "services became 0" bug).
        const { patch, notes, skipped, coachPatch } = parseWorkbook(wb)
        if (!notes.length) {
          setMsg(`${a('noSheets')}${skipped.length ? ` (${skipped.join(' • ')})` : ''}`)
          return
        }
        if (!confirm(`${a('applyExcelConfirm')}\n${notes.join('\n')}${skipped.length ? `\n\nSkipped (kept existing):\n${skipped.join('\n')}` : ''}`)) return
        if (coachPatch) await updateCoach(coachPatch)
        if (Object.keys(patch).length) {
          const res = await useSiteStore.getState().importJSON({ ...current, ...patch })
          setMsg(res.ok
            ? `${a('appliedLive')} (${notes.join(' • ')})`
            : `${a('appliedLive')} (${notes.join(' • ')}) — ⚠️ ${res.failures.join(' • ')}`)
        } else {
          await useSiteStore.getState().refresh()
          setMsg(a('appliedLive'))
        }
      } catch (err) {
        setMsg(`❌ ${err.message || a('noSheets')}`)
      } finally {
        setBusy(false)
        e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(f)
  }

  return (
    <div className="space-y-4">
      <TabTitle icon={Save} title={a('tabs.data')} sub={a('tabDesc.data')} />
      <FileStatus />
      <Card>
        <h3 className="font-display text-xl uppercase flex items-center gap-2"><Save size={20} className="text-rose-400" /> {a('dataLiveTitle')}</h3>
        <p className="text-xs text-stone-400 mt-1">{a('dataLiveSub')}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={download}><span className="inline-flex items-center gap-1.5"><Download size={16} /> {a('backupJson')}</span></Button>
          <Button variant="secondary" onClick={() => confirm(a('confirmReset')) && resetAll()}><span className="inline-flex items-center gap-1.5"><RotateCcw size={16} /> {a('reset')}</span></Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-xl uppercase mb-1 flex items-center gap-2"><FileSpreadsheet size={20} className="text-rose-400" /> {a('excelTitle')}</h3>
        <p className="text-xs text-stone-400">{a('excelSub')}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button onClick={exportExcel}><span className="inline-flex items-center gap-1.5"><Download size={16} /> {a('exportXlsx')}</span></Button>
          <label className="btn-fire text-white text-sm font-extrabold px-4 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
            <Upload size={16} /> {busy ? a('working') : a('uploadXlsx')}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onExcelFile} className="hidden" />
          </label>
        </div>
      </Card>
      <Card>
        <h3 className="font-display text-xl uppercase mb-1 flex items-center gap-2"><FileJson size={20} className="text-rose-400" /> {a('jsonTitle')}</h3>
        <p className="text-xs text-stone-400">{a('jsonSub')}</p>
        <label className="mt-3 inline-flex items-center gap-1.5 text-sm bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl cursor-pointer font-bold hover:bg-white/20">
          <Upload size={16} /> {a('uploadJson')}
          <input type="file" accept=".json,application/json" onChange={onJsonFile} className="hidden" />
        </label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={a('pastePh')} className="w-full mt-3 px-3 py-2 border border-white/10 rounded-xl bg-stone-950 text-xs font-mono" />
        <Button className="mt-3" onClick={async () => {
          try {
            const parsed = JSON.parse(text)
            const current = JSON.parse(useSiteStore.getState().exportJSON())
            const known = ['coach', 'packages', 'transformations', 'testimonials', 'services', 'supplements']
            if (!parsed || typeof parsed !== 'object' || !known.some((k) => parsed[k] !== undefined)) {
              setMsg(a('invalidFile'))
              return
            }
            const res = await importJSON({ ...current, ...parsed })
            setMsg(res.ok ? a('appliedLive') : `${a('appliedLive')} — ⚠️ ${res.failures.join(' • ')}`)
            if (res.ok) setText('')
          } catch { setMsg(a('invalidJson')) }
        }}><span className="inline-flex items-center gap-1.5"><Upload size={16} /> {a('importPasted')}</span></Button>
        {msg && <p className="text-xs text-green-400 font-bold mt-2">{msg}</p>}
      </Card>
    </div>
  )
}

// ---------- SECURITY (change admin password, stored in users table) ----------
function SecurityTab() {
  const { a } = useA()
  const adminUser = useAdminStore((s) => s.adminUser)
  const authMethod = useAdminStore((s) => s.authMethod)
  const changePassword = useAdminStore((s) => s.changePassword)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)

  const methodLabel = authMethod === 'supabase'
    ? a('secMethodSupabase')
    : authMethod === 'legacy'
      ? a('secMethodLegacy')
      : authMethod === 'fallback'
        ? a('secMethodFallback')
        : a('secMethodSupabase')

  const submit = async () => {
    setMsg('')
    setOk(false)
    if (next !== confirm) {
      setMsg(a('secMismatch'))
      return
    }
    setBusy(true)
    try {
      const res = await changePassword(current, next)
      if (res.ok) {
        setOk(true)
        setMsg(a('secChanged'))
        setCurrent('')
        setNext('')
        setConfirm('')
      } else {
        setMsg(res.error || a('secMismatch'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <TabTitle icon={ShieldCheck} title={a('secTitle')} sub={a('secSub')} />
      <Card>
        <p className="text-sm text-stone-300">
          {a('secLoggedInAs')} <b className="text-white">{adminUser || 'admin'}</b>
        </p>
        <p className="text-xs text-stone-500 mt-1">{methodLabel}</p>
      </Card>
      <Card className="space-y-3">
        <h3 className="font-display text-lg uppercase">{a('secUpdate')}</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label={a('secCurrent')} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          <Field label={a('secNew')} type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          <Field label={a('secConfirm')} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        </div>
        <div>
          <Button onClick={submit} disabled={busy}>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} /> {busy ? a('working') : a('secUpdate')}</span>
          </Button>
        </div>
        {msg && <p className={`text-xs font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      </Card>
      <Card>
        <b className="text-white text-sm">{a('secHowTitle')}</b>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed" dir="auto">{a('secHowD')}</p>
      </Card>
    </div>
  )
}

const TAB_DEFS = [
  { key: 'guide', Icon: BookOpen },
  { key: 'content', Icon: FileText },
  { key: 'packages', Icon: Package },
  { key: 'results', Icon: Trophy },
  { key: 'testimonials', Icon: MessageCircle },
  { key: 'services', Icon: Zap },
  { key: 'supplements', Icon: Pill },
  { key: 'security', Icon: ShieldCheck },
  { key: 'data', Icon: Save },
]

const COUNT_KEYS = {
  packages: 'packages',
  results: 'transformations',
  testimonials: 'testimonials',
  services: 'services',
  supplements: 'supplements',
}

export default function AdminDashboard() {
  const { t } = useT()
  const lang = usePrefsStore((s) => s.lang)
  const toggleLang = usePrefsStore((s) => s.toggleLang)
  const logout = useAdminStore((s) => s.logout)
  const nav = useNavigate()
  const [tab, setTab] = useState('guide')
  const counts = useSiteStore((s) => ({
    packages: s.packages.length,
    transformations: s.transformations.length,
    testimonials: s.testimonials.length,
    services: s.services.length,
    supplements: s.supplements.length,
  }))
  const go = (key) => {
    setTab(key)
    window.scrollTo(0, 0)
  }
  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      <div className="container-x py-4 flex justify-between items-center gap-2 flex-wrap">
        <h1 className="font-display text-xl sm:text-2xl uppercase flex items-center gap-2 min-w-0">
          <Lock size={22} className="text-rose-400 shrink-0" /> <span className="truncate">{t('admin.titleA')} <span className="text-fire">{t('admin.titleB')}</span></span>
        </h1>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={toggleLang}
            title="AR / EN"
            className="lang-toggle text-xs font-extrabold px-3 py-2 rounded-xl bg-fire-gradient text-white shadow-fire transition hover:brightness-110 inline-flex items-center gap-1.5"
          >
            <Globe size={15} /> {t('langName')}
          </button>
          <button onClick={() => nav('/')} className="text-xs bg-white/10 px-3 py-2 rounded-xl inline-flex items-center gap-1.5">{t('admin.viewSite')} <ArrowRight size={13} className="rtl:rotate-180" /></button>
          <button onClick={() => { logout(); nav('/elsum-admin/login') }} className="text-xs bg-red-600 px-3 py-2 rounded-xl font-bold">{t('admin.logout')}</button>
        </div>
      </div>
      <div className="container-x pt-2"><FileStatus /></div>
      <div className="container-x py-6 grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <aside className="card-fire p-3 lg:sticky lg:top-20">
          <div className="flex lg:flex-col gap-1 overflow-x-auto">
            {TAB_DEFS.map(({ key, Icon }) => {
              const active = tab === key
              const countKey = COUNT_KEYS[key]
              return (
                <button
                  key={key}
                  onClick={() => go(key)}
                  className={`flex-1 lg:flex-none min-w-[150px] lg:min-w-0 text-start px-3 py-2.5 rounded-xl transition flex items-center gap-2.5 ${active ? 'bg-[#2E7BFF] text-white' : 'text-stone-300 hover:bg-white/5'}`}
                >
                  <Icon size={17} className={`shrink-0 ${active ? 'text-white' : 'text-rose-400'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight">{t(`admin.tabs.${key}`)}</span>
                    <span className={`hidden lg:block text-[11px] leading-tight mt-0.5 ${active ? 'text-white/80' : 'text-stone-500'}`}>{t(`admin.tabDesc.${key}`)}</span>
                  </span>
                  {countKey != null && (
                    <span className={`ms-auto text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-300'}`}>
                      {counts[countKey] ?? 0}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="hidden lg:block text-[11px] text-stone-500 mt-3 px-1 leading-relaxed">
            {t('admin.statusLiveSub')} — {lang === 'ar' ? 'العربية' : 'English'}
          </p>
        </aside>
        <div className="min-w-0">
          {tab === 'guide' && <GuideTab go={go} />}
          {tab === 'content' && <ContentTab />}
          {tab === 'packages' && <PackagesTab goData={() => go('data')} />}
          {tab === 'results' && <ResultsTab goData={() => go('data')} />}
          {tab === 'testimonials' && <TestimonialsTab goData={() => go('data')} />}
          {tab === 'services' && <ServicesTab goData={() => go('data')} />}
          {tab === 'supplements' && <SupplementsTab goData={() => go('data')} />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'data' && <DataTab />}
        </div>
      </div>
    </div>
  )
}
