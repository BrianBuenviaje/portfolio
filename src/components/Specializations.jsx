import { useEffect, useRef, useState } from 'react'
import { LOGOS } from '../data/logos.js'
import { useReducedMotion } from '../lib/util.js'

const N = LOGOS.length
const STEP_MS = 320      // gap between one logo starting to draw and the next, whatever the input rate
const DRAW_MS = 1500     // ring, mark and label of one logo
const SETTLE_MS = 700    // pause after the last logo before the page is allowed to move on

function Logo({ logo, on, size }) {
  const ref = useRef(null)
  // Every stroked part gets one dash the length of the path and a gap longer than the path, parked just
  // past the start, so nothing of it (not even a round cap) is on the path until the logo is live.
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
      <svg viewBox="0 0 120 120" style={{ width: size, height: size }} aria-hidden="true">
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
      <span className="name label whitespace-nowrap text-[9px] text-khaki sm:text-[11px]">{logo.name}</span>
    </div>
  )
}

// Rings sit in a brick pattern: each row is offset by half a cell so the row below fills the gaps of the
// row above. Row length comes from the width (leaving room for the offset), capped at five; ring size
// comes from whichever is tighter, the cell or the height left under the heading.
function useLayout(ref) {
  const [lay, setLay] = useState({ k: 5, cell: 150, ring: 120 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth, short = window.innerHeight < 520
      // Narrow screens get small cells (three across); short ones get mid cells so five fit in a row and
      // the grid stays two rows tall.
      const cell = w < 560 ? 84 : (short ? Math.max(84, Math.min(112, Math.floor((w - 56) / 5))) : 150)
      const k = Math.max(2, Math.min(5, Math.floor((w - cell / 2) / cell)))
      const rows = Math.ceil(N / k)
      const section = el.closest('section'), head = section?.querySelector('.stage-head')
      // Room for the rings is what the screen leaves after the stage's padding, heading and the scroll
      // prompt. Measured from the viewport, not the section, since the section would grow to fit them.
      let avail = 600
      if (section) {
        const cs = getComputedStyle(section), hs = head ? getComputedStyle(head) : null
        avail = window.innerHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
          - (head?.offsetHeight ?? 90) - (hs ? parseFloat(hs.marginBottom) : 28) - (short ? 52 : 70)
      }
      const ring = Math.max(44, Math.min(120, cell - 12, Math.floor(avail / rows) - 34))
      setLay({ k, cell, ring })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [ref])
  const rows = []
  for (let i = 0; i < N; i += lay.k) rows.push(LOGOS.slice(i, i + lay.k))
  // Centred rows whose lengths differ by one already interlock; equal-length rows need a half-cell shift,
  // split both ways so the block stays centred.
  const extra = rows.map((row, r) => (r % 2) !== (((rows[0].length - row.length) % 2 !== 0) ? 1 : 0))
  const any = extra.some(Boolean)
  const shifts = rows.map((_, r) => (any ? (extra[r] ? lay.cell / 4 : -lay.cell / 4) : 0))
  return { rows, cell: lay.cell, ring: lay.ring, shifts }
}

// Heading first, a scroll prompt at the bottom. The stage is reached by ordinary scrolling (the page's
// snapping finishes the last stretch); the moment its top meets the top of the screen the page holds
// still, each scroll gesture draws the next logo, and only when all nine are drawn (plus a short settle)
// does scrolling continue. Scrolling up lets go without undrawing anything. Plays once per visit.
export default function Specializations() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [count, setCount] = useState(0)    // how many have been asked for
  const [shown, setShown] = useState(0)    // how many are drawn; walks toward count one at a time, never back
  const [done, setDone] = useState(false)
  const [locked, setLocked] = useState(false)
  // Mirrors of done/locked for the scroll handlers, set at the same moment as the state so nothing waits
  // for a render. armed goes false on a release and true again once the stage has mostly left the screen.
  const doneRef = useRef(false), lockedRef = useRef(false), armed = useRef(true), lockY = useRef(0)
  const settling = useRef(false)   // gliding back after an overshoot; the pin and the drawing wait for it
  const letGo = useRef(null)       // detaches the hold's input listeners
  const { rows, cell, ring, shifts } = useLayout(ref)

  const finish = () => {
    doneRef.current = true; lockedRef.current = false; settling.current = false
    letGo.current?.()
    setCount(N); setShown(N); setDone(true); setLocked(false)
  }

  // The queue.
  useEffect(() => {
    if (shown >= count) return
    const t = setTimeout(() => setShown((s) => Math.min(N, s + 1)), reduce ? 0 : STEP_MS)
    return () => clearTimeout(t)
  }, [shown, count, reduce])

  // All drawn: let the last one finish, settle, then release the page.
  useEffect(() => {
    if (done || shown < N) return
    const t = setTimeout(finish, reduce ? 0 : DRAW_MS + SETTLE_MS)
    return () => clearTimeout(t)
  }, [shown, done, reduce])   // eslint-disable-line react-hooks/exhaustive-deps

  // Reduced motion: everything at once, never hold the page.
  useEffect(() => { if (reduce) finish() }, [reduce])   // eslint-disable-line react-hooks/exhaustive-deps

  // A nav jump past this stage finishes it instantly instead of catching the jump.
  useEffect(() => {
    const onRelease = () => { if (!doneRef.current) finish() }
    document.addEventListener('spec:release', onRelease)
    return () => document.removeEventListener('spec:release', onRelease)
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // The hold. Nothing moves the page on its own: it is pinned where the reader's own scrolling (or the
  // page's snapping) put it, and only a fast scroll that carried it past the top gets a short glide back.
  useEffect(() => {
    if (reduce) return
    const section = ref.current?.closest('section')
    if (!section) return
    let acc = 0, touchY = null, lastY = window.scrollY
    const request = (n = 1) => setCount((c) => Math.min(N, c + n))
    // Every 60px of wheel travel asks for one more logo, so a flick queues several; the queue still
    // draws them one at a time. Gestures during the glide back are swallowed, not counted.
    const onWheel = (e) => {
      if (e.deltaY < 0) { release(); return }
      e.preventDefault()
      if (settling.current) return
      acc += e.deltaY
      const n = Math.floor(acc / 60)
      if (n > 0) { acc -= n * 60; request(n) }
    }
    const onTouchStart = (e) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e) => {
      if (touchY == null) { touchY = e.touches[0].clientY; return }
      const dy = touchY - e.touches[0].clientY   // positive: finger moved up, i.e. scrolling down
      if (dy < -30) { release(); return }
      e.preventDefault()
      if (settling.current) return
      if (dy > 36) { touchY = e.touches[0].clientY; request() }
    }
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key)) { e.preventDefault(); if (!settling.current) request() }
      else if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) release()
    }
    // Input listeners live only while held, attached the moment the hold starts (not after a render),
    // so no gesture slips through between the two.
    const listen = (on) => {
      const f = on ? window.addEventListener.bind(window) : window.removeEventListener.bind(window)
      f('wheel', onWheel, { passive: false })
      f('touchstart', onTouchStart, { passive: true })
      f('touchmove', onTouchMove, { passive: false })
      f('keydown', onKey)
    }
    // The page itself is made unscrollable while held (its scrollbar gutter stays, so nothing shifts):
    // once a scroll is in motion the browser delivers the rest of its wheel events as non-cancellable,
    // and a frame of movement pulled straight back reads as the page straining against the hold.
    const html = document.documentElement
    const unhold = () => { listen(false); html.style.overflowY = '' }
    const release = () => { unhold(); lockedRef.current = false; settling.current = false; armed.current = false; setLocked(false) }
    const engage = () => {
      const top = section.getBoundingClientRect().top + window.scrollY
      lockY.current = top; lockedRef.current = true; acc = 0; touchY = null
      listen(true); html.style.overflowY = 'hidden'; setLocked(true)
      if (Math.abs(window.scrollY - top) < 1) return
      // Overshot: glide back. The target is a snap point, so the browser's own snapping agrees with it.
      // Should something keep pushing the page away (a fling still running), pin it instead.
      settling.current = true
      window.scrollTo({ top, behavior: 'smooth' })
      const t0 = performance.now()
      let prev = window.scrollY, away = 0
      const landed = () => {
        if (!settling.current) return
        const y = window.scrollY
        away = Math.abs(y - top) > Math.abs(prev - top) ? away + 1 : 0
        prev = y
        if (Math.abs(y - top) < 1) settling.current = false
        else if (away >= 2 || performance.now() - t0 > 800) { settling.current = false; window.scrollTo({ top, behavior: 'instant' }) }
        else requestAnimationFrame(landed)
      }
      requestAnimationFrame(landed)
    }
    // Engage when the stage's top reaches the top of the screen: on the way down a small overshoot (one
    // frame of fast scrolling) still counts; from below only an exact landing does, so the hold never
    // drags the page against the direction it was going.
    const check = (down) => {
      if (doneRef.current || lockedRef.current || !armed.current) return
      const top = section.getBoundingClientRect().top
      if (top <= 4 && top > (down ? -window.innerHeight * 0.45 : -4)) engage()
    }
    const onScroll = () => {
      const y = window.scrollY, down = y > lastY
      lastY = y
      if (!lockedRef.current) { check(down); return }
      if (!settling.current && Math.abs(y - lockY.current) > 1) window.scrollTo({ top: lockY.current, behavior: 'instant' })
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.intersectionRatio < 0.3) armed.current = true }), { threshold: [0, 0.3] })
    io.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })
    letGo.current = unhold
    check(true)   // a page restored or re-mounted at this stage holds straight away
    return () => { io.disconnect(); unhold(); window.removeEventListener('scroll', onScroll); letGo.current = null }
  }, [reduce])

  return (
    <div ref={ref}>
      <div data-reveal="scale" style={{ '--i': 3 }} className="flex flex-col items-center gap-y-5 pt-2 sm:gap-y-6 sm:pt-4">
        {rows.map((row, r) => {
          const first = rows.slice(0, r).reduce((n, x) => n + x.length, 0)
          return (
            <div key={r} className="flex justify-center" style={{ transform: shifts[r] ? `translateX(${shifts[r]}px)` : 'none' }}>
              {row.map((logo, j) => (
                <div key={logo.id} style={{ width: cell }} className="flex justify-center">
                  <Logo logo={logo} on={first + j < shown} size={ring} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div
        className="scroll-hint pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 label text-khaki"
        style={{ opacity: done ? 0 : 1 }}
        aria-hidden="true"
      >
        <span>{locked ? 'Keep scrolling' : 'Scroll'}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-terra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </div>
    </div>
  )
}
