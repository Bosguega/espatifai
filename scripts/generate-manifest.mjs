/**
 * Gera manifest.json escaneando a estrutura de pastas em public/tracks/
 *
 * Cada subpasta representa uma musica:
 *   public/tracks/{slug}/audio.mp3        (obrigatorio)
 *   public/tracks/{slug}/cover.jpg        (opcional)
 *   public/tracks/{slug}/lyrics.lrc       (opcional)
 *   public/tracks/{slug}/translation.pt-BR.lrc  (opcional)
 *
 * O conteudo dos arquivos .lrc e embedado no manifest (sao pequenos).
 * Audio e cover sao referenciados por URL — nunca embedados.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const TRACKS_DIR = 'public/tracks'
const OUTPUT = 'public/tracks/manifest.json'

if (!existsSync(TRACKS_DIR)) {
  console.log(`[manifest] Directory "${TRACKS_DIR}" not found. Skipping.`)
  process.exit(0)
}

const slugs = readdirSync(TRACKS_DIR).filter(name => {
  const dir = join(TRACKS_DIR, name)
  return existsSync(dir) && existsSync(join(dir, 'audio.mp3'))
})

if (slugs.length === 0) {
  console.log('[manifest] No tracks found. Generating empty manifest.')
  writeFileSync(OUTPUT, JSON.stringify({ tracks: [] }, null, 2))
  process.exit(0)
}

const tracks = slugs.map(slug => {
  const dir = join(TRACKS_DIR, slug)

  const lyricsPath = join(dir, 'lyrics.lrc')
  const translationPath = join(dir, 'translation.pt-BR.lrc')

  // Tenta encontrar qualquer arquivo de traducao
  let translation = ''
  let translationFile = ''
  const files = readdirSync(dir)
  for (const f of files) {
    if (f.startsWith('translation.') && f.endsWith('.lrc')) {
      translationFile = f
      break
    }
  }

  const coverFile = readdirSync(dir).find(f => /^cover\.(jpe?g|png|gif|webp)$/i.test(f)) || ''

  return {
    slug,
    coverExt: coverFile ? coverFile.split('.').pop() : '',
    lyrics: existsSync(lyricsPath) ? readFileSync(lyricsPath, 'utf-8') : '',
    translation: translationFile ? readFileSync(join(dir, translationFile), 'utf-8') : '',
  }
})

const manifest = { tracks }

mkdirSync('public/tracks', { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2))

console.log(`[manifest] Generated ${OUTPUT} with ${tracks.length} track(s):`)
for (const t of tracks) {
  const markers = [
    t.hasCover ? 'cover' : '',
    t.lyrics ? 'lyrics' : '',
    t.translation ? 'translation' : '',
  ].filter(Boolean).join(', ')
  console.log(`  - ${t.slug} (${markers || 'audio only'})`)
}
