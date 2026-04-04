import { useState, useRef, useEffect, useCallback } from 'react'
import type { Track } from '../types/track'

export type RepeatMode = 'off' | 'all' | 'one'

interface UseAudioPlayerReturn {
  currentTrack: Track | null
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  shuffle: boolean
  repeat: RepeatMode
  error: string | null
  play: () => void
  pause: () => void
  playTrack: (index: number) => void
  nextTrack: () => void
  previousTrack: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  clearError: () => void
}

const STORAGE_KEY = 'espatifai-player'

interface PlayerState {
  slug: string
  time: number
  volume: number
  shuffle: boolean
  repeat: RepeatMode
}

function loadState(): PlayerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(slug: string, time: number, volume: number, shuffle: boolean, repeat: RepeatMode) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug, time, volume, shuffle, repeat }))
  } catch {
    // localStorage pode estar desabilitado
  }
}

/** Fisher-Yates shuffle */
function shuffleArray(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useAudioPlayer(tracks: Track[]): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(() => loadState()?.volume ?? 1)
  const [shuffle, setShuffle] = useState(() => loadState()?.shuffle ?? false)
  const [repeat, setRepeat] = useState<RepeatMode>(() => loadState()?.repeat ?? 'off')
  const [error, setError] = useState<string | null>(null)

  // Refs para evitar stale closures
  const currentIndexRef = useRef(currentIndex)
  const tracksRef = useRef(tracks)
  const shuffleRef = useRef(shuffle)
  const repeatRef = useRef(repeat)
  const playTrackRef = useRef<((index: number) => void) | null>(null)
  const handleEndedRef = useRef<(() => void) | null>(null)
  const orderedIndicesRef = useRef<number[]>([])
  const positionInOrderRef = useRef(-1)

  currentIndexRef.current = currentIndex
  tracksRef.current = tracks
  shuffleRef.current = shuffle
  repeatRef.current = repeat

  const buildShuffledOrder = useCallback(() => {
    const len = tracksRef.current.length
    const indices = Array.from({ length: len }, (_, i) => i)
    orderedIndicesRef.current = shuffleArray(indices)
  }, [])

  useEffect(() => {
    if (shuffle) buildShuffledOrder()
  }, [shuffle, tracks.length, buildShuffledOrder])

  // Audio element no DOM (hidden)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      audio.style.display = 'none'
      document.body.appendChild(audio)
      audioRef.current = audio
    }

    const audio = audioRef.current
    const saved = loadState()
    if (saved) audio.volume = saved.volume

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleError = () => {
      const code = audio.error?.code
      const messages: Record<number, string> = {
        1: 'Reproducao cancelada pelo usuario',
        2: 'Erro de rede ao carregar o audio',
        3: 'Falha ao decodificar o arquivo de audio',
        4: 'Formato de audio nao suportado',
      }
      setError(messages[code ?? 0] ?? 'Erro desconhecido ao carregar o audio')
      setIsPlaying(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      handleEndedRef.current?.()
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
    }
  }, [])

  // Salva estado
  useEffect(() => {
    if (currentTrack) {
      saveState(currentTrack.slug, currentTime, volume, shuffle, repeat)
    }
  }, [currentTrack, currentTime, volume, shuffle, repeat])

  // Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.cover
        ? [{ src: currentTrack.cover, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    })

    navigator.mediaSession.setActionHandler('play', () => playTrackRef.current?.(currentIndexRef.current))
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      // Logica simplificada: volta uma faixa
      const idx = currentIndexRef.current
      const len = tracksRef.current.length
      if (len === 0) return
      playTrackRef.current?.(idx > 0 ? idx - 1 : len - 1)
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const idx = currentIndexRef.current
      const len = tracksRef.current.length
      if (len === 0) return
      playTrackRef.current?.((idx + 1) % len)
    })
  }, [currentTrack])

  // Atualizar media session com estado de playback
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  // Resolve proxima faixa
  const getNextIndex = useCallback((currentIdx: number): number => {
    const len = tracksRef.current.length
    if (len === 0) return -1

    const rep = repeatRef.current
    const shuf = shuffleRef.current

    if (rep === 'one') return currentIdx

    if (shuf) {
      const order = orderedIndicesRef.current
      const pos = positionInOrderRef.current
      if (order.length === 0) return (currentIdx + 1) % len

      const nextPos = pos + 1
      if (nextPos >= order.length) {
        if (rep === 'all') {
          orderedIndicesRef.current = shuffleArray(order)
          positionInOrderRef.current = 0
          return orderedIndicesRef.current[0]
        }
        positionInOrderRef.current = 0
        return order[0]
      }
      positionInOrderRef.current = nextPos
      return order[nextPos]
    }

    const next = currentIdx + 1
    if (next >= len) return rep === 'all' ? 0 : 0
    return next
  }, [])

  // Internal ended handler via ref (no more `as any` hacks)
  useEffect(() => {
    handleEndedRef.current = () => {
      const idx = currentIndexRef.current
      const next = getNextIndex(idx)
      playTrackRef.current?.(next)
    }
  }, [getNextIndex])

  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    if (index < 0 || index >= tracks.length || !audio) return

    setError(null)
    const track = tracks[index]
    setCurrentTrack(track)
    setCurrentIndex(index)
    setCurrentTime(0)
    setDuration(0)

    if (shuffleRef.current) {
      const order = orderedIndicesRef.current
      const pos = order.indexOf(index)
      positionInOrderRef.current = pos >= 0 ? pos : -1
    }

    audio.src = track.src
    audio.load()
    audio.play().catch(() => {
      setError('Nao foi possivel reproduzir o audio')
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }, [tracks])

  // Expose via ref
  useEffect(() => {
    playTrackRef.current = playTrack
  }, [playTrack])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (audio && currentTrack) {
      audio.play().catch(() => setError('Nao foi possivel reproduzir o audio'))
      setIsPlaying(true)
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const nextTrack = useCallback(() => {
    const idx = currentIndexRef.current
    const next = getNextIndex(idx)
    playTrack(next)
  }, [getNextIndex, playTrack])

  const previousTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
    } else {
      const len = tracksRef.current.length
      if (len === 0) return
      const idx = currentIndexRef.current

      if (shuffleRef.current) {
        const order = orderedIndicesRef.current
        const pos = positionInOrderRef.current
        if (pos > 0) {
          positionInOrderRef.current = pos - 1
          playTrack(order[pos - 1])
        } else {
          playTrack(order[order.length - 1])
        }
      } else {
        playTrack(idx > 0 ? idx - 1 : len - 1)
      }
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
    if (audioRef.current) audioRef.current.volume = clamped
    setVolumeState(clamped)
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      if (!prev) buildShuffledOrder()
      return !prev
    })
  }, [buildShuffledOrder])

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      const cycle: RepeatMode[] = ['off', 'all', 'one']
      return cycle[(cycle.indexOf(prev) + 1) % cycle.length]
    })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    currentTrack, currentIndex, isPlaying, currentTime, duration,
    volume, shuffle, repeat, error,
    play, pause, playTrack, nextTrack, previousTrack,
    seek, setVolume, toggleShuffle, toggleRepeat, clearError,
  }
}
