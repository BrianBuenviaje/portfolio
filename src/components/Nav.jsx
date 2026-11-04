import { useEffect, useRef, useState } from 'react'
import { SITE, STAGES } from '../data/content.js'
import { scrollToId, useReducedMotion } from '../lib/util.js'

// Fixed top bar. Hides when you scroll down, slides back when you scroll up, always shown at the top of
// the page. The section in view gets a terracotta pill with white text. Below the md breakpoint the links
// live behind a hamburger that unfolds them in a stack.
export default function Nav({ active }) {
  const reduce = useReducedMotion()
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [covered, setCovered] = useState(false)   // a picture is open full screen
  const lastY = useRef(0)

  useEffect(() => {
    const onLightbox = (e) => { setCovered(!!e.detail); if (e.detail) setOpen(false) }
    document.addEventListener('lightbox', onLightbox)
    return () => document.removeEventListener('lightbox', onLightbox)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY, delta = y - lastY.current
        if (y < 24) setHidden(false)
        else if (delta > 6) { setHidden(true); setOpen(false) }
        else if (delta < -6) setHidden(false)
        lastY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const specIndex = STAGES.findIndex((s) => s.id === 'spec')
  const go = (e, id) => {
    e.preventDefault()
    setOpen(false)
    // A jump past Specializations must not get caught by its scroll hold.
    if (STAGES.findIndex((s) => s.id === id) > specIndex) document.dispatchEvent(new Event('spec:release'))
    scrollToId(id, reduce)
  }
  const links = STAGES.filter((s) => s.nav)
  const pill = (on) => 'rounded-full whitespace-nowrap transition-colors duration-200 ' + (on ? 'bg-terra text-white' : 'hover:bg-ink-deep/10')

  return (
    <nav
      aria-label="Site"
      className="fixed inset-x-0 top-0 z-30 bg-field text-ink-deep transition-transform duration-300 ease-out"
      style={{ transform: covered || (hidden && !open) ? 'translateY(-110%)' : 'translateY(0)' }}
      aria-hidden={covered || undefined}
    >
      <div className="gutter" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6px)', paddingBottom: '6px' }}>
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 label">
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) }}
            className="link-ul py-2"
            aria-label="Back to top"
          >
            {SITE.first} {SITE.last}
          </a>

          <div className="hidden gap-1 md:flex">
            {links.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => go(e, s.id)} aria-current={active === s.id ? 'true' : undefined} className={`px-3 py-1.5 ${pill(active === s.id)}`}>{s.nav}</a>
            ))}
            <a href={SITE.resume} target="_blank" rel="noreferrer" className={`px-3 py-1.5 ${pill(false)}`}>Résumé ↗</a>
          </div>

          <button
            type="button"
            className={`burger md:hidden ${open ? 'open' : ''}`}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div id="site-menu" className={`menu md:hidden ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div>
          <div className="gutter mx-auto grid max-w-[1180px] gap-1 pb-5 pt-1 label">
            {links.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => go(e, s.id)}
                tabIndex={open ? 0 : -1}
                aria-current={active === s.id ? 'true' : undefined}
                style={{ '--i': i }}
                className={`w-fit px-4 py-2.5 text-[13px] ${pill(active === s.id)}`}
              >
                {s.nav}
              </a>
            ))}
            <a href={SITE.resume} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} style={{ '--i': links.length }} className={`w-fit px-4 py-2.5 text-[13px] ${pill(false)}`}>Résumé ↗</a>
          </div>
        </div>
      </div>
    </nav>
  )
}
