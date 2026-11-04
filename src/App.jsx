import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGES } from './data/content.js'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Stage from './components/Stage.jsx'
import Hello from './components/Hello.jsx'
import Specializations from './components/Specializations.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

const byId = Object.fromEntries(STAGES.map((s) => [s.id, s]))

// Layout position of an element inside a container, unaffected by sticky offsets or transforms.
function offsetWithin(el, container) {
  let y = 0
  while (el && el !== container) { y += el.offsetTop; el = el.offsetParent }
  return y
}

// Every element marked data-reveal animates in as it enters the middle band of the screen and out as it
// nears an edge, sliding back the way it came. data-out records which edge it is leaving through.
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const el = e.target
        if (e.isIntersecting) el.classList.add('in')
        else { el.dataset.out = e.boundingClientRect.top < 0 ? 'up' : 'down'; el.classList.remove('in') }
      }),
      { rootMargin: '-6% 0px -9% 0px', threshold: 0 },
    )
    const observeAll = () => document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    observeAll()
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}

export default function App() {
  const railRef = useRef(null)
  const [statuses, setStatuses] = useState({})
  const [fill, setFill] = useState(0)
  const [active, setActive] = useState(null)
  const els = useRef({})
  useReveal()

  const onStatus = useCallback((id, status, el) => {
    els.current[id] = el
    setStatuses((s) => (s[id] === status ? s : { ...s, [id]: status }))
  }, [])

  // The rail fills to the furthest stage reached.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const update = () => {
      let last = null
      STAGES.forEach((s) => { if (statuses[s.id] === 'running' || statuses[s.id] === 'done') last = s.id })
      if (!last || !els.current[last]) { setFill(0); return }
      setFill(Math.min(100, (offsetWithin(els.current[last], rail) + 68) / rail.offsetHeight * 100))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [statuses])

  // Nav highlight follows the section nearest the middle of the screen.
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id === 'top' ? null : e.target.id) }),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    ;['top', ...STAGES.map((s) => s.id)].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el) })
    return () => spy.disconnect()
  }, [])

  const live = (id) => statuses[id] === 'running' || statuses[id] === 'done'

  return (
    <>
      <a href="#boot" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[7px] focus:bg-terra focus:px-4 focus:py-3 focus:text-white label">Skip to content</a>
      <Nav active={active} />
      <div ref={railRef} className="relative">
        <div aria-hidden="true" className="absolute top-0 bottom-0 w-[2px] bg-line" style={{ left: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 7px)' }} />
        <div aria-hidden="true" className="absolute top-0 w-[2px] bg-rail transition-[height] duration-400 ease-out" style={{ left: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 7px)', height: `${fill}%` }} />

        {/* Curtain: Hello sits still underneath while the Hero lifts away above it. The spacer after the
            Hero is where the page rests with Hello fully revealed. */}
        <div className="relative">
          <div className="sticky top-0 z-0 h-[100svh]">
            <Stage stage={byId.boot} onStatus={onStatus} snap={false} className="h-[100svh] min-h-0 border-t-0 [&::before]:top-[calc(50%-6px)]"><Hello /></Stage>
          </div>
          <Hero />
          <div id="hello-rest" className="snap h-[100svh]" aria-hidden="true" />
        </div>

        <div className="relative z-10 bg-ground">
          <Stage stage={byId.spec} onStatus={onStatus} className="[&::before]:top-[calc(50%-6px)]"><Specializations /></Stage>
          <Stage stage={byId.build} onStatus={onStatus}><Work live={live('build')} /></Stage>
          <Stage stage={byId.ship} onStatus={onStatus}><Experience /></Stage>
          <Stage stage={byId.contact} onStatus={onStatus}><Contact /></Stage>
          <Footer />
        </div>
      </div>
    </>
  )
}
