import { useState, useRef, useEffect, useCallback } from 'react'
import type { Track } from '../types/track'

interface UseAudioPlayerReturn {
  currentTrack: Track | null
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  error: string | null
  play: () => void
  pause: () => void
  playTrack: (index: number) => void
  nextTrack: () => void
  previousTrack: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  clearError: () => void
}

const STORAGE_KEY = 'espatifai-player'

interface PlayerState {
  slug: string
  time: number
  volume: number
}

function loadState(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(slug: string, time: number, volume: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug, time, volume }))
  } catch {
    // localStorage pode estar desabilitado
  }
}

export function useAudioPlayer(tracks: Track[]): UseAudioPlayerReturn {
  // Audio element sempre no DOM para compatibilidade com iOS Safari
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => {
    const saved = loadState()
    return saved?.volume ?? 1
  })
  const [error, setError] = useState<string | null>(null)

  // Refs para evitar stale closures nos event listeners
  const currentIndexRef = useRef(currentIndex)
  const tracksRef = useRef(tracks)
  currentIndexRef.current = currentIndex
  tracksRef.current = tracks

  // Inicializa o audio element e coloca no DOM (hidden)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      audio.style.display = 'none'
      document.body.appendChild(audio)
      audioRef.current = audio
    }

    const audio = audioRef.current

    // Restaura estado salvo
    const saved = loadState()
    if (saved) {
      audio.volume = saved.volume
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleError = () => {
      const code = audio.error?.code
      const messages: Record<number, string> = {
        1: 'Reprodução cancelada pelo usuário',
        2: 'Erro de rede ao carregar o áudio',
        3: 'Falha ao decodificar o arquivo de áudio',
        4: 'Formato de áudio não suportado',
      }
      setError(messages[code ?? 0] ?? 'Erro desconhecido ao carregar o áudio')
      setIsPlaying(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      const idx = currentIndexRef.current
      const len = tracksRef.current.length
      // Auto-play próxima faixa (loop)
      if (len > 0) {
        const next = (idx + 1) % len
          // Importar playTrack via ref para evitar stale closure
          ; (audioRef.current as any)._playTrack?.(next)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('error', handleError)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('ended', handleEnded)
      // Nao removemos o audio do DOM para evitar leaks em re-renders
    }
  }, [])

  // Salva estado periodicamente
  useEffect(() => {
    if (currentTrack) {
      saveState(currentTrack.slug, currentTime, volume)
    }
  }, [currentTrack, currentTime, volume])

  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    if (index < 0 || index >= tracks.length || !audio) return

    setError(null)
    const track = tracks[index]
    setCurrentTrack(track)
    setCurrentIndex(index)
    setCurrentTime(0)
    setDuration(0)

    audio.src = track.src
    audio.load()
    audio.play().catch(() => {
      setError('Nao foi possivel reproduzir o áudio')
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }, [tracks])

  // Expose playTrack no audio element para o handleEnded acessar
  useEffect(() => {
    if (audioRef.current) {
      ; (audioRef.current as any)._playTrack = playTrack
    }
  }, [playTrack])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (audio && currentTrack) {
      audio.play().catch(() => setError('Nao foi possivel reproduzir o áudio'))
      setIsPlaying(true)
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const nextTrack = useCallback(() => {
    const idx = currentIndexRef.current
    const len = tracksRef.current.length
    if (len === 0) return
    playTrack((idx + 1) % len)
  }, [playTrack])

  const previousTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
    } else {
      const idx = currentIndexRef.current
      const len = tracksRef.current.length
      if (len === 0) return
      playTrack(idx > 0 ? idx - 1 : len - 1)
    }
  }, [playTrack])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
    setVolumeState(clamped)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    error,
    play,
    pause,
    playTrack,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    clearError,
  }
}
