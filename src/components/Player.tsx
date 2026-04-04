import { FileText, Music, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type { Track } from '../types/track'
import { Controls } from './Controls'
import { ProgressBar } from './ProgressBar'

interface PlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (v: number) => void
  onOpenLyrics: () => void
}

export function Player({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onOpenLyrics,
}: PlayerProps) {
  const [showVolume, setShowVolume] = useState(false)

  if (!currentTrack) {
    return (
      <div className="w-full p-4 text-center text-neutral-500">
        <p>Selecione uma musica para comecar</p>
      </div>
    )
  }

  const hasLyrics = currentTrack.parsedLyrics.length > 0

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-4 px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-4">
      {/* Track Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {currentTrack.cover ? (
          <img
            src={currentTrack.cover}
            alt={`Capa de ${currentTrack.title}`}
            className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg object-cover shadow-lg flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg bg-neutral-800 flex items-center justify-center shadow-lg flex-shrink-0">
            <Music size={18} className="text-neutral-500 sm:w-6 sm:h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{currentTrack.title}</h3>
          <p className="text-xs sm:text-sm text-neutral-400 truncate">{currentTrack.artist}</p>
        </div>

        {/* Volume toggle (desktop) */}
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="hidden sm:flex p-1.5 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Volume"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Volume slider */}
        {showVolume && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="hidden sm:block w-20 h-1.5 rounded-full appearance-none cursor-pointer flex-shrink-0"
            style={{
              background: `linear-gradient(to right, #1db954 ${volume * 100}%, #333 ${volume * 100}%)`,
            }}
            aria-label="Volume"
          />
        )}

        {/* Lyrics button */}
        <button
          onClick={() => {
            if (hasLyrics) onOpenLyrics()
          }}
          className={`p-1.5 sm:p-2 transition-all duration-300 flex-shrink-0 ${hasLyrics
            ? 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)] hover:text-green-300'
            : 'text-neutral-600 cursor-not-allowed'
            }`}
          aria-label={hasLyrics ? 'Ver letra' : 'Letra indisponivel'}
        >
          <FileText size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Error dismiss */}
      {/* (Error is shown as banner in App.tsx, no inline error needed here) */}

      {/* Progress Bar */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  )
}
