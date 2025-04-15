"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import React, { ReactNode } from "react";

import { DraggableItem, SortableItem } from "./draggable-item";

type SortableListProps<T extends SortableItem> = {
  items: T[];
  droppableId: string;
  type: string;
  onDragEnd: (result: DropResult) => void;
  renderItem: (item: T) => ReactNode;
  isLoading?: boolean;
};

// 並べ替え可能なリストコンポーネント
export default function SortableList<T extends SortableItem>({
  items,
  droppableId,
  type,
  onDragEnd,
  renderItem,
  isLoading = false,
}: SortableListProps<T>) {
  if (isLoading && items.length > 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-8">
        <Droppable droppableId={droppableId} type={type}>
          {(provided) => (
            <div
              className="pl-4 space-y-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {items.map((item, index) => (
                <DraggableItem<T>
                  key={item.id}
                  item={item}
                  index={index}
                  renderContent={renderItem}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
