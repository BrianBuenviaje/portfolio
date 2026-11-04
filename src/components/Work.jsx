import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data/content.js'

const NODE_W = 100, NODE_H = 36

function edgePath(a, b) {
  const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2
  if (Math.abs(y1 - y2) < 1) return `M${x1} ${y1} H${x2}`
  const mx = (x1 + x2) / 2
  return `M${x1} ${y1} H${mx} V${y2} H${x2}`
}

// Boxes and lines in the same mono labels as the rest of the page. Data flows along the edges while the
// stage is live.
function Diagram({ diagram, title }) {
  const byId = Object.fromEntries(diagram.nodes.map((n) => [n.id, n]))
  return (
    <svg viewBox="0 0 520 150" className="block h-auto w-full max-w-full" role="img" aria-label={`System diagram for ${title}`}>
      {diagram.edges.map(([a, b]) => {
        const d = edgePath(byId[a], byId[b])
        return (
          <g key={a + b}>
            <path d={d} fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
            <path d={d} className="flow" />
          </g>
        )
      })}
      {diagram.nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="2" fill="var(--color-ground)" stroke="var(--color-ink)" strokeWidth="1.5" />
          <text x={n.x + NODE_W / 2} y={n.y + 22} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--color-ink)" letterSpacing=".04em">{n.label}</text>
        </g>
      ))}
    </svg>
  )
}

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

const TABS = [
  { id: 'front', label: 'Frontend' },
  { id: 'back', label: 'Backend' },
]

// Project list on the left, one sticky panel on the right. The panel has two tabs: Frontend (screenshot
// and product story) and Backend (system diagram and what runs behind it). Picking a project or a tab
// cross-fades the panel; picking the one already open does nothing.
export default function Work({ live }) {
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState('front')
  const [shown, setShown] = useState({ index: 0, tab: 'front' })
  const [fading, setFading] = useState(false)
  const timer = useRef(null)

  const swap = (next) => {
    setFading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setShown(next); setFading(false) }, 280)
  }
  const pick = (i) => { if (i === index) return; setIndex(i); swap({ index: i, tab }) }
  const pickTab = (t) => { if (t === tab) return; setTab(t); swap({ index, tab: t }) }
  useEffect(() => () => clearTimeout(timer.current), [])

  const p = PROJECTS[shown.index]
  const back = shown.tab === 'back'

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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1" role="tablist" aria-label="Project view">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => pickTab(t.id)}
                className={`label rounded-full px-3 py-1.5 text-[11px] transition-colors duration-200 ${tab === t.id ? 'bg-terra text-white' : 'text-khaki hover:bg-ink/10 hover:text-ink'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="label text-[11px] text-khaki">Run {shown.index + 1} of {PROJECTS.length}</span>
        </div>

        <div className={`panel-body grid min-w-0 gap-3 ${fading ? 'fading' : ''}`}>
          <p className="label text-[11px] text-khaki">{p.meta.split(' · ')[0]} · {p.year}</p>
          <p className="text-[19px] font-semibold leading-tight tracking-[-.01em]">{back ? p.backendHeadline : p.headline}</p>
          {back ? (
            <div className="w-full max-w-full overflow-hidden rounded-[4px] border border-line bg-ground px-3 py-4">
              <Diagram diagram={p.diagram} title={p.title} />
            </div>
          ) : (
            <img
              src={p.image.src}
              srcSet={p.image.srcSet}
              sizes="(min-width: 1024px) 480px, 90vw"
              alt={p.image.alt}
              loading="lazy"
              className="block h-auto w-full max-w-full rounded-[4px] border border-line"
            />
          )}
          <p className="max-w-[52ch] text-[14px] leading-snug">{back ? p.backend : p.summary}</p>
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
