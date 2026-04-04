import { memo } from 'react'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react'
import type { RepeatMode } from '../hooks/useAudioPlayer'

interface ControlsProps {
  isPlaying: boolean
  shuffle: boolean
  repeat: RepeatMode
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  onToggleShuffle: () => void
  onToggleRepeat: () => void
}

export const Controls = memo(function Controls({
  isPlaying, onPlay, onPause, onNext, onPrevious,
  shuffle, repeat, onToggleShuffle, onToggleRepeat,
}: ControlsProps) {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat
  const repeatActive = repeat !== 'off'

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3">
      {/* Shuffle */}
      <button
        onClick={onToggleShuffle}
        className={`p-1 sm:p-1.5 rounded-full transition-colors ${shuffle ? 'text-green-400 bg-green-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        aria-label={shuffle ? 'Desativar aleatorio' : 'Modo aleatorio'}
      >
        <Shuffle size={16} className="sm:w-5 sm:h-5" />
      </button>

      {/* Previous */}
      <button
        onClick={onPrevious}
        className="p-1.5 sm:p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Faixa anterior"
      >
        <SkipBack size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3 sm:p-4 bg-white rounded-full text-black hover:scale-105 transition-transform"
        aria-label={isPlaying ? 'Pausar' : 'Tocar'}
      >
        {isPlaying ? <Pause size={22} className="sm:w-7 sm:h-7" /> : <Play size={22} className="sm:w-7 sm:h-7" />}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="p-1.5 sm:p-2 text-neutral-300 hover:text-white transition-colors"
        aria-label="Proxima faixa"
      >
        <SkipForward size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Repeat */}
      <button
        onClick={onToggleRepeat}
        className={`p-1 sm:p-1.5 rounded-full transition-colors relative ${repeatActive ? 'text-green-400 bg-green-400/10' : 'text-neutral-400 hover:text-white'
          }`}
        aria-label={`Repetir: ${repeat}`}
      >
        <RepeatIcon size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  )
})
