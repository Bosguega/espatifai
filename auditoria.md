# Auditoria Espatifai

> Data: abril 2026 | Status: Producao

---

## Resumo

O Espatifai e um music player PWA construido com React 19, TypeScript 5.8, Vite 8 e Tailwind 4.
A arquitetura e bem organizada com separacao por responsabilidade. O problema mais critico
(bundle de 80-120MB com MP3s embedded) foi **resolvido** movendo os arquivos para `public/`
com manifest gerado automaticamente. **Nao ha mais issues criticas** — o app esta estavel.

---

## Resolvidos

- ~~[x] Bundle massivo por `eager: true` nos MP3s~~ → **MP3s movidos para `public/` com manifest automatico**
- ~~[x] `LyricsDrawer.tsx` dead code~~ → **Removido**
- ~~[x] Audio element fora do DOM~~ → **Adicionado ao body com `display: none`**
- ~~[x] Stale closures no `useAudioPlayer`~~ → **Refs para currentIndex, tracks, shuffle, repeat**
- ~~[x] Botao de lyrics `animate-pulse` perpetuo~~ → **Glow estatico sutil**
- ~~[x] `user-scalable=no` viola WCAG~~ → **Removido**
- ~~[x] Sem tratamento de erro de audio~~ → **`handleError` com mensagens por codigo**
- ~~[x] `findActiveLine` sem memoization~~ → **`useMemo` no Lyrics**
- ~~[x] Faltam controles (volume, shuffle, repeat)~~ → **Todos implementados**
- ~~[x] `findKey` O(n^2)~~ → **Eliminado pela abordagem com manifest**

---

## WARNING (5 issues)

### 1. Erros de audio invisiveis ao usuario
- **Arquivo:** `src/App.tsx`
- **Problema:** O hook retorna `error` e `clearError`, mas `App.tsx` nao os usa. Quando um MP3
  falha ao carregar, o estado e setado internamente mas nunca exibido. O usuario fica sem saber
  porque a musica nao toca.
- **Impacto:** Alto — usuario nao recebe feedback quando algo da errado.
- **Solucao:** Adicionar `error` e `clearError` no destructuring do hook e exibir banner de erro
  no componente App (como ja existia antes).

### 2. Hack `as any` no audio element
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** `_handleEnded` e `_playTrack` sao anexados como propriedades arbitrarias no
  elemento DOM via `(audioRef.current as any)._handleEnded`. Funciona mas viola type safety e
  e fragil a refatoracoes futuras.
- **Solucao:** Usar `useRef` separados para armazenar as funcoes mais recentes, ou mover a
  logica de `handleEnded` para dentro de um closure que captura refs.

### 3. `parseLrc` nao suporta multiplos timestamps
- **Arquivo:** `src/utils/parseLrc.ts`
- **Problema:** Linhas como `[00:01.00][01:01.00]Texto` (validas no formato LRC) geram apenas
  uma entrada. O segundo timestamp e ignorado.
- **Solucao:** Usar `matchAll` com regex global para capturar todos os timestamps da linha.

### 4. `--legacy-peer-deps` no CI
- **Arquivo:** `.github/workflows/deploy.yml`
- **Problema:** Indica conflito nao resolvido entre `vite-plugin-pwa` e Vite 8. Pode mascarar
  incompatibilidades futuras.
- **Solucao:** Resolver incompatibilidades ou travar versoes compativeis no `package.json`.

### 5. Sem Media Session API
- **Problema:** Sem integracao com lockscreen/notification bar em mobile. Usuario nao pode
  pausar, pular ou voltar faixa sem abrir o app.
- **Solucao:** Usar `navigator.mediaSession` para registrar metadata da faixa e handlers
  de controle.

---

## INFO (8 issues)

1. **`Lyrics` sem `React.memo`** — Re-renderiza ~10x/segundo com `currentTime`. Tem `useMemo`
   para `activeIndex` mas o componente em si nao e memoized.
2. **`Player` sem `React.memo`** — Mesmo problema; recebe `currentTime` como prop.
3. **`src/data/` vazio** — Diretorio existe sem conteudo (arquivos antigos removidos).
4. **`slugToTitle` local em `loadTracks.ts`** — Deveria estar em `utils/` para reuso.
5. **`Track.id` como `number`** — Inconsistente com `slug: string` que ja e unico.
6. **Sem ESLint/Prettier** — Nenhuma lint ou formatacao automatica configurada.
7. **`manifest.json` versionado no git** — Arquivo gerado pelo script mas commitado no repositorio.
8. **Sem testes** — Nenhum framework de testes configurado.

---

## Metrics

| Metrica | Valor |
|---|---|
| **Componentes** | 5 (Controls, Lyrics, Player, Playlist, ProgressBar) |
| **Componentes com React.memo** | 3 de 5 (Controls, ProgressBar, Playlist) |
| **Hooks** | 1 (useAudioPlayer) |
| **Utils** | 2 (loadTracks, parseLrc) |
| **Types** | 2 (Track, LyricsLine) |
| **Config files** | 1 (appKeys.ts) |
| **Linhas de codigo (src/)** | ~750 |
| **Tracks disponiveis** | 16 |
| **Tracks com cover** | 1 (6.25%) |
| **Tracks com lyrics** | 2 (12.5%) |
| **Bundle JS (gzip)** | ~210 KB (sem MP3s) |
| **Bundle total** | ~210 KB |
| **Testes configurados** | 0 |
| **Linters configurados** | 0 |
| **Versoes principais** | React 19.1, Vite 8, Tailwind 4.1, TS 5.8 |

---

## Plano de Melhorias (Priorizado)

| Prioridade | Acao | Esforco | Impacto |
|---|---|---|---|
| **P1** | Exibir erros de audio no UI (usar `error`/`clearError` do hook no App) | Baixo | Alto |
| **P1** | Media Session API (`navigator.mediaSession`) | Medio | Alto |
| **P2** | `React.memo` em `Lyrics` e `Player` | Baixo | Medio |
| **P2** | Resolver `--legacy-peer-deps` (travar versoes compativeis) | Medio | Medio |
| **P2** | Multi-timestamp no `parseLrc` | Baixo | Baixo |
| **P3** | Refatorar hack `_handleEnded`/`_playTrack` com refs proprias | Medio | Medio |
| **P3** | ESLint + Prettier configuracao basica | Medio | Medio |
| **P3** | Testes unitarios para `parseLrc` e `findActiveLine` | Medio | Alto |
| **P4** | Adicionar `cover.jpg` e `.lrc` as tracks restantes | Conteudo | Medio |
| **P4** | Remover `src/data/` vazio | Trivial | Baixo |
| **P4** | Mover `slugToTitle` para `utils/` | Trivial | Baixo |
| **P4** | `.gitignore` para `manifest.json` gerado | Trivial | Baixo |

---

## Conclusao

O projeto evoluiu significativamente desde a auditoria anterior. Das 3 issues criticas e
12 warnings originais, **10 foram resolvidas** com sucesso. A arquitetura esta limpa, com
separacao clara de responsabilidades, TypeScript strict mode habilitado, e abordagem
inteligente de servir MP3s como assets estaticos via manifest gerado em build-time.

O principal gap restante e a **falta de feedback visual de erros de audio** (o hook captura
erros mas o App nao os exibe), seguido pela **ausencia de Media Session API** para integracao
mobile nativa. O restante sao melhorias incrementais de performance, manutenibilidade e conteudo.

**Nota geral: 7.5/10** — Bom estado, com margem para melhorias de UX mobile e robustez.
