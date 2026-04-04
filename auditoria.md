# Auditoria Espatifai

> Data: abril 2026 | Status: Producao

---

## Resumo

O Espatifai e um music player PWA construido com React 19, TypeScript 5.8, Vite 8 e Tailwind 4.
A arquitetura e bem organizada com separacao por responsabilidade, mas ha **3 problemas criticos**
que precisam de atencao imediata, sendo o mais grave o **bundle size dos MP3s**.

---

## CRITICAL (3 issues)

### 1. Bundle massivo por `eager: true` nos MP3s
- **Arquivo:** `src/utils/loadTracks.ts`
- **Problema:** Todos os 16 MP3s sao embedded no bundle JS via `import.meta.glob` com `eager: true`. Cada MP3 tem ~3-10MB, resultando em **~80-120MB de bundle inicial**.
- **Impacto:** O app nao carrega em redes mobile. O build demora mais e o GitHub Pages pode ter limitacoes.
- **Solucao:** Usar `eager: false` com import dinamico, ou mover MP3s para `public/` e referenciar por path estatico (`/espatifai/assets/tracks/{slug}/audio.mp3`).

### 2. `LyricsDrawer.tsx` e dead code
- **Arquivo:** `src/components/LyricsDrawer.tsx`
- **Problema:** Componente de ~100 linhas nunca importado ou usado. Substituido pelo `Lyrics.tsx` inline.
- **Solucao:** Remover o arquivo.

### 3. Audio element fora do DOM
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** O `<audio>` e criado com `document.createElement('audio')` mas nunca adicionado ao DOM. iOS Safari e alguns browsers mobile exigem o elemento no DOM para playback.
- **Solucao:** Adicionar `audioRef.current` ao body com `display: none` ou usar `<audio>` no JSX.

---

## WARNING (12 issues)

### 1. `user-scalable=no` viola acessibilidade WCAG
- **Arquivo:** `index.html`
- **Problema:** Viola WCAG 2.1 criterio 1.4.4. Usuarios com deficiencia visual nao podem dar zoom.
- **Solucao:** Remover `user-scalable=no` e `maximum-scale=1.0`.

### 2. Service worker nao cacheia MP3s
- **Arquivo:** `vite.config.ts`
- **Problema:** `globIgnores: ['**/*.mp3']` significa zero playback offline.
- **Solucao:** Se o objetivo e PWA offline, adicionar `runtimeCaching` com `NetworkFirst` para MP3s (ou aceitar que MP3s sao muito grandes para cache).

### 3. Sem tratamento de erro de audio
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** Evento `error` do `<audio>` nao e escutado. Se o MP3 falhar ao carregar, o usuario nao ve feedback.
- **Solucao:** Adicionar `audio.addEventListener('error', handler)`.

### 4. `parseLrc` nao suporta multiplos timestamps
- **Arquivo:** `src/utils/parseLrc.ts`
- **Problema:** Formato `[00:01.00][01:01.00]Texto` (valido em LRC) gera apenas uma entrada.
- **Solucao:** Regex com matchAll para capturar todos os timestamps da linha.

### 5. `findActiveLine` sem memoization
- **Arquivo:** `src/components/Lyrics.tsx`
- **Problema:** Chamada a cada render (~10x/segundo via `currentTime`). O componente Lyrics nao e memoized.
- **Solucao:** `useMemo` para `activeIndex` ou `React.memo` no componente.

### 6. Sem `React.memo` em nenhum componente
- **Arquivo:** Todos os componentes
- **Problema:** Re-renders desnecessarios quando o estado muda (especialmente `currentTime`).
- **Solucao:** Adicionar `React.memo` em `Controls`, `ProgressBar`, `Playlist`.

### 7. Duplicacao de logica entre `Lyrics` e `LyricsDrawer`
- **Arquivo:** Ambos os componentes
- **Problema:** Scroll auto, tabs, active line -- logica duplicada.
- **Solucao:** Remover `LyricsDrawer` (ja e dead code).

### 8. `--legacy-peer-deps` no CI
- **Arquivo:** `.github/workflows/deploy.yml`
- **Problema:** Indica conflito de dependencias nao resolvido entre `vite-plugin-pwa` e Vite 8.
- **Solucao:** Resolver incompatibilidades ou travar versoes compativeis.

### 9. 14 de 16 tracks sem cover art
- **Arquivo:** `src/assets/tracks/`
- **Problema:** Apenas `brick-by-brick` tem `cover.jpg`. As demais mostram placeholder.
- **Solucao:** Adicionar covers ou usar placeholder padrao por track.

### 10. 14 de 16 tracks sem lyrics
- **Arquivo:** `src/assets/tracks/`
- **Problema:** Apenas 2 tracks tem arquivos `.lrc`.
- **Solucao:** Adicionar lyrics ou desabilitar botao de lyrics quando nao ha conteudo.

### 11. Faltam controles essenciais
- **Problema:** Sem controle de volume, shuffle, repeat, ou seek preciso.
- **Solucao:** Adicionar gradualmente conforme prioridade.

### 12. Sem Media Session API
- **Problema:** Sem controles na lockscreen/notification bar em mobile.
- **Solucao:** Usar `navigator.mediaSession` para integrar com controles do SO.

---

## INFO (10 issues)

1. **Diretorio `src/data/`** -- existe mas esta vazio (arquivos antigos removidos).
2. **Sem testes** -- Nenhum script de test configurado no `package.json`.
3. **`audioRef` nao usado** -- Retornado pelo hook mas nunca consumido pelo `App.tsx`.
4. **`animate-pulse` perpetuo** -- Botao de lyrics pulsa indefinidamente quando ha letra.
5. **Sem ESLint/Prettier** -- Nenhum linter ou formatter configurado.
6. **`id: number`** -- Poderia ser `string` baseado no slug para consistencia.
7. **`PROD_BASE` duplicado** -- Calculado em `appKeys.ts` e inline no `vite.config.ts`.
8. **`findKey` O(n^2)** -- Iteracao linear sobre `Object.keys` para cada slug.
9. **Sem persistencia** -- Ultima musica, posicao e volume nao sao salvos.
10. **`target: ES2022`** -- Pode nao suportar navegadores mais antigos (Edge < 109, Safari < 16.4).

---

## Metrics

| Metrica | Valor |
|---|---|
| Componentes | 6 (Player, Playlist, Controls, ProgressBar, Lyrics, LyricsDrawer) |
| Hooks | 1 (useAudioPlayer) |
| Utils | 2 (loadTracks, parseLrc) |
| Types | 2 (Track, LyricsLine) |
| Tracks | 16 MP3s |
| Tracks com lyrics | 2 (12.5%) |
| Tracks com cover | 1 (6.25%) |
| Bundle JS (prod) | ~218 KB gzip |
| Bundle total com MP3s | ~80-120 MB (estimado) |
| Linhas de codigo | ~800 (src/) |

---

## Acoes Recomendadas (ordem de prioridade)

1. **Mover MP3s para `public/`** e referenciar por path estatico (resolve bundle size)
2. **Remover `LyricsDrawer.tsx`** (dead code)
3. **Adicionar `<audio>` ao DOM** (compatibilidade mobile)
4. **Adicionar tratamento de erro de audio** (UX)
5. **Remover `user-scalable=no`** (acessibilidade)
6. **Adicionar `React.memo`** nos componentes (performance)
7. **Adicionar Media Session API** (UX mobile)
8. **Resolver conflito de dependencias** (CI health)
