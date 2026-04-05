import { memo, useState } from 'react'
import { GripVertical, Check } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Track } from '../types/track'

interface PlaylistProps {
  tracks: Track[]
  trackOrder: number[]
  selectedTracks: Set<number>
  currentIndex: number
  onSelectTrack: (index: number) => void
  onToggleTrack: (id: number) => void
  onSelectAll: () => void
  onReorder: (order: number[]) => void
}

function SortableTrackCard({
  track,
  index,
  isActive,
  isSelected,
  onSelect,
  onToggle,
}: {
  track: Track
  index: number
  isActive: boolean
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer group ${isActive
        ? 'bg-green-950/30 border-green-500/50'
        : isSelected
          ? 'bg-neutral-900 border-green-700/30 hover:border-green-600/40'
          : 'bg-neutral-900 border-green-900/20 hover:border-green-800/30'
        }`}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 flex-shrink-0"
      >
        <GripVertical size={16} />
      </div>

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
          ? 'bg-green-500/80 border-green-500/80'
          : 'bg-transparent border-green-800/40 group-hover:border-green-700/50'
          }`}
        aria-label={isSelected ? 'Desselecionar' : 'Selecionar'}
      >
        {isSelected && <Check size={12} className="text-black" />}
      </button>

      {/* Track number / playing indicator */}
      <span className="text-xs font-mono w-5 text-center flex-shrink-0">
        {isActive ? (
          <span className="text-green-400">▶</span>
        ) : (
          <span className="text-neutral-600">{index + 1}</span>
        )}
      </span>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0 ml-1">
        <p className={`text-sm truncate ${isActive ? 'text-green-400 font-medium' : 'text-neutral-300'}`}>
          {track.title}
        </p>
        <p className="text-xs text-neutral-600 truncate">{track.artist}</p>
      </div>
    </div>
  )
}

export const Playlist = memo(function Playlist({
  tracks,
  trackOrder,
  selectedTracks,
  currentIndex,
  onSelectTrack,
  onToggleTrack,
  onSelectAll,
  onReorder,
}: PlaylistProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Get ordered tracks
  const orderedTracks = trackOrder
    .map(id => tracks.find(t => t.id === id))
    .filter((t): t is Track => t !== undefined)

  // Map from track ID to its display index
  const idToDisplayIndex = new Map(orderedTracks.map((t, i) => [t.id, i]))

  // Map from track ID to its original index in the tracks array
  const idToOriginalIndex = new Map(tracks.map((t, i) => [t.id, i]))

  const currentTrackId = currentIndex >= 0 && currentIndex < tracks.length ? tracks[currentIndex].id : -1

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = trackOrder.indexOf(Number(active.id))
    const newIndex = trackOrder.indexOf(Number(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(trackOrder, oldIndex, newIndex))
  }

  return (
    <div className="w-full overflow-y-auto flex-1">
      <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1 sm:px-2">
        <button
          onClick={onSelectAll}
          className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTracks.size === tracks.length
            ? 'bg-green-500/80 border-green-500/80'
            : selectedTracks.size > 0
              ? 'bg-green-500/40 border-green-500/60'
              : 'bg-transparent border-green-800/40 hover:border-green-700/50'
            }`}
          aria-label={selectedTracks.size === tracks.length ? 'Desselecionar tudo' : 'Selecionar tudo'}
        >
          {selectedTracks.size === tracks.length && <Check size={12} className="text-black" />}
        </button>
        <h2 className="text-base sm:text-lg font-semibold">Playlist</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setDraggingId(Number(active.id))}
        onDragEnd={(event) => {
          handleDragEnd(event)
          setDraggingId(null)
        }}
        onDragCancel={() => setDraggingId(null)}
      >
        <SortableContext items={trackOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {orderedTracks.map((track) => {
              const displayIndex = idToDisplayIndex.get(track.id)!
              const originalIndex = idToOriginalIndex.get(track.id)!
              const isActive = track.id === currentTrackId && draggingId === null
              const isSelected = selectedTracks.has(track.id)

              return (
                <SortableTrackCard
                  key={track.id}
                  track={track}
                  index={displayIndex}
                  isActive={isActive}
                  isSelected={isSelected}
                  onSelect={() => onSelectTrack(originalIndex)}
                  onToggle={() => onToggleTrack(track.id)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
})
