import { useEffect, useState } from 'react'
import { Music, ChevronLeft, Type } from 'lucide-react'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { Playlist } from './components/Playlist'
import { Lyrics } from './components/Lyrics'
import { loadTracks } from './utils/loadTracks'
import { APP_NAME, APP_PREFIX } from './config/appKeys'
import type { Track } from './types/track'

const isProd = import.meta.env.PROD
const TRACKS_PATH = isProd ? `/${APP_PREFIX}/tracks` : '/tracks'

function App() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)
  const [lyricsFontSize, setLyricsFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('espatifai-lyrics-fs')
      return saved ? parseInt(saved, 10) : 18
    } catch {
      return 18
    }
  })
  const [showFontSizeSlider, setShowFontSizeSlider] = useState(false)

  useEffect(() => {
    loadTracks(TRACKS_PATH).then(setTracks)
  }, [])

  const {
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    error,
    play,
    pause,
    playTrack,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    clearError,
  } = useAudioPlayer(tracks)

  // Salva tamanho da fonte
  useEffect(() => {
    try {
      localStorage.setItem('espatifai-lyrics-fs', String(lyricsFontSize))
    } catch {
      // ignorar
    }
  }, [lyricsFontSize])

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
      <header className="flex-none flex items-center justify-between px-4 pt-3 pb-3 sm:py-3 border-b border-neutral-800 bg-neutral-950 z-20" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isLyricsOpen && (
            <button onClick={handleCloseLyrics} className="p-1 text-neutral-400 hover:text-white transition-colors flex-shrink-0" aria-label="Voltar para playlist">
              <ChevronLeft size={22} />
            </button>
          )}
          {isLyricsOpen && currentTrack ? (
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-white truncate">{currentTrack.title}</h1>
              <p className="text-xs text-neutral-400 truncate">{currentTrack.artist}</p>
            </div>
          ) : (
            <>
              <Music size={22} className="text-green-400 mr-2 flex-shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-white">{APP_NAME}</h1>
            </>
          )}
        </div>
        {isLyricsOpen && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Font size slider */}
            {showFontSizeSlider && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-neutral-500">A</span>
                <div className="flex items-center gap-0.5 w-24">
                  {[18, 20, 22, 24, 26, 28].map(size => (
                    <button
                      key={size}
                      onClick={() => setLyricsFontSize(size)}
                      className={`flex-1 h-1.5 rounded-full transition-all ${size <= lyricsFontSize ? 'bg-green-400' : 'bg-neutral-700'
                        }`}
                      aria-label={`Fonte tamanho ${size}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500" style={{ fontSize: 14 }}>A</span>
              </div>
            )}
            <button
              onClick={() => setShowFontSizeSlider(!showFontSizeSlider)}
              className={`p-1.5 rounded-full transition-colors ${showFontSizeSlider ? 'text-green-400 bg-green-400/10' : 'text-neutral-400 hover:text-white'
                }`}
              aria-label="Tamanho da fonte"
            >
              <Type size={18} />
            </button>
          </div>
        )}
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-none bg-red-900/80 border-b border-red-700 px-4 py-2 flex items-center justify-center gap-3">
          <p className="text-sm text-red-200 flex-1 text-center">{error}</p>
          <button onClick={clearError} className="text-red-300 hover:text-white text-sm font-medium" aria-label="Fechar erro">
            ✕
          </button>
        </div>
      )}

      {/* Middle: Playlist or Lyrics */}
      <div className="flex-1 overflow-hidden relative">
        {tracks.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">Carregando musicas...</p>
          </div>
        ) : (
          <>
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
                  fontSize={lyricsFontSize}
                  onClose={handleCloseLyrics}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Player (fixed bottom) */}
      <div className="flex-none border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-sm z-20" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}>
        <Player
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          shuffle={shuffle}
          repeat={repeat}
          onPlay={play}
          onPause={pause}
          onNext={nextTrack}
          onPrevious={previousTrack}
          onSeek={seek}
          onVolumeChange={setVolume}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onOpenLyrics={handleOpenLyrics}
        />
      </div>
    </div>
  )
}

export default App
