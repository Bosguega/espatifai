# Auditoria Espatifai

> Data: abril 2026 | Status: Producao

---

## Resumo

O Espatifai e um music player PWA construido com React 19, TypeScript 5.8, Vite 8 e Tailwind 4.
A arquitetura e bem organizada com separacao por responsabilidade. O problema mais critico
(bundle de 80-120MB com MP3s embedded) foi **resolvido** movendo os arquivos para `public/`
com manifest gerado automaticamente. Restam **3 issues criticas** e varias melhorias pendentes.

---

## CRITICAL (3 issues)

### 1. Audio element fora do DOM
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** O `<audio>` e criado com `document.createElement('audio')` mas nunca adicionado ao DOM.
  iOS Safari e alguns browsers mobile exigem o elemento no DOM para playback.
- **Impacto:** Audio pode nao tocar em iPhones/iPads.
- **Solucao:** Adicionar `audioRef.current` ao body com `display: none` ou usar `<audio>` no JSX.

### 2. Botao de lyrics pulsa perpetuamente
- **Arquivo:** `src/components/Player.tsx`
- **Problema:** `animate-pulse` no botao de letras roda indefinidamente quando ha letra disponivel.
  Isso e distrativo visualmente e pode confundir o usuario.
- **Solucao:** Remover `animate-pulse` permanente, trocar por glow sutil que ativa apenas quando
  o usuario abre/fecha a aba de lyrics, ou quando ha lyrics sem traducao.

### 3. `useAudioPlayer` re-cria event listeners a cada mudanca de track
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** O `useEffect` tem `[currentIndex, tracks.length]` como dependencias. Cada troca de
  musica remove e re-adiciona todos os listeners. O `handleEnded` captura `currentIndex` via closure
  (stale closure potencial).
- **Solucao:** Usar refs para `currentIndex` e `tracks` dentro do effect, removendo essas dependencias.

---

## WARNING (11 issues)

### 1. `user-scalable=no` viola acessibilidade WCAG
- **Arquivo:** `index.html`
- **Problema:** Viola WCAG 2.1 criterio 1.4.4. Usuarios com deficiencia visual nao podem dar zoom.
- **Solucao:** Remover `user-scalable=no` e `maximum-scale=1.0`.

### 2. Sem tratamento de erro de audio
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** Evento `error` do `<audio>` nao e escutado. Se o MP3 falhar ao carregar,
  o usuario nao ve feedback.
- **Solucao:** Adicionar `audio.addEventListener('error', handler)`.

### 3. `parseLrc` nao suporta multiplos timestamps
- **Arquivo:** `src/utils/parseLrc.ts`
- **Problema:** Formato `[00:01.00][01:01.00]Texto` (valido em LRC) gera apenas uma entrada.
- **Solucao:** Regex com matchAll para capturar todos os timestamps da linha.

### 4. `findActiveLine` sem memoization
- **Arquivo:** `src/components/Lyrics.tsx`
- **Problema:** Chamada a cada render (~10x/segundo via `currentTime`). O componente Lyrics
  nao e memoized.
- **Solucao:** `useMemo` para `activeIndex` ou `React.memo` no componente.

### 5. Sem `React.memo` em nenhum componente
- **Arquivo:** Todos os componentes
- **Problema:** Re-renders desnecessarios quando o estado muda (especialmente `currentTime`).
- **Solucao:** Adicionar `React.memo` em `Controls`, `ProgressBar`, `Playlist`.

### 6. `--legacy-peer-deps` no CI
- **Arquivo:** `.github/workflows/deploy.yml`
- **Problema:** Indica conflito de dependencias nao resolvido entre `vite-plugin-pwa` e Vite 8.
- **Solucao:** Resolver incompatibilidades ou travar versoes compativeis.

### 7. 14 de 16 tracks sem cover art
- **Arquivo:** `public/tracks/`
- **Problema:** Apenas `brick-by-brick` tem `cover.jpg`. As demais mostram placeholder.
- **Solucao:** Adicionar covers ou usar placeholder padrao por track.

### 8. 14 de 16 tracks sem lyrics
- **Arquivo:** `public/tracks/`
- **Problema:** Apenas 2 tracks tem arquivos `.lrc`.
- **Solucao:** Adicionar lyrics ou desabilitar botao de lyrics quando nao ha conteudo.

### 9. Faltam controles essenciais
- **Problema:** Sem controle de volume, shuffle, repeat.
- **Solucao:** Adicionar gradualmente conforme prioridade.

### 10. Sem Media Session API
- **Problema:** Sem controles na lockscreen/notification bar em mobile.
- **Solucao:** Usar `navigator.mediaSession` para integrar com controles do SO.

### 11. `findKey` O(n^2) removido mas `loadTracks` ainda itera
- **Arquivo:** `src/utils/loadTracks.ts`
- **Problema:** Resolvido pela mudanca para manifest, mas o parse do manifest cria arrays
  sem indexacao otimizada. Com 16 tracks e irrelevante, mas com 100+ pode ser notavel.
- **Solucao:** Adicionar indice por slug no manifest se necessario.

---

## INFO (10 issues)

1. **Diretorio `src/data/`** -- existe mas esta vazio (arquivos antigos removidos).
2. **Sem testes** -- Nenhum script de test configurado no `package.json`.
3. **`audioRef` nao usado** -- Retornado pelo hook mas nunca consumido pelo `App.tsx`.
4. **Sem ESLint/Prettier** -- Nenhum linter ou formatter configurado.
5. **`id: number`** -- Poderia ser `string` baseado no slug para consistencia.
6. **Sem persistencia** -- Ultima musica, posicao e volume nao sao salvos.
7. **`target: ES2022`** -- Pode nao suportar navegadores mais antigos (Edge < 109, Safari < 16.4).
8. **Manifest embedado** -- O `manifest.json` fica em `public/`, versionado pelo git. Se o usuario
   adicionar musicas no repositorio, o manifest e regenerado no proximo build.
9. **Service worker cacheia MP3s em runtime** -- `CacheFirst` com 30 dias de expiracao e max 50
   entries. Bom para performance, mas o usuario nao tem controle sobre limpar cache de audio.
10. **`generate-manifest.mjs`** -- Script robusto mas sem validacao de arquivo (ex: MP3 corrompido,
    LRC com encoding errado).

---

## Metrics

| Metrica | Antes | Depois |
|---|---|---|
| **Bundle JS (gzip)** | ~218 KB | ~205 KB |
| **Bundle total** | ~80-120 MB | **~205 KB** |
| **Componentes** | 6 | 5 (LyricsDrawer removido) |
| **Hooks** | 1 | 1 |
| **Utils** | 2 | 3 (+parseLrc) |
| **Tracks** | 16 MP3s | 16 MP3s (em public/) |
| **Tracks com lyrics** | 2 (12.5%) | 2 (12.5%) |
| **Tracks com cover** | 1 (6.25%) | 1 (6.25%) |
| **Linhas de codigo** | ~800 | ~750 |

---

## Resolvidos

- ~~[x] Bundle massivo por `eager: true` nos MP3s~~ → **MP3s movidos para `public/` com manifest automatico**
- ~~[x] `LyricsDrawer.tsx` dead code~~ → **Removido**
- ~~[x] Service worker nao cacheia MP3s~~ → **Adicionado `runtimeCaching` CacheFirst para MP3s**
- ~~[x] Duplicacao de logica entre Lyrics/LyricsDrawer~~ → **LyricsDrawer removido**
- ~~[x] Nao ha loading state ao carregar tracks~~ → **Adicionado "Carregando musicas..."**

---

## Plano de Correcoes

### Fase 1 — Estabilidade (urgente, 1-2 sessoes)
1. **Audio element no DOM** — Fix para iOS Safari
2. **Tratamento de erro de audio** — Feedback visual quando falha
3. **Remover `user-scalable=no`** — Acessibilidade basica
4. **Fix `useAudioPlayer` stale closures** — Remover dependencias do effect

### Fase 2 — Performance (1 sessao)
5. **`React.memo` em Controls, ProgressBar, Playlist**
6. **`useMemo` para `findActiveLine` no Lyrics**
7. **Remover `animate-pulse` perpetuo** no botao de lyrics

### Fase 3 — UX Mobile (1-2 sessoes)
8. **Media Session API** — Controles na lockscreen
9. **Controle de volume** — Slider no player
10. **Persistencia de estado** — Salvar ultima musica e posicao no localStorage

### Fase 4 — Features (quando desejado)
11. **Shuffle / Repeat** — Controles no player
12. **Keyboard shortcuts** — Space = play/pause, setas = seek
13. **Multi-timestamp no LRC** — Suporte a `[mm:ss][mm:ss]Texto`
14. **Resolver `--legacy-peer-deps`** — Travar versoes compativeis

### Fase 5 — Higiene (quando conveniente)
15. **ESLint + Prettier** — Configuracao basica
16. **Limpar `src/data/`** — Remover diretorio vazio
17. **Tests basicos** — parseLrc, loadTracks, slugToTitle
