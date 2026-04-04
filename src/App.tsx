import { useState } from 'react'
import { Music } from 'lucide-react'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { Playlist } from './components/Playlist'
import { LyricsDrawer } from './components/LyricsDrawer'
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
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-neutral-800">
        <Music size={24} className="text-green-400 mr-2" />
        <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <Playlist
          tracks={tracks}
          currentIndex={currentIndex}
          onSelectTrack={playTrack}
        />
      </main>

      {/* Player (fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-sm z-30">
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

      {/* Lyrics Drawer */}
      {currentTrack && (
        <LyricsDrawer
          isOpen={isLyricsOpen}
          onClose={handleCloseLyrics}
          lyrics={currentTrack.parsedLyrics}
          translation={currentTrack.parsedTranslation}
          currentTime={currentTime}
          title={currentTrack.title}
          artist={currentTrack.artist}
        />
      )}
    </div>
  )
}

export default App
