import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/util.js'

// One stage on the rail. Flips queued → running → done the first time it enters the viewport and reports
// that upward so the rail can fill. Entrance and exit motion of its content is handled per element by the
// reveal observer in App (anything marked data-reveal).
export default function Stage({ stage, onStatus, children, className = '', snap = true }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [status, setStatus] = useState('queued')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        setStatus((s) => {
          if (s === 'done') return s
          t = setTimeout(() => setStatus('done'), reduce ? 0 : 900)
          return 'running'
        })
      }),
      { rootMargin: '-20% 0px -35% 0px' },
    )
    io.observe(el)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [reduce])

  useEffect(() => { onStatus?.(stage.id, status, ref.current) }, [status, stage.id, onStatus])

  return (
    <section
      id={stage.id}
      ref={ref}
      data-stage={stage.id}
      className={`stage ${snap ? 'snap' : ''} relative flex min-h-[100svh] flex-col justify-center border-t border-line py-20 ${status} ${className}`}
      style={{ paddingLeft: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 40px)', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="stage-head mb-7 flex flex-wrap items-baseline gap-x-7 gap-y-4">
          {/* Fredoka's chevron inks 0.675em tall against Gasoek's 0.775em caps, so it is set 15% larger to read
              as the heading's size; at that size its centre sits within a pixel of the cap centre on the baseline. */}
          <span data-reveal="left" aria-hidden="true" style={{ '--i': 0, fontSize: 'calc(clamp(26px, 7vw, 80px) * 1.15)', fontFamily: 'var(--font-mark)', fontWeight: 700, lineHeight: 0.85 }} className="text-terra">&gt;</span>
          <h2 data-reveal="left" style={{ '--i': 1, fontSize: 'clamp(26px, 7vw, 80px)' }} className="display">{stage.title}</h2>
          <span data-reveal="right" style={{ '--i': 2 }} className="status ml-auto inline-flex items-center gap-2 border border-line px-2.5 py-1 label text-[11.5px] text-khaki">{status}</span>
        </div>
        {children}
      </div>
    </section>
  )
}
