import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/util.js'

// One stage on the rail. Flips queued → running → done the first time it enters the viewport and reports
// that upward so the rail can fill. Separately, it carries an `in` class whenever it is on screen so its
// [data-reveal] children can animate in on entry and out on exit.
export default function Stage({ stage, onStatus, children, className = '', snap = true }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [status, setStatus] = useState('queued')
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t
    const statusIo = new IntersectionObserver(
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
    const viewIo = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting && e.intersectionRatio > 0)),
      { threshold: [0, 0.12], rootMargin: '-8% 0px -8% 0px' },
    )
    statusIo.observe(el); viewIo.observe(el)
    return () => { statusIo.disconnect(); viewIo.disconnect(); clearTimeout(t) }
  }, [reduce])

  useEffect(() => { onStatus?.(stage.id, status, ref.current) }, [status, stage.id, onStatus])

  return (
    <section
      id={stage.id}
      ref={ref}
      data-stage={stage.id}
      className={`stage ${snap ? 'snap' : ''} relative flex min-h-[100svh] flex-col justify-center border-t border-line py-20 ${status} ${inView ? 'in' : ''} ${className}`}
      style={{ paddingLeft: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 40px)', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-7 flex flex-wrap items-baseline gap-x-7 gap-y-4">
          <span data-reveal="left" style={{ '--i': 0 }} className="label min-w-[90px] text-khaki">{stage.num} / {stage.name}</span>
          <h2 data-reveal="left" style={{ '--i': 1, fontSize: 'clamp(26px, 7vw, 80px)' }} className="display">{stage.title}</h2>
          <span data-reveal="right" style={{ '--i': 2 }} className="status ml-auto inline-flex items-center gap-2 border border-line px-2.5 py-1 label text-[11.5px] text-khaki">{status}</span>
        </div>
        {children}
      </div>
    </section>
  )
}
