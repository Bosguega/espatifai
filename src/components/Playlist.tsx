import { memo } from 'react'
import type { Track } from '../types/track'

interface PlaylistProps {
  tracks: Track[]
  currentIndex: number
  onSelectTrack: (index: number) => void
}

export const Playlist = memo(function Playlist({ tracks, currentIndex, onSelectTrack }: PlaylistProps) {
  return (
    <div className="w-full overflow-y-auto flex-1">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 px-1 sm:px-2">Playlist</h2>
      <ul className="space-y-0.5 sm:space-y-1">
        {tracks.map((track, index) => (
          <li key={track.id}>
            <button
              onClick={() => onSelectTrack(index)}
              className={`w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:p-2 rounded-md text-left transition-colors ${index === currentIndex
                  ? 'bg-neutral-800 text-green-400'
                  : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                }`}
              aria-label={`Tocar ${track.title} - ${track.artist}`}
            >
              <span className="text-xs font-mono w-5 text-center text-neutral-500">
                {index === currentIndex ? '▶' : index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-neutral-500 truncate">{track.artist}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
})
