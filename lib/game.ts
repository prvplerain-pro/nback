import { GameTrial } from '@/types'

const LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']
const POSITIONS = [0, 1, 2, 3, 5, 6, 7, 8] // center (4) never used

// ── Trial generation ───────────────────────────────────────
export function generateTrials(nLevel: number): GameTrial[] {
  const totalTrials = nLevel + 20
  const trials: GameTrial[] = []

  for (let i = 0; i < totalTrials; i++) {
    if (i >= nLevel && Math.random() < 0.3) {
      const prev = trials[i - nLevel]
      const roll = Math.random()
      // ~33% position match only, ~33% audio match only, ~33% both
      trials.push({
        position: roll < 0.67 ? prev.position : randomFrom(POSITIONS),
        letter:   roll > 0.33 ? prev.letter   : randomFrom(LETTERS),
      })
    } else {
      trials.push({
        position: randomFrom(POSITIONS),
        letter:   randomFrom(LETTERS),
      })
    }
  }
  return trials
}

// ── Ground truth for a given index ────────────────────────
export function getMatches(
  trials: GameTrial[],
  index: number,
  nLevel: number
): { positionMatch: boolean; audioMatch: boolean } {
  if (index < nLevel) return { positionMatch: false, audioMatch: false }
  return {
    positionMatch: trials[index].position === trials[index - nLevel].position,
    audioMatch:    trials[index].letter   === trials[index - nLevel].letter,
  }
}

// ── Final score calculation ────────────────────────────────
export function calculateScoreBreakdown(
  trials: GameTrial[],
  nLevel: number,
  responses: Array<{ position: boolean; audio: boolean }>
): { position: number; audio: number; overall: number } {
  let posCorrect = 0
  let audioCorrect = 0
  let n = 0

  for (let i = nLevel; i < trials.length; i++) {
    const { positionMatch, audioMatch } = getMatches(trials, i, nLevel)
    const r = responses[i] ?? { position: false, audio: false }
    if (r.position === positionMatch) posCorrect++
    if (r.audio === audioMatch) audioCorrect++
    n++
  }

  if (n === 0) return { position: 0, audio: 0, overall: 0 }

  return {
    position: Math.round((posCorrect / n) * 100),
    audio:    Math.round((audioCorrect / n) * 100),
    overall:  Math.round(((posCorrect + audioCorrect) / (2 * n)) * 100),
  }
}

export function calculateScore(
  trials: GameTrial[],
  nLevel: number,
  responses: Array<{ position: boolean; audio: boolean }>
): number {
  return calculateScoreBreakdown(trials, nLevel, responses).overall
}

export function calculateSplitScore(
  trials: GameTrial[],
  nLevel: number,
  responses: Array<{ position: boolean; audio: boolean }>
): { positionScore: number; audioScore: number } {
  let posCorrect = 0
  let audioCorrect = 0
  let total = 0

  for (let i = nLevel; i < trials.length; i++) {
    const { positionMatch, audioMatch } = getMatches(trials, i, nLevel)
    const r = responses[i] ?? { position: false, audio: false }
    if (r.position === positionMatch) posCorrect++
    if (r.audio === audioMatch) audioCorrect++
    total++
  }

  return {
    positionScore: total > 0 ? Math.round((posCorrect / total) * 100) : 0,
    audioScore:    total > 0 ? Math.round((audioCorrect / total) * 100) : 0,
  }
}

// ── Adaptive level suggestion ──────────────────────────────
export function nextNLevel(currentN: number, scorePercent: number): number {
  if (scorePercent >= 90) return currentN + 1
  if (scorePercent < 80) return Math.max(1, currentN - 1)
  return currentN // 80–89 = stagnation
}

// ── Letter audio (public/audio/*.mp3) ───────────────────────
const preloadCache: HTMLAudioElement[] = []
let audioUnlocked = false

export function speakLetter(letter: string) {
  if (typeof window === 'undefined') return
  const audio = new Audio(`/audio/${letter}.mp3`)
  audio.play().catch(() => {})
}

export function preloadAudio() {
  if (preloadCache.length > 0) return
  const letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T']
  letters.forEach(l => {
    const a = new Audio(`/audio/${l}.mp3`)
    a.preload = 'auto'
    preloadCache.push(a)
  })
}

export function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true
  const a = new Audio(`/audio/C.mp3`)
  a.volume = 0.01
  a.play().then(() => { a.pause() }).catch(() => {})
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
