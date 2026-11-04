import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PROJECTS } from '../data/content.js'
import { useMediaQuery } from '../lib/util.js'
import Lightbox from './Lightbox.jsx'

const NODE_W = 100, NODE_H = 36
const N = PROJECTS.length
const WINDOW = 6   // rows visible at once on wide screens

// Titles come straight from the data; an id-like one (snake_case) is shown as words.
const titleOf = (t) => (t.includes('_') ? t.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : t)

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

const TABS = [
  { id: 'front', label: 'Frontend' },
  { id: 'back', label: 'Backend' },
]

function Arrow({ dir, onClick, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? 'Previous project' : 'Next project'}
      className={`grid h-8 w-8 place-items-center rounded-full border border-line bg-ground text-ink transition-[background-color,border-color,color,opacity,transform] duration-200 ${disabled ? 'cursor-default opacity-35' : 'cursor-pointer hover:border-terra hover:bg-terra hover:text-white active:scale-95'} ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir < 0 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
      </svg>
    </button>
  )
}

function Row({ proj, active, expanded, onClick, className = '' }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-expanded={expanded}
      onClick={onClick}
      className={`proj relative flex w-full cursor-pointer items-center border-b border-line py-5 text-left ${active ? 'active' : ''} ${className}`}
    >
      <span className="flex w-full items-baseline justify-between gap-x-4">
        <h3 className="display" style={{ fontSize: 'clamp(26px, 3.6vw, 46px)', lineHeight: 1 }}>{titleOf(proj.title)}</h3>
        <span className="label text-khaki">{proj.year}</span>
      </span>
    </button>
  )
}

// Wide screens: the project list on the left, the card on the right, both the same height. The list shows a
// window of six rows; the arrows on its top and bottom bars (or the wheel over it) slide the window one row
// at a time, handing over to the page at either end. Below lg the list is an accordion: pressing a project
// folds the other rows away and opens the card right under it; pressing the open row closes it again. The
// arrows beside the card, and a vertical swipe on it, move to the previous or next project without closing.
// The card has two tabs: Frontend (screenshot and product story) and Backend (system diagram and what runs
// behind it). Picking a project or a tab cross-fades the card; picking the one already open does nothing.
export default function Work() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)      // accordion, below lg
  const [start, setStart] = useState(0)        // first row in the window, wide screens
  const [tab, setTab] = useState('front')
  const [shown, setShown] = useState({ index: 0, tab: 'front' })
  const [fading, setFading] = useState(false)
  const [zoom, setZoom] = useState(false)
  const timer = useRef(null)
  const cardRef = useRef(null), bodyRef = useRef(null), listRef = useRef(null)
  const latest = useRef({})
  const maxStart = Math.max(0, N - WINDOW)

  const swap = (next) => {
    // Below lg the body's height is frozen here so it can glide to the new content's height once that is in.
    const body = bodyRef.current
    if (body && !wide) body.style.height = `${body.offsetHeight}px`
    setFading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setShown(next); setFading(false) }, 280)
  }
  const pick = (i) => { if (i === index) return; setIndex(i); swap({ index: i, tab }) }
  const pickTab = (t) => { if (t === tab) return; setTab(t); swap({ index, tab: t }) }
  const step = (d) => pick((index + d + N) % N)
  const shift = (d) => setStart((s) => Math.max(0, Math.min(maxStart, s + d)))
  // A row press selects on wide screens; below lg it opens the card under that row, or closes an open one.
  const press = (i) => {
    if (wide) { pick(i); return }
    if (open && i === index) { setOpen(false); return }
    pick(i)
    setOpen(true)
  }
  latest.current = { index, start, step, shift }
  useEffect(() => () => clearTimeout(timer.current), [])

  // New content is in: glide from the frozen height to the natural one, then let it go.
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body || !body.style.height) return
    const h0 = parseFloat(body.style.height)
    body.style.height = 'auto'
    const h1 = body.offsetHeight
    if (Math.abs(h1 - h0) < 1) { body.style.height = ''; return }
    body.style.height = `${h0}px`
    void body.offsetHeight
    body.style.height = `${h1}px`
    // Let go once the glide ends (or after its duration, should the event never come).
    const done = () => { body.style.height = ''; body.removeEventListener('transitionend', done); clearTimeout(t) }
    body.addEventListener('transitionend', done)
    const t = setTimeout(done, 500)
    return () => { clearTimeout(t); body.removeEventListener('transitionend', done) }
  }, [shown])

  // Below lg a vertical swipe on the card moves to the previous or next project. The gesture is claimed
  // only when there is somewhere to go, so at either end the page scrolls as usual.
  useEffect(() => {
    const el = cardRef.current
    if (!el || wide) return
    let x0 = 0, y0 = 0, mode = null, fired = false
    const start = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; mode = null; fired = false }
    const move = (e) => {
      const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0
      if (!mode) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
        const i = latest.current.index
        mode = Math.abs(dy) > Math.abs(dx) && ((dy < 0 && i < N - 1) || (dy > 0 && i > 0)) ? 'swap' : 'scroll'
      }
      if (mode !== 'swap') return
      e.preventDefault()
      if (!fired && Math.abs(dy) > 44) { fired = true; latest.current.step(dy < 0 ? 1 : -1) }
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    return () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchmove', move) }
  }, [wide])

  // Wide screens: the wheel over the list slides its window a row per 60px, and lets the page scroll once
  // the window is at either end.
  useEffect(() => {
    const el = listRef.current
    if (!el || !wide) return
    let acc = 0
    const onWheel = (e) => {
      const s = latest.current.start
      if (e.deltaY > 0 ? s >= maxStart : s <= 0) { acc = 0; return }
      e.preventDefault()
      acc += e.deltaY
      const n = Math.trunc(acc / 60)
      if (n) { acc -= n * 60; latest.current.shift(n) }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [wide, maxStart])

  const p = PROJECTS[shown.index]
  const back = shown.tab === 'back'
  const last = Math.min(N, start + WINDOW) - 1

  const card = (
    <div ref={cardRef} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 lg:block" aria-live="polite">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1" role="tablist" aria-label="Project view">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => pickTab(t.id)}
                className={`label cursor-pointer rounded-full px-3 py-1.5 text-[11px] transition-colors duration-200 ${tab === t.id ? 'bg-terra text-white' : 'text-khaki hover:bg-ink/10 hover:text-ink'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="label inline-flex items-center gap-1.5 text-[11px] text-khaki">
            <i aria-hidden="true" className={`block h-1.5 w-1.5 rounded-full ${p.deployed ? 'bg-terra' : 'border border-khaki'}`} />
            {p.deployed ? 'Deployed' : 'Undeployed'}
          </span>
        </div>

        {/* On wide screens the slots are fixed so the card is the same size for every project and both tabs:
            a two-line headline, a 2.11:1 media box, a six-line description. Below lg the text runs its full
            length and the card's height glides between projects. */}
        <div ref={bodyRef} className={`panel-body grid min-w-0 gap-3 ${fading ? 'fading' : ''}`}>
          <p className="display hidden text-[22px] leading-none text-terra lg:block">{titleOf(p.title)}</p>
          <p className="text-[20px] font-semibold leading-tight tracking-[-.01em] lg:line-clamp-2 lg:min-h-[2.5em]">{back ? p.backendHeadline : p.headline}</p>
          <div className="aspect-[2.11] w-full max-w-full overflow-hidden rounded-[4px] border border-line bg-ground">
            {back ? (
              <div className="flex h-full w-full items-center px-3"><Diagram diagram={p.diagram} title={p.title} /></div>
            ) : (
              <button type="button" onClick={() => setZoom(true)} className="group block h-full w-full cursor-zoom-in" aria-label={`Enlarge: ${p.image.alt}`}>
                <img
                  src={p.image.src}
                  srcSet={p.image.srcSet}
                  sizes="(min-width: 1024px) 480px, 90vw"
                  alt={p.image.alt}
                  loading="lazy"
                  className="block h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            )}
          </div>
          {zoom && <Lightbox src={p.image.src} alt={p.image.alt} onClose={() => setZoom(false)} />}
          <p className="max-w-[52ch] text-[16px] leading-[1.45] lg:line-clamp-6 lg:min-h-[8.7em]">{back ? p.backend : p.summary}</p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 lg:h-[3.5rem]">
            <div className="flex flex-wrap gap-1.5 lg:max-h-[3.5rem] lg:overflow-hidden">
              {p.tech.map((t) => <span key={t} className="label rounded-[4px] border border-line px-2 py-0.5 text-[11.5px] text-khaki">{t}</span>)}
            </div>
            <div className="flex gap-4 pt-1 label">
              {p.links.live && <a className="link-ul" href={p.links.live} target="_blank" rel="noreferrer">Live ↗</a>}
              {p.links.repo && <a className="link-ul" href={p.links.repo} target="_blank" rel="noreferrer">Code ↗</a>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2 lg:hidden" aria-label="Switch project">
        <Arrow dir={-1} onClick={() => step(-1)} />
        <Arrow dir={1} onClick={() => step(1)} />
      </div>
    </div>
  )

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-x-14">
      {wide ? (
        <div data-reveal="left" style={{ '--i': 3 }} className="relative min-w-0 border-y border-ink" role="tablist" aria-label="Projects">
          <Arrow dir={-1} onClick={() => shift(-1)} disabled={start <= 0} className="absolute -top-4 left-1/2 z-10 -translate-x-1/2" />
          <div ref={listRef} className="h-full overflow-hidden">
            <div className="pl-stack" style={{ height: `${(N / Math.min(WINDOW, N)) * 100}%`, transform: `translateY(${(-start * 100) / N}%)` }}>
              {PROJECTS.map((proj, i) => {
                const inWindow = i >= start && i <= last
                return (
                  <div key={proj.id} style={{ height: `${100 / N}%`, opacity: inWindow ? 1 : 0 }} inert={!inWindow}>
                    <Row proj={proj} active={i === index} onClick={() => press(i)} className={`h-full ${i === last ? 'border-b-0' : ''}`} />
                  </div>
                )
              })}
            </div>
          </div>
          <Arrow dir={1} onClick={() => shift(1)} disabled={start >= maxStart} className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2" />
        </div>
      ) : (
        <div data-reveal="left" style={{ '--i': 3 }} className="min-w-0 border-t border-ink" role="tablist" aria-label="Projects">
          {PROJECTS.map((proj, i) => {
            const folded = open && i !== index
            return (
              <div key={proj.id} className={`acc-row ${folded ? 'folded' : ''}`} inert={folded}>
                <div><Row proj={proj} active={open && i === index} expanded={open && i === index} onClick={() => press(i)} /></div>
              </div>
            )
          })}
          <div className={`acc-panel ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open}>
            <div>
              <div className="border border-t-0 border-ink bg-ground p-4">{card}</div>
            </div>
          </div>
        </div>
      )}

      {wide && (
        <aside data-reveal="right" style={{ '--i': 4 }} className="min-w-0 overflow-hidden border border-ink bg-ground p-4">
          {card}
        </aside>
      )}
    </div>
  )
}
