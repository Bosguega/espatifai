import { useState, useRef, useEffect, useCallback } from 'react'
import type { Track } from '../types/track'

interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>
  currentTrack: Track | null
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  play: () => void
  pause: () => void
  playTrack: (index: number) => void
  nextTrack: () => void
  previousTrack: () => void
  seek: (time: number) => void
}

export function useAudioPlayer(tracks: Track[]): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  // Mantemos as funções num ref para evitar dependências circulares
  const playTrackRef = useRef<((index: number) => void) | null>(null)

  // Inicializa o elemento de áudio uma única vez
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = document.createElement('audio')
      audioRef.current.preload = 'metadata'
    }

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      // Auto-play próxima faixa
      if (playTrackRef.current && currentIndex < tracks.length - 1) {
        playTrackRef.current(currentIndex + 1)
      } else if (playTrackRef.current && tracks.length > 0) {
        playTrackRef.current(0)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentIndex, tracks.length])

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length || !audioRef.current) return

    const track = tracks[index]
    setCurrentTrack(track)
    setCurrentIndex(index)
    setCurrentTime(0)
    setDuration(0)

    audioRef.current.src = track.src
    audioRef.current.load()
    audioRef.current.play()
    setIsPlaying(true)
  }, [tracks])

  // Atualiza o ref com a função mais recente
  useEffect(() => {
    playTrackRef.current = playTrack
  }, [playTrack])

  const nextTrack = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      playTrack(currentIndex + 1)
    } else if (tracks.length > 0) {
      playTrack(0)
    }
  }, [currentIndex, tracks.length, playTrack])

  const previousTrack = useCallback(() => {
    if (!audioRef.current) return

    // Se já tocou mais de 3 segundos, volta ao início da faixa atual
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    } else if (currentIndex > 0) {
      playTrack(currentIndex - 1)
    } else if (tracks.length > 0) {
      playTrack(tracks.length - 1)
    }
  }, [currentIndex, tracks.length, playTrack])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  return {
    audioRef,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    playTrack,
    nextTrack,
    previousTrack,
    seek,
  }
}
