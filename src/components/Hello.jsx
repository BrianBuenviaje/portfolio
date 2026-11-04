import { SITE } from '../data/content.js'

export default function Hello() {
  return (
    <div className="grid gap-7 md:grid-cols-[1.2fr_1fr] md:gap-x-14">
      <p data-reveal="left" style={{ '--i': 3 }} className="max-w-[20ch] text-[clamp(24px,3vw,38px)] font-semibold leading-[1.15] tracking-[-.015em]">{SITE.tagline}</p>
      <div className="grid gap-4 text-[15px]">
        <p data-reveal="right" style={{ '--i': 4 }} className="max-w-[52ch]">{SITE.pitch}</p>
        <p data-reveal="right" style={{ '--i': 5 }} className="max-w-[52ch]">{SITE.status}</p>
      </div>
    </div>
  )
}
