import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data/content.js'

function Fact({ value, suffix, label, live }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const target = parseFloat(value)
    if (!live || Number.isNaN(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); return }
    const dec = (String(value).split('.')[1] || '').length
    let t0 = null, raf
    const step = (t) => {
      if (!t0) t0 = t
      let p = Math.min(1, (t - t0) / 700); p = 1 - Math.pow(1 - p, 3)
      setShown((target * p).toFixed(dec))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, live])
  return (
    <div className="min-w-0">
      <b className="display block text-[22px] text-terra tabular-nums">{shown}{suffix}</b>
      <span className="label block text-[10.5px] leading-tight text-khaki">{label}</span>
    </div>
  )
}

// Project list on the left, one sticky panel on the right. Picking a project cross-fades the panel;
// picking the one already open does nothing.
export default function Work({ live }) {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const [fading, setFading] = useState(false)
  const timer = useRef(null)

  const pick = (i) => {
    if (i === index) return
    setIndex(i)
    setFading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setShown(i); setFading(false) }, 280)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const p = PROJECTS[shown]

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-x-14">
      <div data-reveal="left" style={{ '--i': 3 }} className="min-w-0 border-t border-ink" role="tablist" aria-label="Projects">
        {PROJECTS.map((proj, i) => (
          <button
            key={proj.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => pick(i)}
            className={`proj relative grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-line py-5 text-left ${i === index ? 'active' : ''}`}
          >
            <h3 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 46px)', lineHeight: 1 }}>{proj.title}</h3>
            <span className="label pt-2 text-khaki">{proj.year}</span>
            <span className="label col-span-2 text-[11.5px] text-khaki">{proj.meta}</span>
          </button>
        ))}
      </div>

      <aside data-reveal="right" style={{ '--i': 4 }} className="min-w-0 overflow-hidden border border-ink bg-ground p-4 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto" aria-live="polite">
        <div className={`panel-body grid min-w-0 gap-3 ${fading ? 'fading' : ''}`}>
          <div className="flex justify-between gap-3 label text-[11px] text-khaki">
            <span className="truncate">{p.meta.split(' · ')[0]} · {p.year}</span>
            <span className="shrink-0">Run {shown + 1} of {PROJECTS.length}</span>
          </div>
          <p className="text-[19px] font-semibold leading-tight tracking-[-.01em]">{p.headline}</p>
          <img
            src={p.image.src}
            srcSet={p.image.srcSet}
            sizes="(min-width: 1024px) 480px, 90vw"
            alt={p.image.alt}
            loading="lazy"
            className="block h-auto w-full max-w-full rounded-[4px] border border-line"
          />
          <p className="max-w-[52ch] text-[14px] leading-snug">{p.summary}</p>
          <div className="grid grid-cols-3 gap-3 border-t border-line pt-3">
            {p.facts.map(([v, s, l], i) => <Fact key={p.id + i} value={v} suffix={s} label={l} live={live} />)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {p.tech.map((t) => <span key={t} className="label rounded-[4px] border border-line px-2 py-0.5 text-[11px] text-khaki">{t}</span>)}
            </div>
            <div className="flex gap-4 label">
              {p.links.live && <a className="link-ul" href={p.links.live} target="_blank" rel="noreferrer">Live ↗</a>}
              {p.links.repo && <a className="link-ul" href={p.links.repo} target="_blank" rel="noreferrer">Code ↗</a>}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
