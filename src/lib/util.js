import { useEffect, useState } from 'react'

// Deterministic pseudo-random so decorative geometry looks the same on every load.
export function seeded(n) {
  let s = n
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

export function scrollToId(id, reduce) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
