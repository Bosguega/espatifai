import type { Track } from '../types/track'

const AUDIO_GLOB = import.meta.glob('../../assets/tracks/*/audio.mp3', { eager: true, query: '?url' })
const COVER_GLOB = import.meta.glob('../../assets/tracks/*/cover.jpg', { eager: true, query: '?url' })
const LYRICS_GLOB = import.meta.glob('../../assets/tracks/*/lyrics.lrc', { eager: true, query: '?raw' })
const TRANSLATION_GLOB = import.meta.glob('../../assets/tracks/*/translation.*.lrc', { eager: true, query: '?raw' })

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractSlug(path: string): string {
  const parts = path.split('/')
  const tracksIndex = parts.indexOf('tracks')
  return parts[tracksIndex + 1]
}

function getModuleDefault<T>(module: unknown): T | undefined {
  if (!module) return undefined
  return (module as { default: T }).default
}

export function loadTracks(): Track[] {
  const slugs = new Set<string>()

  for (const path of Object.keys(AUDIO_GLOB)) {
    slugs.add(extractSlug(path))
  }

  let id = 1
  const tracks: Track[] = []

  for (const slug of slugs) {
    const audioMod = getModuleDefault<string>(AUDIO_GLOB[`../../assets/tracks/${slug}/audio.mp3`])
    if (!audioMod) continue

    const cover = getModuleDefault<string>(COVER_GLOB[`../../assets/tracks/${slug}/cover.jpg`]) ?? ''
    const lyrics = getModuleDefault<string>(LYRICS_GLOB[`../../assets/tracks/${slug}/lyrics.lrc`]) ?? ''

    const translation = Object.entries(TRANSLATION_GLOB)
      .find(([path]) => extractSlug(path) === slug)?.[1]
    const translationContent = getModuleDefault<string>(translation) ?? ''

    tracks.push({
      id: id++,
      slug,
      title: slugToTitle(slug),
      artist: 'Espatifai',
      src: audioMod,
      cover,
      lyrics,
      translation: translationContent,
    })
  }

  return tracks
}
