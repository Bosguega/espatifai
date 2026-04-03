import type { Track } from '../types/track'
import { lyricsMap } from './lyrics'

const songModules = import.meta.glob('../assets/songs/*.mp3', { eager: true })
const coverModules = import.meta.glob('../assets/covers/*.jpg', { eager: true })

function getFileName(path: string): string {
  const file = path.split('/').pop() || path
  return file.replace(/\.[^.]+$/, '')
}

function extractCover(name: string): string | null {
  const key = `../assets/covers/${name}.jpg`
  if (coverModules[key]) {
    return (coverModules[key] as { default: string }).default
  }
  // Fallback: tenta encontrar qualquer cover com o mesmo prefixo
  const match = Object.entries(coverModules).find(([k]) => {
    const fileName = getFileName(k)
    return fileName === name
  })
  if (match) {
    return (match[1] as { default: string }).default
  }
  return null
}

export function getTracks(): Track[] {
  return Object.keys(songModules).map((path, index) => {
    const name = getFileName(path)
    const module = songModules[path] as { default: string }
    const cover = extractCover(name)

    const lyricsData = lyricsMap[name] ?? {
      lyrics: `Letra de ${name}\n\n(Adicione a letra em src/data/lyrics.ts)`,
      translation: `Translation of ${name}\n\n(Add the translation in src/data/lyrics.ts)`,
    }

    return {
      id: index + 1,
      title: name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      artist: 'Artista Desconhecido',
      src: module.default,
      cover: cover || '',
      lyrics: lyricsData.lyrics,
      translation: lyricsData.translation,
    }
  })
}
