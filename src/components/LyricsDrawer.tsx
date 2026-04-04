import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { LyricsLine } from '../types/track'
import { findActiveLine } from '../utils/parseLrc'

interface LyricsDrawerProps {
  isOpen: boolean
  onClose: () => void
  lyrics: LyricsLine[]
  translation: LyricsLine[]
  currentTime: number
  title: string
  artist: string
}

type TabType = 'lyrics' | 'translation'

export function LyricsDrawer({ isOpen, onClose, lyrics, translation, currentTime, title, artist }: LyricsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics')
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  const lines = activeTab === 'lyrics' ? lyrics : translation
  const activeIndex = findActiveLine(lines, currentTime)

  // Scroll to active line
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

  // Fallback to raw text if no parsed lines
  if (lines.length === 0) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />
        )}
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-2xl transition-transform duration-300 ease-out max-h-[70vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} role="dialog" aria-label="Letra e tradução">
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-neutral-600 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-800">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">{title}</h3>
              <p className="text-sm text-neutral-400 truncate">{artist}</p>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors" aria-label="Fechar letra">
              <X size={20} />
            </button>
          </div>
          <div className="flex border-b border-neutral-800">
            <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'lyrics' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Letra</button>
            <button onClick={() => setActiveTab('translation')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'translation' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Tradução</button>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            <p className="text-sm text-neutral-500 italic">Nenhum timestamp encontrado na letra.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />
      )}

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-2xl transition-transform duration-300 ease-out max-h-[70vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} role="dialog" aria-label="Letra e tradução">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-neutral-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-neutral-800">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <p className="text-sm text-neutral-400 truncate">{artist}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors" aria-label="Fechar letra">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button onClick={() => setActiveTab('lyrics')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'lyrics' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Letra</button>
          <button onClick={() => setActiveTab('translation')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'translation' ? 'text-green-400 border-b-2 border-green-400' : 'text-neutral-400 hover:text-white'}`}>Tradução</button>
        </div>

        {/* Lines */}
        <div ref={containerRef} className="overflow-y-auto flex-1 p-4 space-y-2">
          {lines.map((line, i) => (
            <div key={i} ref={i === activeIndex ? activeLineRef : null} className={`transition-all duration-300 px-2 py-1 rounded ${i === activeIndex ? 'text-white font-semibold scale-[1.02]' : 'text-neutral-500'}`}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
