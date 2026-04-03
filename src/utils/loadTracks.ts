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

function findTranslationForSlug(slug: string): string {
  for (const [path, mod] of Object.entries(TRANSLATION_GLOB)) {
    const fileSlug = extractSlug(path)
    if (fileSlug === slug) {
      return (mod as { default: string }).default
    }
  }
  return ''
}

export function loadTracks(): Track[] {
  const slugs = new Set<string>()

  for (const path of Object.keys(AUDIO_GLOB)) {
    slugs.add(extractSlug(path))
  }

  let id = 1
  const tracks: Track[] = []

  for (const slug of slugs) {
    const audioPath = `../../assets/tracks/${slug}/audio.mp3`
    const coverPath = `../../assets/tracks/${slug}/cover.jpg`
    const lyricsPath = `../../assets/tracks/${slug}/lyrics.lrc`

    const audioMod = AUDIO_GLOB[audioPath] as { default: string } | undefined
    const coverMod = COVER_GLOB[coverPath] as { default: string } | undefined
    const lyricsMod = LYRICS_GLOB[lyricsPath] as { default: string } | undefined

    if (!audioMod) continue

    tracks.push({
      id: id++,
      slug,
      title: slugToTitle(slug),
      artist: 'Espatifai',
      src: audioMod.default,
      cover: coverMod ? coverMod.default : '',
      lyrics: lyricsMod ? lyricsMod.default : '',
      translation: findTranslationForSlug(slug),
    })
  }

  return tracks
}
