import { useEffect, useState } from 'react'
import { SITE } from '../data/content.js'

const KEY = 'commit-log'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

// Email as plain text with a copy button, the usual links, and a guestbook shaped like a commit log.
// Entries are kept in this browser only until the site has a backend.
export default function Contact() {
  const [log, setLog] = useState(load)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(log.slice(0, 50))) } catch { /* private window */ } }, [log])

  const commit = (e) => {
    e.preventDefault()
    const v = msg.trim()
    if (!v) return
    const hash = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
    setLog([{ hash, msg: v, at: Date.now() }, ...log])
    setMsg('')
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
        {log.map((e) => (
          <div key={e.hash + e.at} className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-4 border-b border-line py-2.5 md:grid-cols-[72px_minmax(0,1fr)_auto]">
            <span className="text-terra">{e.hash}</span>
            <span className="break-words">{e.msg}</span>
            <span className="col-start-2 text-khaki md:col-start-auto">{new Date(e.at).toLocaleDateString()}</span>
          </div>
        ))}
        <form onSubmit={commit} className="mt-3.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
          <input
            id="commit-msg"
            type="text"
            maxLength={80}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Leave a one-line commit message"
            aria-label="Commit message"
            className="min-w-0 border border-line bg-ground px-3 py-2.5 font-sans text-base text-ink placeholder:text-khaki/80 focus:border-rail focus:outline-none"
          />
          <button type="submit" className="btn-paint ml-1.5" style={{ boxShadow: '-5px -5px 0 0 var(--color-terra-soft)' }}>Commit</button>
        </form>
      </div>
    </div>
  )
}
