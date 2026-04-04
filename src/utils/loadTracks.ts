import type { Track } from '../types/track'
import { DEFAULT_ARTIST } from '../config/appKeys'

const AUDIO = import.meta.glob('../assets/tracks/*/audio.mp3', { eager: true, as: 'url' })
const COVERS = import.meta.glob('../assets/tracks/*/cover.jpg', { eager: true, as: 'url' })
const LYRICS = import.meta.glob('../assets/tracks/*/lyrics.lrc', { eager: true, as: 'raw' })
const TRANSLATIONS = import.meta.glob('../assets/tracks/*/translation.*.lrc', { eager: true, as: 'raw' })

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function slugFromPath(key: string): string {
  return key.split('/').at(-2)!
}

function findKey(map: Record<string, unknown>, slug: string): string | undefined {
  return Object.keys(map).find(k => slugFromPath(k) === slug)
}

// Com eager: true, cada entrada é { default: urlString }
function resolveUrl(mod: unknown): string {
  if (typeof mod === 'string') return mod
  return (mod as { default: string }).default
}

function resolveRaw(mod: unknown): string {
  if (typeof mod === 'string') return mod
  return (mod as { default: string }).default
}

export function loadTracks(): Track[] {
  const slugs = new Set(Object.keys(AUDIO).map(slugFromPath))

  let id = 1
  const tracks: Track[] = []

  for (const slug of slugs) {
    const audioKey = findKey(AUDIO, slug)
    if (!audioKey) continue

    const coverKey = findKey(COVERS, slug)
    const lyricsKey = findKey(LYRICS, slug)
    const translationKey = findKey(TRANSLATIONS, slug)

    tracks.push({
      id: id++,
      slug,
      title: slugToTitle(slug),
      artist: DEFAULT_ARTIST,
      src: resolveUrl(AUDIO[audioKey]),
      cover: coverKey ? resolveUrl(COVERS[coverKey]) : '',
      lyrics: lyricsKey ? resolveRaw(LYRICS[lyricsKey]) : '',
      translation: translationKey ? resolveRaw(TRANSLATIONS[translationKey]) : '',
    })
  }

  return tracks
}
