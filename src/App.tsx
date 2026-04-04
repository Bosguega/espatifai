import { useState } from 'react'
import { Music } from 'lucide-react'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { Playlist } from './components/Playlist'
import { Lyrics } from './components/Lyrics'
import { loadTracks } from './utils/loadTracks'
import { APP_NAME } from './config/appKeys'
import type { Track } from './types/track'

const tracks: Track[] = loadTracks()

function App() {
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)

  const {
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
  } = useAudioPlayer(tracks)

  const handleOpenLyrics = () => {
    if (currentTrack) {
      setIsLyricsOpen(true)
    }
  }

  const handleCloseLyrics = () => {
    setIsLyricsOpen(false)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-neutral-950 overflow-hidden">
      {/* Header (fixed top) */}
      <header className="flex-none flex items-center justify-center px-4 pt-3 pb-3 sm:py-3 border-b border-neutral-800 bg-neutral-950 z-20" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <Music size={22} className="text-green-400 mr-2" />
        <h1 className="text-base sm:text-xl font-bold text-white">{APP_NAME}</h1>
      </header>

      {/* Middle: Playlist or Lyrics */}
      <div className="flex-1 overflow-hidden relative">
        {/* Playlist */}
        <div className={`absolute inset-0 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 transition-opacity duration-300 ${isLyricsOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Playlist
            tracks={tracks}
            currentIndex={currentIndex}
            onSelectTrack={playTrack}
          />
        </div>

        {/* Lyrics panel */}
        {currentTrack && (
          <div className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${isLyricsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Lyrics
              lyrics={currentTrack.parsedLyrics}
              translation={currentTrack.parsedTranslation}
              currentTime={currentTime}
              title={currentTrack.title}
              artist={currentTrack.artist}
              onClose={handleCloseLyrics}
            />
          </div>
        )}
      </div>

      {/* Player (fixed bottom) */}
      <div className="flex-none border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-sm z-20" style={{ paddingBottom: 'max(0rem, env(safe-area-inset-bottom))' }}>
        <Player
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlay={play}
          onPause={pause}
          onNext={nextTrack}
          onPrevious={previousTrack}
          onSeek={seek}
          onOpenLyrics={handleOpenLyrics}
        />
      </div>
    </div>
  )
}

export default App
