import { SITE } from '../data/content.js'

// Sits at the foot of the last stage, so it is on screen with the commit log. snap-end also makes the
// page's bottom a snap position of its own, so the stage's snap point never pulls the page back up.
export default function Footer() {
  const built = new Date(document.lastModified).toISOString().slice(0, 10)
  return (
    <footer className="snap-end mx-auto -mb-4 w-full max-w-[1180px] border-t border-line pt-5 label text-khaki lg:-mb-8">
      <div className="grid gap-y-1.5 md:grid-cols-[1fr_auto] md:gap-x-6">
        <span><span className="hidden md:inline">Built with </span>{SITE.built} · <a className="link-ul" href={SITE.source} target="_blank" rel="noreferrer">source<span className="hidden md:inline"> on GitHub</span><span className="md:hidden"> ↗</span></a></span>
        <span className="md:text-right">
          © {new Date().getFullYear()} {SITE.first} {SITE.last}
          <span className="block md:inline"><span className="hidden md:inline"> · </span>updated {built}</span>
        </span>
      </div>
    </footer>
  )
}
