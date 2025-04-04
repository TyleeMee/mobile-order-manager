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
  loadingMessage?: string;
  isLoading?: boolean;
};

// 並べ替え可能なリストコンポーネント
export default function SortableList<T extends SortableItem>({
  items,
  droppableId,
  type,
  onDragEnd,
  renderItem,
  loadingMessage = "読み込み中...",
  isLoading = false,
}: SortableListProps<T>) {
  if (isLoading && items.length > 0) {
    return <div>{loadingMessage}</div>;
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
