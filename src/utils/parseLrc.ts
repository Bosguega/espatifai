import type { LyricsLine } from '../types/track'

// Matches [mm:ss.xx] or [mm:ss.xxx] or [ss.xx]
const TIMESTAMP_RE = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)]/

/**
 * Parse LRC content into typed lines with timestamps.
 * Lines without timestamp are merged with previous line or kept at time 0.
 * Metadata lines like [ti:...] or [ar:...] are skipped.
 */
export function parseLrc(content: string): LyricsLine[] {
  if (!content) return []

  const lines = content.split(/\r?\n/)
  const result: LyricsLine[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const match = line.match(TIMESTAMP_RE)
    if (!match) continue

    const mins = parseInt(match[1], 10)
    const secs = parseFloat(match[2])
    const time = mins * 60 + secs
    const text = line.replace(TIMESTAMP_RE, '').trim()

    // Skip metadata lines (empty text or starts with [)
    if (!text || text.startsWith('[')) continue

    result.push({ time, text })
  }

  return result
}

/**
 * Find the index of the line that should be highlighted
 * for the given playback time.
 */
export function findActiveLine(lines: LyricsLine[], currentTime: number): number {
  let active = -1
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      active = i
    } else {
      break
    }
  }
  return active
}
