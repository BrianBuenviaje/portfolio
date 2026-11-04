import { SITE } from '../data/content.js'

export default function Footer() {
  const built = new Date(document.lastModified)
  return (
    <footer
      className="flex flex-wrap justify-between gap-2 border-t border-line py-6 pb-12 label text-khaki"
      style={{ paddingLeft: 'calc(max(16px, env(safe-area-inset-left, 0px)) + 40px)', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <span>Built with {SITE.built} · <a className="link-ul" href={SITE.source} target="_blank" rel="noreferrer">source on GitHub</a></span>
      <span>© {new Date().getFullYear()} {SITE.first} {SITE.last} · updated {built.toISOString().slice(0, 10)}</span>
    </footer>
  )
}
