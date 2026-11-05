import { useEffect, useRef, useState } from 'react'
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
  const railRef = useRef(null), fillRef = useRef(null)
  const [active, setActive] = useState('home')
  useReveal()

  // The rail fills down to the middle of the screen, so its tip travels with the reader and meets each
  // stage's marker as that scrolls past the centre. Written straight to the element on every scroll.
  useEffect(() => {
    const rail = railRef.current, fill = fillRef.current
    if (!rail || !fill) return
    const update = () => {
      const tip = window.innerHeight / 2 - rail.getBoundingClientRect().top
      fill.style.height = `${Math.max(0, Math.min(rail.offsetHeight, tip))}px`
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  // Nav highlight follows the section nearest the middle of the screen.
  useEffect(() => {
    const spy = new IntersectionObserver(
      // The hero and the Hello stage under it both count as Home.
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id === 'top' || e.target.id === 'boot' ? 'home' : e.target.id) }),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    ;['top', ...STAGES.map((s) => s.id)].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el) })
    return () => spy.disconnect()
  }, [])

  return (
    <>
      <a href="#boot" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[7px] focus:bg-terra focus:px-4 focus:py-3 focus:text-white label">Skip to content</a>
      <Nav active={active} />
      <div ref={railRef} className="relative">
        <div aria-hidden="true" className="absolute top-0 bottom-0 w-[2px] bg-line" style={{ left: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 7px)' }} />
        <div ref={fillRef} aria-hidden="true" className="absolute top-0 w-[2px] bg-rail" style={{ left: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 7px)', height: 0 }} />

        {/* Curtain: Hello sits still underneath while the Hero lifts away above it. The spacer after the
            Hero is where the page rests with Hello fully revealed. */}
        <div className="relative">
          <div className="sticky top-0 z-0 h-[100svh]">
            <Stage stage={byId.boot} snap={false} className="h-[100svh] min-h-0 border-t-0 [&::before]:top-[calc(50%-6px)]"><Hello /></Stage>
          </div>
          <Hero />
          <div id="hello-rest" className="snap h-[100svh]" aria-hidden="true" />
        </div>

        <div className="relative z-10">
          <Stage stage={byId.spec} className="[&::before]:top-[calc(50%-6px)]"><Specializations /></Stage>
          <Stage stage={byId.build}><Work /></Stage>
          <Stage stage={byId.ship}><Experience /></Stage>
          <Stage stage={byId.contact} after={<Footer />}><Contact /></Stage>
        </div>
      </div>
    </>
  )
}
