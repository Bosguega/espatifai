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

type TabType = 'lyrics' | 'translation'

export function Lyrics({ lyrics, translation, currentTime, title, artist, onClose }: LyricsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics')
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  const lines = activeTab === 'lyrics' ? lyrics : translation
  const activeIndex = findActiveLine(lines, currentTime)

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

  if (lines.length === 0) {
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
        <button onClick={() => setActiveTab('translation')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'translation' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Tradução</button>
      </div>

      {/* Lines */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {lines.map((line, i) => (
          <div key={i} ref={i === activeIndex ? activeLineRef : null} className={`transition-all duration-300 px-2 py-1 rounded ${i === activeIndex ? 'text-white font-semibold scale-[1.02]' : 'text-neutral-500'}`}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}
