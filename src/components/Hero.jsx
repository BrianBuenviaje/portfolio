import { useEffect, useRef } from 'react'
import { SITE } from '../data/content.js'
import { seeded, useReducedMotion, scrollToId } from '../lib/util.js'

// Where each letter of the surname may drip: u across the letter's ink (0 left, 1 right), w as a share of
// the letter's width. Flat undersides only, kept in from corners and curves.
const DRIPS = {
  B: [[.17, .12], [.5, .1], [.76, .1]],
  U: [[.5, .13]],
  E: [[.17, .12], [.48, .1], [.8, .1]],
  N: [[.16, .11], [.84, .11]],
  V: [[.5, .1]],
  I: [[.36, .1], [.64, .1]],
  A: [[.15, .1], [.85, .1]],
  J: [[.46, .12]],
}

const glyphCache = new Map()
let measureCtx = null
function ctx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')
  return measureCtx
}
// Rasterise one glyph and record its ink box plus the ink bottom per column, so a drip starts exactly on
// the letter's underside.
function glyphBox(chr, fs, family) {
  const key = chr + '|' + fs
  if (glyphCache.has(key)) return glyphCache.get(key)
  const W = Math.ceil(fs * 1.4), H = Math.ceil(fs * 1.6)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d'), Y0 = Math.round(fs * 1.1)
  g.font = `400 ${fs}px ${family}`; g.textBaseline = 'alphabetic'; g.fillStyle = '#000'; g.fillText(chr, 0, Y0)
  const d = g.getImageData(0, 0, W, H).data
  let x0 = W, x1 = -1, y0 = H, y1 = -1
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (d[(y * W + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  const bottoms = []
  for (let cx = 0; cx < W; cx++) {
    let bb = -1
    for (let cy = H - 1; cy >= 0; cy--) { if (d[(cy * W + cx) * 4 + 3] > 128) { bb = cy; break } }
    bottoms.push(bb < 0 ? null : bb + 1 - Y0)
  }
  const box = { x0, x1: x1 + 1, top: y0 - Y0, bottom: y1 + 1 - Y0, bottoms }
  glyphCache.set(key, box)
  return box
}

const f1 = (v) => v.toFixed(1)
// A drip: vertical bar, round end, concave flare where it meets the letter.
function barPath(x, y, w, L) {
  const r = w / 2, xl = x - r, xr = x + r, yb = y + L - r, fl = w * .55, fh = Math.min(w * .8, L * .35)
  return `M${f1(xl - fl)},${f1(y - 3)} Q${f1(xl)},${f1(y - 1)} ${f1(xl)},${f1(y + fh)} V${f1(yb)} A${f1(r)},${f1(r)} 0 0 0 ${f1(xr)},${f1(yb)} V${f1(y + fh)} Q${f1(xr)},${f1(y - 1)} ${f1(xr + fl)},${f1(y - 3)} Z`
}

function Letters({ text, offset, r }) {
  return (
    <span aria-hidden="true">
      {text.split('').map((ch, i) => (
        <i key={i} className="ch" style={{ '--d': `${(offset + i) * 85}ms`, '--r': `${((r() - .5) * 5).toFixed(1)}deg` }}>{ch}</i>
      ))}
    </span>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const heroRef = useRef(null)
  const paintRef = useRef(null)
  const edgeRef = useRef(null)
  const started = useRef(false)
  const r = seeded(21)

  useEffect(() => {
    const hero = heroRef.current, paint = paintRef.current, edge = edgeRef.current
    if (!hero || !paint || !edge) return

    // Drip anchors come from text metrics, not from the letter elements, so they stay locked to the glyphs
    // whatever the letters are doing (stamp animation, scaling, any viewport width).
    function buildDrips() {
      const hr = hero.getBoundingClientRect()
      paint.setAttribute('viewBox', `0 0 ${Math.round(hr.width)} ${Math.round(hr.height)}`)
      while (paint.firstChild) paint.removeChild(paint.firstChild)
      const rr = seeded(11)
      let order = 0
      const line = hero.querySelector('.hero-name > span:last-child')
      if (!line) return
      const cs = getComputedStyle(line), fs = parseFloat(cs.fontSize), family = cs.fontFamily
      const probe = document.createElement('i'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
      line.appendChild(probe)
      const by = probe.getBoundingClientRect().top - hr.top
      probe.remove()
      const lr = line.getBoundingClientRect(), H = lr.height
      const g = ctx(); g.font = `400 ${fs}px ${family}`
      let x = lr.left - hr.left
      SITE.last.toUpperCase().split('').forEach((chr) => {
        const adv = g.measureText(chr).width
        const rules = DRIPS[chr]
        if (rules) {
          const box = glyphBox(chr, fs, family), bw = box.x1 - box.x0
          rules.forEach((rule) => {
            const col = Math.round(box.x0 + rule[0] * bw)
            let yb = box.bottoms[col]; if (yb == null) yb = box.bottom
            const px = x + box.x0 + rule[0] * bw, py = by + yb, w = rule[1] * bw, L = H * (0.12 + rr() * 0.4)
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path.setAttribute('d', barPath(px, py, w, L))
            path.style.setProperty('--d', `${order * 80 + Math.round(rr() * 160)}ms`); order++
            paint.appendChild(path)
          })
        }
        x += adv
      })
    }

    // The bottom edge of the hero: a smooth, uneven wave drawn to the hero's width.
    function buildEdge() {
      const W = Math.max(320, Math.round(hero.getBoundingClientRect().width)), H = 72, rr = seeded(7)
      edge.setAttribute('viewBox', `0 0 ${W} ${H}`)
      const n = Math.max(5, Math.round(W / 190)), pts = []
      for (let i = 0; i <= n; i++) pts.push({ x: W * i / n, y: i === 0 || i === n ? 20 + rr() * 14 : (i % 2 ? 50 + rr() * 20 : 6 + rr() * 14) })
      let d = `M0,0 H${W} L${W},${pts[n].y.toFixed(1)}`
      for (let k = n; k > 0; k--) {
        const p0 = pts[k], p1 = pts[k - 1], mx = (p0.x + p1.x) / 2
        d += ` C${mx.toFixed(1)},${p0.y.toFixed(1)} ${mx.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
      }
      edge.querySelector('path').setAttribute('d', d + ' Z')
    }

    let timer
    const start = () => {
      buildEdge(); buildDrips()
      if (started.current) return
      started.current = true
      if (reduce) { paint.classList.add('on'); return }
      hero.classList.add('painting')
      const count = SITE.first.length + SITE.last.length
      timer = setTimeout(() => paint.classList.add('on'), count * 85 + 650)
    }
    if (document.fonts?.ready) document.fonts.ready.then(start); else start()
    let rt
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { buildEdge(); buildDrips() }, 120) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); clearTimeout(rt) }
  }, [reduce])

  return (
    <header
      id="top"
      ref={heroRef}
      className="hero snap relative z-20 flex min-h-[100svh] flex-col justify-center gutter bg-field text-ink-deep pt-[calc(env(safe-area-inset-top,0px)+88px)] pb-16"
      style={{ marginTop: '-100svh' }}
    >
      <div className="relative z-[1] mx-auto w-full max-w-[1180px]">
        <p className="label text-terra">{SITE.role}</p>
        <h1
          className="hero-name display mt-3"
          style={{ fontSize: 'clamp(50px, 10.6vw, 154px)', lineHeight: .9, color: 'var(--color-green)' }}
          aria-label={`${SITE.first} ${SITE.last}`}
        >
          <Letters text={SITE.first} offset={0} r={r} />
          <Letters text={SITE.last} offset={SITE.first.length} r={r} />
        </h1>
        <div className="mt-12 md:mt-20">
          <button type="button" className="btn-paint" onClick={() => scrollToId('hello-rest', reduce)}>
            ▶ Run the page
          </button>
        </div>
      </div>

      <svg ref={paintRef} className="paint pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible" aria-hidden="true" viewBox="0 0 1200 600" />
      <svg ref={edgeRef} className="pointer-events-none absolute left-0 right-0 z-[1] block w-full" style={{ bottom: '-72px', height: '72px' }} aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1200 72">
        <path d="M0,0 H1200 V10 L0,10 Z" fill="var(--color-field)" />
      </svg>
    </header>
  )
}
