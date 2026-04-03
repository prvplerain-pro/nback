'use client'

import { useEffect, useState } from 'react'

const POSITIONS: [number, number][] = [
  [0, 8],
  [2, 5],
  [1, 7],
  [3, 6],
  [0, 4],
  [2, 8],
  [1, 3],
]

export default function MiniGridDemo() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep(s => s + 1)
    }, 1400)
    return () => window.clearInterval(id)
  }, [])

  const [a, b] = POSITIONS[step % POSITIONS.length]

  return (
    <div className="mini-grid">
      {Array.from({ length: 9 }, (_, i) => {
        let cls = 'mc'
        if (i === a) cls = 'mc fading'
        else if (i === b) cls = 'mc lit'
        return <div key={i} className={cls} />
      })}
    </div>
  )
}
