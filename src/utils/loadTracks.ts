import type { Track } from '../types/track'

const AUDIO = import.meta.glob('../../assets/tracks/*/audio.mp3', { eager: true, as: 'url' })
const COVERS = import.meta.glob('../../assets/tracks/*/cover.jpg', { eager: true, as: 'url' })
const LYRICS = import.meta.glob('../../assets/tracks/*/lyrics.lrc', { eager: true, as: 'raw' })
const TRANSLATIONS = import.meta.glob('../../assets/tracks/*/translation.*.lrc', { eager: true, as: 'raw' })

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
      artist: 'Espatifai',
      src: AUDIO[audioKey] as string,
      cover: coverKey ? (COVERS[coverKey] as string) : '',
      lyrics: lyricsKey ? (LYRICS[lyricsKey] as string) : '',
      translation: translationKey ? (TRANSLATIONS[translationKey] as string) : '',
    })
  }

  return tracks
}
