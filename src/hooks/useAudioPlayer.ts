import { useState, useRef, useEffect, useCallback } from 'react'
import type { Track } from '../types/track'

export type RepeatMode = 'off' | 'all' | 'one'

interface UseAudioPlayerOptions {
  tracks: Track[]
  activeIds: Set<number>
  trackOrder: number[]
}

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

export function useAudioPlayer({ tracks, activeIds, trackOrder }: UseAudioPlayerOptions): UseAudioPlayerReturn {
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
  const activeIdsRef = useRef(activeIds)
  const trackOrderRef = useRef(trackOrder)
  const shuffleRef = useRef(shuffle)
  const repeatRef = useRef(repeat)
  const playTrackRef = useRef<((index: number) => void) | null>(null)
  const handleEndedRef = useRef<(() => void) | null>(null)
  const shuffledOrderRef = useRef<number[]>([]) // track IDs
  const positionInOrderRef = useRef(-1)

  currentIndexRef.current = currentIndex
  activeIdsRef.current = activeIds
  trackOrderRef.current = trackOrder
  shuffleRef.current = shuffle
  repeatRef.current = repeat

  // Build shuffled order of active track IDs
  const buildShuffledOrder = useCallback(() => {
    const order = trackOrderRef.current
    const active = activeIdsRef.current
    const activeOrder = order.filter(id => active.has(id))
    shuffledOrderRef.current = shuffleArray(activeOrder)
  }, [])

  useEffect(() => {
    if (shuffle) buildShuffledOrder()
  }, [shuffle, buildShuffledOrder])

  // Find next track ID in sequence (skipping unselected)
  const findNextId = useCallback((currentId: number): number | null => {
    const order = trackOrderRef.current
    const active = activeIdsRef.current
    const rep = repeatRef.current
    const shuf = shuffleRef.current

    // Repeat one — stay on current
    if (rep === 'one') return active.has(currentId) ? currentId : null

    // Shuffle mode
    if (shuf) {
      const shufOrder = shuffledOrderRef.current
      if (shufOrder.length === 0) return null
      const pos = positionInOrderRef.current
      const nextPos = pos + 1
      if (nextPos >= shufOrder.length) {
        if (rep === 'all') {
          shuffledOrderRef.current = shuffleArray(shufOrder)
          positionInOrderRef.current = 0
          return shuffledOrderRef.current[0]
        }
        positionInOrderRef.current = 0
        return shufOrder[0]
      }
      positionInOrderRef.current = nextPos
      return shufOrder[nextPos]
    }

    // Normal sequential via trackOrder
    const idx = order.indexOf(currentId)
    const next = idx + 1
    if (next >= order.length) {
      // End of playlist — loop to first active
      return rep === 'all' ? order.find(id => active.has(id)) ?? null : order.find(id => active.has(id)) ?? null
    }
    return order[next]
  }, [])

  // Convert track ID to original array index
  const idToIndex = useCallback((id: number): number => {
    return tracks.findIndex(t => t.id === id)
  }, [tracks])

  // Internal ended handler
  useEffect(() => {
    handleEndedRef.current = () => {
      const currentId = currentIndexRef.current >= 0 ? tracksRef.current[currentIndexRef.current]?.id : -1
      if (currentId < 0) return
      const nextId = findNextId(currentId)
      if (nextId == null) return
      const nextIdx = idToIndex(nextId)
      if (nextIdx >= 0) playTrackRef.current?.(nextIdx)
    }
  }, [findNextId, idToIndex])

  // Ref for tracks lookup inside callbacks
  const tracksRef = useRef(tracks)
  tracksRef.current = tracks

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

    navigator.mediaSession.setActionHandler('play', () => {
      if (currentIndexRef.current >= 0) playTrackRef.current?.(currentIndexRef.current)
    })
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause())
  }, [currentTrack])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current
    if (index < 0 || index >= tracks.length || !audio) return

    setError(null)
    const track = tracks[index]
    setCurrentTrack(track)
    setCurrentIndex(index)
    setCurrentTime(0)
    setDuration(0)

    // Update shuffled position
    if (shuffleRef.current) {
      const shufOrder = shuffledOrderRef.current
      const pos = shufOrder.indexOf(track.id)
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
    const currentId = currentIndexRef.current >= 0 ? tracksRef.current[currentIndexRef.current]?.id : -1
    if (currentId < 0) return
    const nextId = findNextId(currentId)
    if (nextId == null) return
    const nextIdx = idToIndex(nextId)
    if (nextIdx >= 0) playTrack(nextIdx)
  }, [findNextId, idToIndex, playTrack])

  const previousTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
    } else {
      const order = trackOrderRef.current
      const currentId = currentIndexRef.current >= 0 ? tracksRef.current[currentIndexRef.current]?.id : -1
      if (currentId < 0) return

      const idx = order.indexOf(currentId)
      if (shuffleRef.current) {
        const shufOrder = shuffledOrderRef.current
        const pos = positionInOrderRef.current
        if (pos > 0) {
          positionInOrderRef.current = pos - 1
          const prevId = shufOrder[pos - 1]
          playTrack(idToIndex(prevId))
        } else if (shufOrder.length > 0) {
          positionInOrderRef.current = shufOrder.length - 1
          playTrack(idToIndex(shufOrder[shufOrder.length - 1]))
        }
      } else {
        // Find previous active track in order
        const prevIdx = idx > 0 ? idx - 1 : order.length - 1
        const prevId = order[prevIdx]
        playTrack(idToIndex(prevId))
      }
    }
  }, [playTrack, idToIndex])

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
