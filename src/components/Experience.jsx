import { useState } from 'react'
import { EXPERIENCE } from '../data/content.js'
import Lightbox from './Lightbox.jsx'

// Each point is marked with the same chevron as the stage headings, hanging in the margin.
function Points({ items }) {
  return (
    <ul className="grid content-start gap-y-1.5 text-[14.5px] leading-[1.5] lg:text-[15px]">
      {items.map((b) => (
        <li key={b} className="relative pl-5">
          <span aria-hidden="true" className="absolute left-0 top-0 text-terra" style={{ fontFamily: 'var(--font-mark)', fontWeight: 700, fontSize: '1.05em', lineHeight: 1.35 }}>&gt;</span>
          {b}
        </li>
      ))}
    </ul>
  )
}

// The certificate thumbnail with its caption; opens the full scan. It scales to fit a box that grows
// with the screen: beside the heading block on phones and tablets, its own column on wide screens.
function Certificate({ cert, onOpen, className = '' }) {
  return (
    <button type="button" onClick={onOpen} className={`label group cursor-pointer text-left text-khaki transition-colors hover:text-ink ${className}`} aria-label={`Open certificate: ${cert.alt}`}>
      <img src={cert.thumb} alt="" loading="lazy" className="mb-1.5 h-auto max-h-24 w-auto max-w-[124px] rounded-[3px] border border-line transition-transform duration-200 group-hover:-translate-y-0.5 md:max-h-32 md:max-w-[180px] lg:max-h-40 lg:max-w-full" />
      <span className="block text-[10px] lg:text-[12px]">Certificate</span>
    </button>
  )
}

// One row per post. From lg up, four equal columns: date | organisation and role | points | certificate,
// the same in every row. Below lg the date, organisation and role share the first row with the
// certificate, and the points run full width under them.
export default function Experience() {
  const [open, setOpen] = useState(null)

  return (
    <>
      <div className="border-t border-ink">
        {EXPERIENCE.map((x, i) => (
          <div key={x.id} data-reveal={i % 2 ? 'right' : 'left'} style={{ '--i': 3 + i }} className="grid gap-x-7 gap-y-3.5 border-b border-line py-5 lg:grid-cols-4 lg:gap-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 lg:contents">
              <div className="lg:contents">
                <span className="label block text-[11px] normal-case tracking-normal text-khaki lg:pt-1 lg:text-[12px]">{x.when}</span>
                <div className="mt-1 lg:mt-0">
                  <h3 className="display text-[18px] lg:text-xl">{x.org}</h3>
                  {/* The role's parts never break inside themselves, only between them. */}
                  <p className="label mt-1 text-[10.5px] text-khaki lg:text-[11.5px]">
                    {x.role.split(' · ').map((part, j) => (
                      <span key={part}>{j > 0 && ' · '}<span className="whitespace-nowrap">{part}</span></span>
                    ))}
                  </p>
                </div>
              </div>
              {x.certificate && <Certificate cert={x.certificate} onOpen={() => setOpen(x)} className="self-start justify-self-end lg:hidden" />}
            </div>
            <Points items={x.bullets} />
            {x.certificate && <Certificate cert={x.certificate} onOpen={() => setOpen(x)} className="hidden lg:block lg:justify-self-end" />}
          </div>
        ))}
      </div>

      {open && <Lightbox src={open.certificate.full} alt={open.certificate.alt} onClose={() => setOpen(null)} />}
    </>
  )
}
