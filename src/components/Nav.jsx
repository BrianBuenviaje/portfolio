import { useEffect, useRef, useState } from 'react'
import { SITE, STAGES } from '../data/content.js'
import { scrollToId, useReducedMotion } from '../lib/util.js'

// Fixed top bar. Hides when you scroll down, slides back when you scroll up, always shown at the top
// of the page. The section in view gets a terracotta pill with white text.
export default function Nav({ active }) {
  const reduce = useReducedMotion()
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        if (y < 24) setHidden(false)
        else if (delta > 6) setHidden(true)
        else if (delta < -6) setHidden(false)
        lastY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = STAGES.filter((s) => s.nav)

  return (
    <nav
      aria-label="Site"
      className="fixed inset-x-0 top-0 z-30 gutter bg-field text-ink-deep transition-transform duration-300 ease-out"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        paddingBottom: '8px',
        transform: hidden ? 'translateY(-110%)' : 'translateY(0)',
      }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-3 gap-y-1 label text-[11px] sm:text-[12px]">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) }}
          aria-label="Back to top"
          className="link-ul"
        >
          {SITE.first} {SITE.last}
        </a>
        <div className="flex flex-wrap gap-0.5 sm:gap-1">
          {links.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => { e.preventDefault(); scrollToId(s.id, reduce) }}
              aria-current={active === s.id ? 'true' : undefined}
              className={
                'rounded-full px-2.5 py-1.5 whitespace-nowrap transition-colors duration-200 sm:px-3 ' +
                (active === s.id ? 'bg-terra text-white' : 'hover:bg-ink-deep/10')
              }
            >
              {s.nav}
            </a>
          ))}
          <a href={SITE.resume} target="_blank" rel="noreferrer" className="rounded-full px-2.5 py-1.5 whitespace-nowrap transition-colors duration-200 hover:bg-ink-deep/10 sm:px-3">
            Résumé ↗
          </a>
        </div>
      </div>
    </nav>
  )
}
