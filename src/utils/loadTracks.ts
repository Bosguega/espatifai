import type { Track } from '../types/track'

type GlobModule = Record<string, { default: string }>

const AUDIO: GlobModule = import.meta.glob('../../assets/tracks/*/audio.mp3', { eager: true, query: '?url' })
const COVERS: GlobModule = import.meta.glob('../../assets/tracks/*/cover.jpg', { eager: true, query: '?url' })
const LYRICS: GlobModule = import.meta.glob('../../assets/tracks/*/lyrics.lrc', { eager: true, query: '?raw' })
const TRANSLATIONS: GlobModule = import.meta.glob('../../assets/tracks/*/translation.*.lrc', { eager: true, query: '?raw' })

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// As chaves vêm no formato: "../../assets/tracks/{slug}/filename.ext"
function extractSlug(key: string): string {
  // Remove prefix e sufixo, pega apenas o nome da pasta
  const parts = key.split('/')
  // parts: ['..', '..', 'assets', 'tracks', '{slug}', 'audio.mp3']
  return parts[parts.length - 2]
}

export function loadTracks(): Track[] {
  const slugs = new Set(Object.keys(AUDIO).map(extractSlug))

  let id = 1
  const tracks: Track[] = []

  for (const slug of slugs) {
    // Busca por match nas chaves de cada glob
    const audioKey = Object.keys(AUDIO).find(k => extractSlug(k) === slug)
    const coverKey = Object.keys(COVERS).find(k => extractSlug(k) === slug)
    const lyricsKey = Object.keys(LYRICS).find(k => extractSlug(k) === slug)
    const translationKey = Object.keys(TRANSLATIONS).find(k => extractSlug(k) === slug)

    if (!audioKey) continue

    tracks.push({
      id: id++,
      slug,
      title: slugToTitle(slug),
      artist: 'Espatifai',
      src: AUDIO[audioKey].default,
      cover: coverKey ? COVERS[coverKey].default : '',
      lyrics: lyricsKey ? LYRICS[lyricsKey].default : '',
      translation: translationKey ? TRANSLATIONS[translationKey].default : '',
    })
  }

  return tracks
}
