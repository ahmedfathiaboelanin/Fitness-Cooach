import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Newspaper, Tag } from 'lucide-react'
import { useSiteStore } from '../store/useSiteStore'
import { useT, useL } from '../i18n/useT'
import { Card, Badge, Button } from '../components/ui'
import { WhatsAppButton } from '../components/WhatsApp'
import { EmberBackground } from '../components/brand'

function paragraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export default function BlogPost() {
  const { slug } = useParams()
  const blogs = useSiteStore((s) => s.blogs || [])
  const coach = useSiteStore((s) => s.coach)
  const { isAR } = useT()
  const { pick } = useL()

  const post = useMemo(
    () => (blogs || []).find((b) => b.slug === slug) || null,
    [blogs, slug]
  )

  const related = useMemo(() => {
    if (!post) return []
    return (blogs || [])
      .filter((b) => b.id !== post.id && b.published !== false)
      .filter((b) => !post.category || b.category === post.category)
      .slice(0, 3)
  }, [blogs, post])

  const waText = isAR
    ? `أهلاً ${pick(coach, 'firstName')}! قريت مقال "${pick(post || {}, 'title')}" وعايز أبدأ التدريب معاك`
    : `Hi ${pick(coach, 'firstName')}! I read "${pick(post || {}, 'title')}" and want to start coaching`

  if (!post) {
    return (
      <div className="bg-stone-950 text-white min-h-screen">
        <div className="container-x py-20 text-center">
          <Newspaper size={44} className="mx-auto text-stone-600" />
          <h1 className="font-display text-4xl mt-4 uppercase">{isAR ? 'المقال مش موجود' : 'Article not found'}</h1>
          <p className="text-stone-400 mt-2">{isAR ? 'اتمسح أو الرابط غلط' : 'It was deleted or the link is wrong'}</p>
          <Link to="/blog" className="btn-fire inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-white mt-6">
            <ArrowRight size={18} className="rotate-180 rtl:rotate-0" /> {isAR ? 'كل المقالات' : 'All articles'}
          </Link>
        </div>
      </div>
    )
  }

  const body = paragraphs(pick(post, 'content'))
  const date = post.created_at
    ? new Date(post.created_at).toLocaleDateString(isAR ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="bg-stone-950 text-stone-100 relative overflow-hidden min-h-screen">
      <EmberBackground />
      <div className="relative container-x py-10 max-w-3xl mx-auto">
        <Link to="/blog" className="text-sm text-stone-400 hover:text-white inline-flex items-center gap-1.5 font-bold">
          <ArrowRight size={15} className="rotate-180 rtl:rotate-0" /> {isAR ? 'كل المقالات' : 'All articles'}
        </Link>

        {(post.category || post.category_ar) && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge>{pick(post, 'category')}</Badge>
            {date && <span className="text-xs text-stone-500 inline-flex items-center gap-1.5"><CalendarDays size={13} /> {date}</span>}
          </div>
        )}

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 uppercase leading-tight text-balance">
          {pick(post, 'title')}
        </h1>
        {pick(post, 'excerpt') && (
          <p className="text-stone-400 mt-3 text-lg leading-relaxed">{pick(post, 'excerpt')}</p>
        )}

        {post.cover && (
          <img src={post.cover} alt={pick(post, 'title')} className="w-full rounded-3xl border border-white/10 mt-6 max-h-[420px] object-cover" />
        )}

        <article className="mt-6 space-y-4">
          {body.length === 0 && (
            <p className="text-stone-500">{isAR ? 'المحتوى قريباً…' : 'Content coming soon…'}</p>
          )}
          {body.map((p, i) => (
            <p key={i} className="leading-loose text-stone-200 whitespace-pre-line">{p}</p>
          ))}
        </article>

        {(post.tags || []).length > 0 && (
          <div className="flex gap-2 flex-wrap mt-6">
            {(post.tags || []).map((tag) => (
              <span key={tag} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 text-stone-300">
                <Tag size={12} className="text-rose-400" /> {tag}
              </span>
            ))}
          </div>
        )}

        <Card className="mt-8 text-center">
          <h3 className="font-display text-2xl uppercase">
            {isAR ? <>عجبك المقال؟ <span className="text-fire">ابدأ التدريب</span></> : <>Liked it? <span className="text-fire">Start coaching</span></>}
          </h3>
          <p className="text-sm text-stone-400 mt-1">{isAR ? 'ابعت لمحمد على واتساب وابدأ خطتك المخصصة' : 'Message Mohammad on WhatsApp and start your custom plan'}</p>
          <WhatsAppButton large text={waText} label={isAR ? 'ابدأ على واتساب' : 'Start on WhatsApp'} className="mt-4" />
        </Card>

        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-xl uppercase mb-4">{isAR ? 'مقالات مشابهة' : 'Related articles'}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id ?? r.slug} to={`/blog/${r.slug}`} className="card-fire overflow-hidden group">
                  {r.cover
                    ? <img src={r.cover} alt={pick(r, 'title')} loading="lazy" className="h-32 w-full object-cover group-hover:scale-105 transition duration-500" />
                    : <div className="h-32 w-full bg-stone-900 flex items-center justify-center"><Newspaper size={30} className="text-rose-400" /></div>}
                  <div className="p-3">
                    <b className="text-sm text-white group-hover:text-rose-300 transition line-clamp-2">{pick(r, 'title')}</b>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
