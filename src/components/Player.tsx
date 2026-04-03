import { FileText } from 'lucide-react'
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
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Track Info */}
      <div className="flex items-center gap-4">
        <img
          src={currentTrack.cover}
          alt={`Capa de ${currentTrack.title}`}
          className="w-16 h-16 rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{currentTrack.title}</h3>
          <p className="text-sm text-neutral-400 truncate">{currentTrack.artist}</p>
        </div>
        <button
          onClick={onOpenLyrics}
          className="p-2 text-neutral-400 hover:text-green-400 transition-colors"
          aria-label="Ver letra"
        >
          <FileText size={20} />
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
