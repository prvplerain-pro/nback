'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function VyzkumCardsReveal({
  children,
  style,
}: {
  children: ReactNode
  style: React.CSSProperties
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cards = root.querySelectorAll('.card')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 80)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 }
    )

    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} style={style}>
      {children}
    </div>
  )
}
