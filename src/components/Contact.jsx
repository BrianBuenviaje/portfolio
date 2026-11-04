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

  return (
    <div>
      <p data-reveal="left" style={{ '--i': 3 }} className="label text-khaki">Say hi</p>
      <p data-reveal="left" style={{ '--i': 4, fontSize: 'clamp(20px, 3.6vw, 44px)' }} className="display mt-2 flex flex-wrap items-center gap-4 break-all">
        {SITE.email || 'email coming soon'}
        {SITE.email && (
          <button type="button" onClick={copy} className="btn-paint text-[12px]" style={{ padding: '6px 10px' }}>{copied ? 'Copied' : 'Copy'}</button>
        )}
      </p>
      <div data-reveal style={{ '--i': 5 }} className="mt-5 flex flex-wrap gap-5 label">
        <a className="link-ul" href={SITE.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        {SITE.linkedin && <a className="link-ul" href={SITE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
        <a className="link-ul" href={SITE.resume} target="_blank" rel="noreferrer">Résumé ↗</a>
      </div>

      <div data-reveal="scale" style={{ '--i': 6 }} className="mt-8 border-t border-ink font-mono text-[13px]">
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
