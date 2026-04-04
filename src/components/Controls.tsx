import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface ControlsProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
}

export function Controls({ isPlaying, onPlay, onPause, onNext, onPrevious }: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      <button
        onClick={onPrevious}
        className="p-1.5 sm:p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Faixa anterior"
      >
        <SkipBack size={20} className="sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3 sm:p-4 bg-white rounded-full text-black hover:scale-105 transition-transform"
        aria-label={isPlaying ? 'Pausar' : 'Tocar'}
      >
        {isPlaying ? <Pause size={22} className="sm:w-7 sm:h-7" /> : <Play size={22} className="sm:w-7 sm:h-7" />}
      </button>

      <button
        onClick={onNext}
        className="p-1.5 sm:p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Próxima faixa"
      >
        <SkipForward size={20} className="sm:w-6 sm:h-6" />
      </button>
    </div>
  )
}
