import { useEffect, useRef } from 'react'

/**
 * Mantem a tela ligada enquanto o componente estiver montado.
 * Usa a Wake Lock API para impedir protecao de tela.
 * Suportado em Chrome/Edge/Safari mobile. Firefox nao suporta.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    let aborted = false

    async function request() {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen')
          if (!aborted) wakeLockRef.current = lock
        }
      } catch {
        // Wake Lock nao disponivel ou negado — silenciar
      }
    }

    request()

    // Re-adquirir quando a pagina voltar ao foco (usuario trocou de app)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      aborted = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [])
}
