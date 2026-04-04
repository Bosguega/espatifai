import { FileText, Music } from 'lucide-react'
import type { Track } from '../types/track'
import { Controls } from './Controls'
import { ProgressBar } from './ProgressBar'

interface PlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onOpenLyrics: () => void
}

export function Player({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onOpenLyrics,
}: PlayerProps) {
  if (!currentTrack) {
    return (
      <div className="w-full p-4 text-center text-neutral-500">
        <p>Selecione uma música para começar</p>
      </div>
    )
  }

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
        <button
          onClick={onOpenLyrics}
          className={`p-1.5 sm:p-2 transition-all duration-300 flex-shrink-0 ${currentTrack.parsedLyrics.length > 0
            ? 'text-green-400 animate-pulse drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] hover:text-green-300'
            : 'text-neutral-400 hover:text-green-400'
            }`}
          aria-label="Ver letra"
        >
          <FileText size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

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
