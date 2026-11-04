import { useEffect, useRef, useState } from 'react'
import { LOGOS } from '../data/logos.js'
import { useReducedMotion } from '../lib/util.js'

// Extra scroll distance the stage is pinned for. The wrapper in App.jsx is 100svh + this.
export const SPEC_SCROLL = `${LOGOS.length * 20}svh`
// Gap between one logo starting to draw and the next, however fast the page is scrolled.
const STEP_MS = 320

function Logo({ logo, on, index }) {
  const ref = useRef(null)
  // Give every stroked part its own dash: one dash the length of the path, then a gap longer than the
  // path, parked just past the start. Nothing of it (not even a round cap) is on the path until it moves.
  useEffect(() => {
    ref.current?.querySelectorAll('.draw, .ring').forEach((el) => {
      const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 200
      el.style.strokeDasharray = `${len.toFixed(1)} ${(len + 12).toFixed(1)}`
      el.style.setProperty('--off', (len + 5).toFixed(1))
    })
  }, [])
  const sw = logo.strokeWidth ?? 2
  return (
    <div ref={ref} className={`spec-logo flex flex-col items-center gap-2 sm:gap-3 ${on ? 'on' : ''}`} aria-label={logo.name}>
      <svg viewBox="0 0 120 120" className="h-[clamp(62px,9vw,120px)] w-[clamp(62px,9vw,120px)]" aria-hidden="true">
        <circle className="ring" cx="60" cy="60" r="56" fill="none" stroke="var(--color-terra)" strokeWidth="2.5" transform="rotate(-90 60 60)" />
        <svg viewBox={logo.viewBox} x="30" y="30" width="60" height="60">
          {logo.parts.map((p, i) => {
            if (p.tag === 'text') {
              const { knockout, ...attrs } = p.attrs
              return (
                <text key={i} textAnchor="middle" dominantBaseline="middle" fontWeight="500" {...attrs} className="txt" fontFamily="var(--font-mono)" fill={knockout ? 'var(--color-ground)' : 'var(--color-ink)'} stroke="none">{p.text}</text>
              )
            }
            const { solid, ...attrs } = p.attrs
            const Tag = p.tag
            return <Tag key={i} {...attrs} className={solid ? 'draw solid' : 'draw'} fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          })}
        </svg>
      </svg>
      <span className="name label whitespace-nowrap text-[9px] text-khaki sm:text-[11px]"><span className="hidden sm:inline">{String(index + 1).padStart(2, '0')} · </span>{logo.name}</span>
    </div>
  )
}

// Rings sit in a brick pattern: each row is offset by half a cell so the row below fills the gaps of the
// row above. Row length comes from the container width (leaving room for the half-cell offset), capped
// at five so desktop always gets two rows. Cells shrink on phones so three fit across.
function useRows(ref) {
  const [layout, setLayout] = useState({ k: 5, cell: 150 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth, cell = w < 560 ? 84 : 150
      setLayout({ k: Math.max(2, Math.min(5, Math.floor((w - cell / 2) / cell))), cell })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  const rows = []
  for (let i = 0; i < LOGOS.length; i += layout.k) rows.push(LOGOS.slice(i, i + layout.k))
  // Centred rows whose lengths differ by one already interlock; equal-length rows need a half-cell shift.
  // When any row needs it, the shift is split both ways so the whole block stays centred.
  const extra = rows.map((row, r) => (r % 2) !== (((rows[0].length - row.length) % 2 !== 0) ? 1 : 0))
  const any = extra.some(Boolean)
  const shifts = rows.map((_, r) => (any ? (extra[r] ? layout.cell / 4 : -layout.cell / 4) : 0))
  return { rows, cell: layout.cell, shifts }
}

// Heading first, a scroll prompt at the bottom. Scrolling draws the logos one by one, left to right,
// each inside a ring that is traced along with it.
export default function Specializations() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [count, setCount] = useState(0)   // how many the scroll position asks for
  const [shown, setShown] = useState(0)   // how many are actually drawn; walks toward count one at a time
  const [hint, setHint] = useState(true)
  const { rows, cell, shifts } = useRows(ref)

  useEffect(() => {
    if (shown === count) return
    const t = setTimeout(() => setShown((s) => (s < count ? s + 1 : s - 1)), reduce ? 0 : STEP_MS)
    return () => clearTimeout(t)
  }, [shown, count, reduce])

  useEffect(() => {
    if (reduce) { setCount(LOGOS.length); setHint(false); return }
    const stage = ref.current?.closest('section')
    const wrap = stage?.parentElement?.parentElement
    if (!wrap) return
    // One rect read per scroll event is cheap, and not waiting for an animation frame means the queue
    // keeps time even when the page is in a background tab.
    const update = () => {
      const r = wrap.getBoundingClientRect(), total = Math.max(1, wrap.offsetHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / total))
      setCount(Math.min(LOGOS.length, Math.floor(p * (LOGOS.length + 0.999))))
      setHint(p < 0.06)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [reduce])

  return (
    <div ref={ref}>
      <div className="flex flex-col items-center gap-y-6 pt-4">
        {rows.map((row, r) => {
          const first = rows.slice(0, r).reduce((n, x) => n + x.length, 0)
          return (
            <div key={r} className="flex justify-center" style={{ transform: shifts[r] ? `translateX(${shifts[r]}px)` : 'none' }}>
              {row.map((logo, j) => (
                <div key={logo.id} style={{ width: cell }} className="flex justify-center">
                  <Logo logo={logo} on={first + j < shown} index={first + j} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div
        className="scroll-hint pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 label text-khaki"
        style={{ opacity: hint ? 1 : 0 }}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-terra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </div>
    </div>
  )
}
