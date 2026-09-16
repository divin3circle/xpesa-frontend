"use client"

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { SortablePackItem } from "./SortablePackItem"
import { getPackFileId, type PackFileState } from "./utils"

export function PackFileList({
  files,
  ids,
  sensors,
  onDragEnd,
  onRemove,
}: {
  files: PackFileState[]
  ids: string[]
  sensors: SensorDescriptor<SensorOptions>[]
  onDragEnd: (event: DragEndEvent) => void
  onRemove: (file: PackFileState) => void
}) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {files.map((file) => (
            <SortablePackItem
              key={getPackFileId(file)}
              file={file}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
