export interface LyricsData {
  lyrics: string
  translation: string
}

export const lyricsMap: Record<string, LyricsData> = {
  'musica-1': {
    lyrics: 'Esta é a letra da música 1\nPrimeiro verso da canção\nSegundo verso da canção\n\nRefrão:\nEspatifai, Espatifai\nNosso player especial',
    translation: 'This is the lyrics of song 1\nFirst verse of the song\nSecond verse of the song\n\nChorus:\nEspatifai, Espatifai\nOur special player',
  },
  'musica-2': {
    lyrics: 'Esta é a letra da música 2\nVerso um\nVerso dois\n\nRefrão:\nMúsica dois para tocar\nEspatifai a tocar',
    translation: 'This is the lyrics of song 2\nVerse one\nVerse two\n\nChorus:\nSong two to play\nEspatifai is playing',
  },
  'musica-3': {
    lyrics: 'Esta é a letra da música 3\nPrimeira linha\nSegunda linha\n\nRefrão:\nTrês é o número\nEspatifai é bom demais',
    translation: 'This is the lyrics of song 3\nFirst line\nSecond line\n\nChorus:\nThree is the number\nEspatifai is too good',
  },
}
