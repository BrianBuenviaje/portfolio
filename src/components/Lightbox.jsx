import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Full-screen picture viewer. Rendered at the top of the document so nothing on the page can sit over it,
// and it tells the nav to get out of the way while it is open. Closes on the X, the backdrop or Escape.
export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent('lightbox', { detail: true }))
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      document.dispatchEvent(new CustomEvent('lightbox', { detail: false }))
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="lightbox fixed inset-0 z-[60] grid place-items-center bg-ground/92 p-4"
      onClick={onClose}
    >
      <img src={src} alt={alt} className="max-h-[90svh] max-w-[94vw] rounded-[4px] border border-line object-contain" onClick={(e) => e.stopPropagation()} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-terra text-white transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: 'calc(env(safe-area-inset-right, 0px) + 16px)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>,
    document.body,
  )
}
