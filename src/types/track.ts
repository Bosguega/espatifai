export interface LyricsLine {
  time: number    // timestamp in seconds
  text: string
}

export interface Track {
  id: number
  slug: string
  title: string
  artist: string
  src: string
  cover: string
  lyrics: string       // raw LRC text
  translation: string  // raw LRC text
  parsedLyrics: LyricsLine[]
  parsedTranslation: LyricsLine[]
}
