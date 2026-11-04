import { useState } from 'react'
import { EXPERIENCE } from '../data/content.js'
import Lightbox from './Lightbox.jsx'

export default function Experience() {
  const [open, setOpen] = useState(null)

  return (
    <>
      <div className="border-t border-ink">
        {EXPERIENCE.map((x, i) => (
          <div key={x.id} data-reveal={i % 2 ? 'right' : 'left'} style={{ '--i': 3 + i }} className="grid gap-x-7 gap-y-2 border-b border-line py-5 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1.4fr)_auto]">
            <span className="label pt-1 text-khaki normal-case tracking-normal">{x.when}</span>
            <div>
              <h3 className="display text-xl">{x.org}</h3>
              <p className="label mt-1 text-[11.5px] text-khaki">{x.role}</p>
            </div>
            <ul className="list-disc pl-[18px] text-[15px]">
              {x.bullets.map((b) => <li key={b} className="mb-1">{b}</li>)}
            </ul>
            {x.certificate && (
              <button
                type="button"
                onClick={() => setOpen(x)}
                className="label group justify-self-start text-left text-khaki transition-colors hover:text-ink md:justify-self-end"
                aria-label={`Open certificate: ${x.certificate.alt}`}
              >
                <img src={x.certificate.thumb} alt="" loading="lazy" className="mb-1.5 h-28 w-auto rounded-[3px] border border-line transition-transform duration-200 group-hover:-translate-y-0.5 lg:h-40" />
                Certificate
              </button>
            )}
          </div>
        ))}
      </div>

      {open && <Lightbox src={open.certificate.full} alt={open.certificate.alt} onClose={() => setOpen(null)} />}
    </>
  )
}
