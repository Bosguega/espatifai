import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { LyricsLine } from '../types/track'
import { findActiveLine } from '../utils/parseLrc'
import { ChevronLeft, Type } from 'lucide-react'
import { useWakeLock } from '../hooks/useWakeLock'

interface LyricsProps {
  lyrics: LyricsLine[]
  translation: LyricsLine[]
  currentTime: number
  title: string
  artist: string
  onClose: () => void
}

type TabType = 'lyrics' | 'translation' | 'both'

const FONT_SIZES = [12, 14, 16, 18, 20, 24]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const Lyrics = memo(function Lyrics({ lyrics, translation, currentTime, title, artist, onClose }: LyricsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics')
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('espatifai-lyrics-fs')
      return saved ? parseInt(saved, 10) : 16
    } catch {
      return 16
    }
  })
  const [showSizeSlider, setShowSizeSlider] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Impede protecao de tela enquanto lyrics estiver aberto
  useWakeLock()

  // Salva tamanho da fonte
  useEffect(() => {
    try {
      localStorage.setItem('espatifai-lyrics-fs', String(fontSize))
    } catch {
      // ignorar
    }
  }, [fontSize])

  const hasTranslation = translation.length > 0

  // Memoized activeIndex calculation
  const activeIndex = useMemo(() => {
    if (activeTab === 'both') {
      return findActiveLine(lyrics, currentTime)
    }
    const lines = activeTab === 'lyrics' ? lyrics : translation
    return findActiveLine(lines, currentTime)
  }, [activeTab, lyrics, translation, currentTime])

  const lines = activeTab === 'lyrics' ? lyrics : translation
  const isBothTab = activeTab === 'both'
  const hasContent = isBothTab ? lyrics.length > 0 : lines.length > 0

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
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white transition-colors flex-shrink-0" aria-label="Voltar para playlist">
          <ChevronLeft size={24} />
        </button>

        <div className="min-w-0 flex-1 text-right">
          <h3 className="font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-neutral-400 truncate">{artist}</p>
        </div>

        {/* Font size toggle */}
        <button
          onClick={() => setShowSizeSlider(!showSizeSlider)}
          className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${showSizeSlider ? 'text-green-400 bg-green-400/10' : 'text-neutral-400 hover:text-white'
            }`}
          aria-label="Tamanho da fonte"
        >
          <Type size={18} />
        </button>
      </div>

      {/* Font size slider */}
      {showSizeSlider && (
        <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
          <span className="text-xs text-neutral-500 flex-shrink-0">A</span>
          <div className="flex-1 flex items-center gap-1">
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 h-1.5 rounded-full transition-all ${size <= fontSize ? 'bg-green-400' : 'bg-neutral-700'
                  }`}
                aria-label={`Fonte tamanho ${size}`}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500 flex-shrink-0" style={{ fontSize: 14 }}>A</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'lyrics' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Letra</button>
        <button onClick={() => setActiveTab('both')} className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'both' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Ambos</button>
        <button onClick={() => setActiveTab('translation')} className={`flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'translation' ? 'text-green-400 border-b-2 border-green-400' : hasTranslation ? 'text-neutral-400 hover:text-white' : 'text-neutral-700 cursor-not-allowed'}`} disabled={!hasTranslation}>Traducao</button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4" style={{ fontSize }}>
        {isBothTab ? (
          lyrics.map((line, i) => {
            const isActive = i === activeIndex
            const matchingTranslation = translation.find(t => Math.abs(t.time - line.time) < 0.5)
            return (
              <div key={i} ref={isActive ? activeLineRef : null} className={`transition-all duration-300 ${isActive ? 'scale-[1.02]' : ''}`}>
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono text-green-600 w-8 sm:w-10 text-right flex-shrink-0">{formatTime(line.time)}</span>
                  <span className={`leading-relaxed ${isActive ? 'text-white font-semibold' : 'text-neutral-400'}`}>{line.text}</span>
                </div>
                {matchingTranslation && (
                  <p className="text-neutral-500 ml-8 sm:ml-12 mt-0.5 leading-relaxed" style={{ fontSize: fontSize * 0.85 }}>{matchingTranslation.text}</p>
                )}
              </div>
            )
          })
        ) : (
          lines.map((line, i) => (
            <div key={i} ref={i === activeIndex ? activeLineRef : null} className={`transition-all duration-300 px-2 py-1 rounded ${i === activeIndex ? 'text-white font-semibold scale-[1.02]' : 'text-neutral-400'}`}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  )
})
