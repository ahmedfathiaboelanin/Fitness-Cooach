import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { useT } from '../i18n/useT'

// Every image dropped into src/assets/images/transformations/ shows up here automatically.
const modules = import.meta.glob('../assets/images/transformations/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const galleryPhotos = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, url], i) => ({ id: i, src: url, file: path.split('/').pop() }))

function Lightbox({ index, setIndex, onClose, caption }) {
  const total = galleryPhotos.length
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [setIndex, total])
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [setIndex, total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const photo = galleryPhotos[index]
  if (!photo) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} aria-label="Close" className="absolute top-4 end-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
        <X size={20} />
      </button>
      <div className="absolute top-4 start-4 text-white/80 text-sm font-bold">
        {index + 1} / {total} • {caption(index)}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); prev() }}
        aria-label="Previous"
        className="absolute start-2 sm:start-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <ChevronLeft size={22} className="rtl:rotate-180" />
      </button>

      <motion.img
        key={photo.id}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        src={photo.src}
        alt={caption(index)}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-fire-lg border border-white/10"
      />

      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        aria-label="Next"
        className="absolute end-2 sm:end-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
      >
        <ChevronRight size={22} className="rtl:rotate-180" />
      </button>
    </motion.div>
  )
}

/* Scrollable photo slider (no title, no toggle button — the parent owns those).
   Click any photo for the fullscreen lightbox. */
export function GallerySlider() {
  const { isAR } = useT()
  const [open, setOpen] = useState(null)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const caption = (i) => (isAR ? `تحول ${i + 1}` : `Transformation ${i + 1}`)

  const goTo = useCallback((i) => {
    const clamped = Math.max(0, Math.min(galleryPhotos.length - 1, i))
    setActive(clamped)
    cardRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [])

  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track) return
    const center = track.getBoundingClientRect().left + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.left + r.width / 2 - center)
      if (d < bestDist) { bestDist = d; best = i }
    })
    setActive(best)
    const max = track.scrollWidth - track.clientWidth
    setProgress(max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0)
  }

  if (galleryPhotos.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => goTo(active - 1)} aria-label="Previous" className="p-2.5 rounded-full card-fire hover:border-rose-500/40 transition">
          <ChevronLeft size={20} className="rtl:rotate-180" />
        </button>
        <span className="text-sm font-bold text-stone-400">{active + 1} / {galleryPhotos.length}</span>
        <button onClick={() => goTo(active + 1)} aria-label="Next" className="p-2.5 rounded-full card-fire hover:border-rose-500/40 transition">
          <ChevronRight size={20} className="rtl:rotate-180" />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onTrackScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 px-1 chat-scroll"
        style={{ scrollbarWidth: 'thin' }}
      >
        {galleryPhotos.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => { cardRefs.current[i] = el }}
            onClick={() => setOpen(i)}
            className={`relative shrink-0 w-[76%] sm:w-[44%] lg:w-[30%] snap-center rounded-2xl overflow-hidden border bg-stone-900 group text-start transition ${i === active ? 'border-rose-500/60 shadow-fire' : 'border-white/10'}`}
          >
            <img src={p.src} alt={caption(i)} loading="lazy" draggable={false} className="h-72 sm:h-80 w-full object-cover group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-xs font-bold">{caption(i)}</span>
              <span className="p-1.5 rounded-full bg-white/15 text-white"><Expand size={14} /></span>
            </div>
          </button>
        ))}
      </div>

      <div className="h-1.5 mt-4 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-fire-gradient rounded-full transition-[width] duration-150" style={{ width: `${Math.max(4, progress * 100)}%` }} />
      </div>

      <AnimatePresence>
        {open !== null && (
          <Lightbox index={open} setIndex={setOpen} onClose={() => setOpen(null)} caption={caption} />
        )}
      </AnimatePresence>
    </div>
  )
}
