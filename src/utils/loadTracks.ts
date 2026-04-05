import type { Track } from '../types/track'
import { DEFAULT_ARTIST } from '../config/appKeys'
import { parseLrc } from './parseLrc'
import { slugToTitle } from './slugToTitle'

interface ManifestTrack {
  slug: string
  coverExt: string
  lyrics: string
  translation: string
}

interface Manifest {
  tracks: ManifestTrack[]
}

/**
 * Carrega as musicas a partir do manifest gerado em build time.
 * Os MP3s ficam em public/tracks/ — servidos como estaticos,
 * sem serem embedados no bundle JS.
 *
 * @param tracksPath - Prefixo URL para os arquivos de audio.
 *   Ex: '/espatifai/tracks' em producao, '/tracks' em dev.
 */
export async function loadTracks(tracksPath: string): Promise<Track[]> {
  const res = await fetch(`${tracksPath}/manifest.json`)
  if (!res.ok) {
    console.error('[loadTracks] Failed to fetch manifest:', res.status)
    return []
  }

  const manifest: Manifest = await res.json()

  return manifest.tracks.map((t, index) => {
    const src = `${tracksPath}/${t.slug}/audio.mp3`
    const cover = t.coverExt ? `${tracksPath}/${t.slug}/cover.${t.coverExt}` : ''

    return {
      id: index + 1,
      slug: t.slug,
      title: slugToTitle(t.slug),
      artist: DEFAULT_ARTIST,
      src,
      cover,
      lyrics: t.lyrics,
      translation: t.translation,
      parsedLyrics: parseLrc(t.lyrics),
      parsedTranslation: parseLrc(t.translation),
    }
  })
}
