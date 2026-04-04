import type { LyricsLine } from '../types/track'

// Matches [mm:ss.xx] or [mm:ss.xxx] — captura todos na mesma linha
const TIMESTAMP_RE = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)]/g

/**
 * Parse LRC content into typed lines with timestamps.
 * Suporta multiplos timestamps por linha: [00:01.00][01:01.00]Texto
 */
export function parseLrc(content: string): LyricsLine[] {
  if (!content) return []

  const lines = content.split(/\r?\n/)
  const result: LyricsLine[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Encontra todos os timestamps na linha
    const timestamps: { time: number }[] = []
    let match
    const re = new RegExp(TIMESTAMP_RE.source, 'g')
    while ((match = re.exec(line)) !== null) {
      const mins = parseInt(match[1], 10)
      const secs = parseFloat(match[2])
      timestamps.push({ time: mins * 60 + secs })
    }

    if (timestamps.length === 0) continue

    const text = line.replace(TIMESTAMP_RE, '').trim()
    if (!text || text.startsWith('[')) continue

    // Cria uma entrada para cada timestamp na linha
    for (const ts of timestamps) {
      result.push({ time: ts.time, text })
    }
  }

  // Ordena por tempo
  result.sort((a, b) => a.time - b.time)
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
