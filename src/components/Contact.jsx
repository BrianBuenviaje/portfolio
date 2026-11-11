import { useEffect, useState } from 'react'
import { SITE } from '../data/content.js'

const KEY = 'commit-log'

// Delivery is EmailJS, called straight from the browser, the way the first portfolio's contact form was
// written: the same three settings under the same names, and the same template fields. They are public
// identifiers (they ship to every visitor); the host supplies them at build time. Until they are set the
// form hands the message to the visitor's own mail app instead of pretending to have sent it.
const MAIL = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}
const canSend = Boolean(MAIL.service && MAIL.template && MAIL.key)

async function deliver({ name, email, message }) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: MAIL.service,
      template_id: MAIL.template,
      user_id: MAIL.key,
      template_params: { from_name: name, from_email: email, reply_to: email, subject: `Portfolio message from ${name}`, message },
    }),
  })
  if (!res.ok) throw new Error(`EmailJS answered ${res.status}`)
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

const field = 'min-w-0 border border-line bg-ground px-3 py-2.5 font-sans text-base text-ink placeholder:text-khaki/80 focus:border-rail focus:outline-none'

// Email as plain text with a copy button, the usual links, and a message form shaped like a commit log.
// A message goes to Brian's inbox; the log underneath is the visitor's own record of what they sent, kept
// in their browser.
export default function Contact() {
  const [log, setLog] = useState(load)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [trap, setTrap] = useState('')        // hidden field only a bot fills in
  const [status, setStatus] = useState('idle')   // idle | sending | sent | error | handoff
  const [copied, setCopied] = useState(false)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(log.slice(0, 50))) } catch { /* private window */ } }, [log])

  const record = (text) => {
    const hash = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    setLog((l) => [{ hash, msg: text, at: Date.now() }, ...l])
    setMsg('')
  }

  const commit = async (e) => {
    e.preventDefault()
    const n = name.trim(), a = email.trim(), v = msg.trim()
    if (!n || !a || !v || status === 'sending') return
    if (trap) { setMsg(''); setStatus('sent'); return }
    if (!canSend) {
      // No delivery settings in this build: open the visitor's mail app with the message written out.
      const subject = encodeURIComponent(`Portfolio message from ${n}`)
      const body = encodeURIComponent(`${v}\n\n${n}\n${a}`)
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`
      setStatus('handoff')
      return
    }
    setStatus('sending')
    try {
      await deliver({ name: n, email: a, message: v })
      record(v)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const copy = async () => {
    if (!SITE.email) return
    try { await navigator.clipboard.writeText(SITE.email); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* fallback below */ }
  }

  const links = [
    ['GitHub', SITE.github],
    SITE.linkedin && ['LinkedIn', SITE.linkedin],
    ['Résumé', SITE.resume],
  ].filter(Boolean)

  const note = {
    idle: canSend ? 'Goes straight to my inbox.' : 'Opens your email app with this message.',
    sending: 'Sending…',
    sent: 'Sent. It is in my inbox now.',
    error: `That did not go through. Write to ${SITE.email} instead.`,
    handoff: `Your email app should open with this message. If it does not, write to ${SITE.email}.`,
  }[status]

  return (
    <div>
      <p data-reveal="left" style={{ '--i': 3 }} className="label text-khaki">Say hi</p>
      {/* The address: from md up the big display line with its Copy button beside it; below md a boxed
          line with the button on its end, so it never breaks mid-word. */}
      <div data-reveal="left" style={{ '--i': 4 }} className="mt-2">
        <p className="display hidden flex-wrap items-center gap-4 break-all md:flex" style={{ fontSize: 'clamp(20px, 3.6vw, 44px)' }}>
          {SITE.email || 'email coming soon'}
          {SITE.email && (
            <button type="button" onClick={copy} className="btn-paint text-[12px]" style={{ padding: '6px 10px' }}>{copied ? 'Copied' : 'Copy'}</button>
          )}
        </p>
        <div className="flex items-stretch rounded-[4px] border border-line md:hidden">
          <span className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-[13.5px]">{SITE.email || 'email coming soon'}</span>
          {SITE.email && (
            <button type="button" onClick={copy} className="label cursor-pointer rounded-r-[3px] bg-terra px-3.5 text-[11px] text-white transition-colors active:bg-terra-soft">{copied ? 'Copied' : 'Copy'}</button>
          )}
        </div>
      </div>
      {/* Links: pills below md (room for a thumb), plain underlined links from md up. */}
      <div data-reveal style={{ '--i': 5 }} className="mt-4 flex flex-wrap gap-2 label md:mt-5 md:gap-5">
        {links.map(([label, href]) => (
          <a key={label} className="link-ul rounded-full border border-line px-3 py-1.5 md:rounded-none md:border-0 md:px-0 md:py-0" href={href} target="_blank" rel="noreferrer">{label} ↗</a>
        ))}
      </div>

      <div data-reveal="scale" style={{ '--i': 6 }} className="mt-7 border-t border-ink font-mono text-[13px] md:mt-8">
        {log.length === 0 && <p className="py-3 text-khaki">No commits yet. Leave the first one.</p>}
        {log.slice(0, 3).map((e) => (
          <div key={e.hash + e.at} className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 border-b border-line py-2.5 md:grid-cols-[72px_minmax(0,1fr)_auto]">
            <span className="text-terra">{e.hash}</span>
            <span className="line-clamp-2 break-words">{e.msg}</span>
            <span className="col-start-2 text-khaki md:col-start-auto">{new Date(e.at).toLocaleDateString()}</span>
          </div>
        ))}
        {/* Author on the first row, message under it, like a commit. */}
        <form onSubmit={commit} className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          <input type="text" name="from_name" required maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className={field} />
          <input type="email" name="from_email" required maxLength={120} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" className={field} />
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
          <textarea
            id="commit-msg"
            name="message"
            required
            rows={3}
            maxLength={1000}
            value={msg}
            onChange={(e) => { setMsg(e.target.value); if (status !== 'idle' && status !== 'sending') setStatus('idle') }}
            placeholder="Your message"
            aria-label="Your message"
            className={`${field} resize-none sm:col-span-2`}
          />
          <div className="flex items-center justify-between gap-4 sm:col-span-2">
            <p role="status" aria-live="polite" className={`min-w-0 break-words font-sans text-[13px] leading-snug ${status === 'error' ? 'text-terra-soft' : 'text-khaki'}`}>{note}</p>
            <button type="submit" disabled={status === 'sending'} className="btn-paint ml-1.5 mt-1 shrink-0 disabled:opacity-60" style={{ boxShadow: '-5px -5px 0 0 var(--color-terra-soft)' }}>
              {status === 'sending' ? 'Sending…' : 'Commit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
