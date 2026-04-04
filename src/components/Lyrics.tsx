import { useEffect, useRef, useState } from 'react'
import type { LyricsLine } from '../types/track'
import { findActiveLine } from '../utils/parseLrc'
import { ChevronLeft } from 'lucide-react'

interface LyricsProps {
  lyrics: LyricsLine[]
  translation: LyricsLine[]
  currentTime: number
  title: string
  artist: string
  onClose: () => void
}

type TabType = 'lyrics' | 'translation' | 'synced'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Lyrics({ lyrics, translation, currentTime, title, artist, onClose }: LyricsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics')
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  const hasTranslation = translation.length > 0

  const activeIndex = activeTab === 'synced'
    ? findActiveLine(lyrics, currentTime)
    : findActiveLine(activeTab === 'lyrics' ? lyrics : translation, currentTime)

  const lines = activeTab === 'lyrics' ? lyrics : translation
  const isSyncedTab = activeTab === 'synced'
  const hasContent = isSyncedTab ? lyrics.length > 0 : lines.length > 0

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current
      const line = activeLineRef.current
      const containerRect = container.getBoundingClientRect()
      const lineRect = line.getBoundingClientRect()
      const offset = lineRect.top - containerRect.top + container.scrollTop - containerRect.height / 3
      container.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }, [activeIndex])

  if (!hasContent) {
    return (
      <div className="flex flex-col h-full bg-neutral-950">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors" aria-label="Voltar para playlist">
            <ChevronLeft size={24} />
          </button>
          <div className="min-w-0 flex-1 text-right">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <p className="text-sm text-neutral-400 truncate">{artist}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-neutral-500 italic">Nenhum timestamp encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors" aria-label="Voltar para playlist">
          <ChevronLeft size={24} />
        </button>
        <div className="min-w-0 flex-1 text-right">
          <h3 className="font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-neutral-400 truncate">{artist}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'lyrics' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Letra</button>
        <button onClick={() => setActiveTab('synced')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'synced' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Sincronizada</button>
        <button onClick={() => setActiveTab('translation')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'translation' ? 'text-green-400 border-b-2 border-green-400' : hasTranslation ? 'text-neutral-400 hover:text-white' : 'text-neutral-700 cursor-not-allowed'}`} disabled={!hasTranslation}>Tradução</button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isSyncedTab ? (
          lyrics.map((line, i) => {
            const isActive = i === activeIndex
            const matchingTranslation = translation.find(t => Math.abs(t.time - line.time) < 0.5)
            return (
              <div key={i} ref={isActive ? activeLineRef : null} className={`transition-all duration-300 ${isActive ? 'scale-[1.02]' : ''}`}>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono text-green-600 w-10 text-right flex-shrink-0">{formatTime(line.time)}</span>
                  <span className={`text-base leading-relaxed ${isActive ? 'text-white font-semibold' : 'text-neutral-500'}`}>{line.text}</span>
                </div>
                {matchingTranslation && (
                  <p className="text-xs text-neutral-600 ml-12 mt-0.5 leading-relaxed">{matchingTranslation.text}</p>
                )}
              </div>
            )
          })
        ) : (
          lines.map((line, i) => (
            <div key={i} ref={i === activeIndex ? activeLineRef : null} className={`transition-all duration-300 px-2 py-1 rounded ${i === activeIndex ? 'text-white font-semibold scale-[1.02]' : 'text-neutral-500'}`}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
