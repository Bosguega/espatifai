import { X } from 'lucide-react'
import { useState } from 'react'

interface LyricsDrawerProps {
  isOpen: boolean
  onClose: () => void
  lyrics: string
  translation: string
  title: string
  artist: string
}

type TabType = 'lyrics' | 'translation'

export function LyricsDrawer({ isOpen, onClose, lyrics, translation, title, artist }: LyricsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lyrics')

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 rounded-t-2xl transition-transform duration-300 ease-out max-h-[70vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-label="Letra e tradução"
      >
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
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar letra"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'lyrics'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Letra
          </button>
          <button
            onClick={() => setActiveTab('translation')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'translation'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tradução
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed">
            {activeTab === 'lyrics' ? lyrics : translation}
          </pre>
        </div>
      </div>
    </>
  )
}
