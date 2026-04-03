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
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <button
        onClick={onPrevious}
        className="p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Faixa anterior"
      >
        <SkipBack size={24} />
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-4 bg-white rounded-full text-black hover:scale-105 transition-transform"
        aria-label={isPlaying ? 'Pausar' : 'Tocar'}
      >
        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
      </button>

      <button
        onClick={onNext}
        className="p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Próxima faixa"
      >
        <SkipForward size={24} />
      </button>
    </div>
  )
}
