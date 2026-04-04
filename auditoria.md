# Auditoria Espatifai

> Data: abril 2026 | Status: Producao | Nota: 8.5/10

---

## Resumo

O Espatifai e um music player PWA construido com React 19, TypeScript 5.8, Vite 8 e Tailwind 4.
A arquitetura e limpa, com separacao clara por responsabilidade. Das 14 issues originais,
**todas foram resolvidas** (100%). O app esta estavel e funcional. Restam 6 warnings menores
e 9 observacoes informativas.

**Stack:** React 19.1, Vite 8, Tailwind 4.1, TypeScript 5.8, vite-plugin-pwa 1.2
**Bundle JS:** ~211 KB gzip (sem MP3s — servidos como estaticos via manifest)
**Tracks:** 16 disponiveis (2 com lyrics, 1 com cover)

---

## Resolvidos (14 issues)

| # | Issue | Resolucao |
|---|---|---|
| 1 | Bundle massivo 80-120MB com MP3s embedded | MP3s movidos para `public/` com manifest automatico |
| 2 | `LyricsDrawer.tsx` dead code | Componente removido |
| 3 | Audio element fora do DOM (iOS Safari) | Adicionado ao body com `display: none` |
| 4 | Stale closures no `useAudioPlayer` | Refs para currentIndex, tracks, shuffle, repeat |
| 5 | Botao de lyrics `animate-pulse` perpetuo | Glow estatico sutil (so quando ha letra) |
| 6 | `user-scalable=no` viola WCAG | Removido do viewport meta |
| 7 | Sem tratamento de erro de audio | `handleError` com mensagens por codigo |
| 8 | Erros de audio invisiveis ao usuario | Banner vermelho com botao dismiss no header |
| 9 | `findActiveLine` sem memoization | `useMemo` no Lyrics |
| 10 | Faltam controles (volume, shuffle, repeat) | Todos implementados com persistencia |
| 11 | `findKey` O(n^2) em loadTracks | Eliminado pela abordagem com manifest |
| 12 | Hack `as any` no audio element | Substituido por refs proprias (`playTrackRef`, `handleEndedRef`) |
| 13 | Sem Media Session API | Integrado `navigator.mediaSession` com metadata e controles |
| 14 | `parseLrc` sem multiplos timestamps | Suporte a `[mm:ss][mm:ss]Texto` com `matchAll` |

---

## WARNING (6 issues)

### W1. `--legacy-peer-deps` no CI
- **Arquivo:** `.github/workflows/deploy.yml`
- **Problema:** Conflito nao resolvido entre `vite-plugin-pwa` e Vite 8. Pode mascarar
  incompatibilidades futuras quando dependencias atualizarem.
- **Solucao:** Resolver incompatibilidades ou travar versoes compativeis no `package.json`.

### W2. `getNextIndex` — `repeat: 'off'` age como `all`
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** Quando `repeat: 'off'` e a ultima faixa termina, o codigo faz `return 0`
  (loop para a primeira). O mesmo comportamento de `repeat: 'all'`. O usuario nao tem
  como parar automaticamente no fim da playlist.
- **Solucao:** Adicionar modo `stop` ou distinguir `off` de `all` — quando `off`, parar
  no fim em vez de loop.

### W3. `handleError` nao reseta `currentTime`/`duration`
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** Quando um erro de audio ocorre, `currentTime` e `duration` mantem valores
  antigos. O ProgressBar pode exibir informacao incorreta.
- **Solucao:** Adicionar `setCurrentTime(0)` e `setDuration(0)` no `handleError`.

### W4. `handleEnded` pode chamar `playTrack(-1)` em edge case
- **Arquivo:** `src/hooks/useAudioPlayer.ts`
- **Problema:** Se `getNextIndex` retornar `-1` (tracks vazias), `playTrack(-1)` sera
  chamado. A funcao tem guard `index < 0`, entao nao quebra, mas e um caminho inutil.
- **Solucao:** Verificar `next >= 0` antes de chamar `playTrack`.

### W5. Sem ESLint/Prettier configurados
- **Problema:** Nenhuma lint ou formatacao automatica. Depende da disciplina do desenvolvedor.
- **Solucao:** Configurar ESLint + Prettier com regras basicas para React/TypeScript.

### W6. Sem testes automatizados
- **Problema:** Nenhum framework de testes configurado. Mudancas dependem de verificacao manual.
- **Solucao:** Adicionar Vitest com testes para `parseLrc`, `slugToTitle`, `shuffleArray`.

---

## INFO (9 issues)

1. **Conteudo limitado** — Apenas 2 de 16 tracks tem lyrics (12.5%), 1 tem cover (6.25%).
2. **Sem LICENSE ou README.md** — Repositorio aberto sem documentacao de uso ou licenca.
3. **`manifest.json` gerado mas ignorado pelo git** — Arquivo e criado no build mas nao
   versionado. Se alguem clonar o repo sem rodar `npm run build`, o manifest nao existe
   (mas o script roda automaticamente antes do dev/build, entao e seguro).
4. **`Player` e `Lyrics` com `React.memo`** — Correto, mas `currentTime` muda ~10x/segundo
   e invalida o memo. O memo ajuda quando outras props mudam sem `currentTime` mudar.
5. **`Track.id` como `number`** — Poderia ser derivado do slug (`string`) para consistencia.
6. **`slugToTitle` utilitario simples** — Funcao de 4 linhas em arquivo proprio. Aceitavel
   para futuros usos, mas overkill se so usada em `loadTracks`.
7. **`process.env.NODE_ENV` no vite.config** — Funciona, mas `import.meta.env.PROD` seria
   mais consistente com o resto do app.
8. **Node 20 no CI** — Versao LTS valida, mas Node 22 ja e a LTS mais recente.
9. **`buildShuffledOrder` dependencias** — Usa `useCallback` com `[]` mas acessa `tracksRef`,
   que e atualizado via ref. Correto, mas pode confundir leitores do codigo.

---

## Metrics

| Metrica | Valor |
|---|---|
| **Componentes** | 5 (Controls, Lyrics, Player, Playlist, ProgressBar) |
| **Componentes com React.memo** | 5 de 5 (100%) |
| **Hooks** | 1 (useAudioPlayer) |
| **Utils** | 3 (loadTracks, parseLrc, slugToTitle) |
| **Types** | 2 (Track, LyricsLine) |
| **Config** | 1 (appKeys.ts) |
| **Linhas de codigo (src/)** | ~750 |
| **Tracks disponiveis** | 16 |
| **Tracks com lyrics** | 2 (12.5%) |
| **Tracks com cover** | 1 (6.25%) |
| **Bundle JS (gzip)** | ~211 KB (sem MP3s) |
| **Bundle total** | ~211 KB |
| **Testes** | 0 |
| **Linters** | 0 |
| **Versoes** | React 19.1, Vite 8, Tailwind 4.1, TS 5.8 |

---

## Plano de Melhorias (Priorizado)

| Prioridade | Acao | Esforco | Impacto |
|---|---|---|---|
| **P1** | Corrigir `repeat: 'off'` para nao loop (parar no fim) | Baixo | Medio |
| **P1** | Resetar `currentTime`/`duration` no `handleError` | Baixo | Medio |
| **P1** | Guard `next >= 0` antes de `playTrack` no handleEnded | Baixo | Baixo |
| **P2** | Resolver `--legacy-peer-deps` | Medio | Medio |
| **P2** | ESLint + Prettier basico | Medio | Medio |
| **P2** | Testes unitarios (`parseLrc`, `slugToTitle`, shuffle) | Medio | Alto |
| **P3** | Adicionar `README.md` e `LICENSE` | Baixo | Medio |
| **P3** | Atualizar CI para Node 22 | Baixo | Baixo |
| **P3** | Adicionar covers e lyrics as tracks restantes | Conteudo | Medio |

---

## Conclusao

O Espatifai evoluiu de uma nota **7.5/10** para **8.5/10** desde a auditoria anterior.
Todas as 14 issues identificadas foram resolvidas. O app tem arquitetura limpa, TypeScript
strict mode, zero issues criticas, e funcionalidades completas de player (shuffle, repeat,
volume, lyrics sync, Media Session API, persistencia de estado).

Os warnings restantes sao menores: o comportamento de `repeat: 'off'` que nao difere de
`all`, a falta de reset de estado no erro de audio, e a ausencia de testes/linter.
Nenhum deles impede o uso do app em producao.

**Proximos passos recomendados:** Corrigir o comportamento do `repeat: 'off'` e adicionar
testes unitarios basicos sao as acoes de maior retorno pelo menor esforco.
