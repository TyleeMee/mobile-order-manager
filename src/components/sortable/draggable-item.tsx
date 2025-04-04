"use client";

import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import React, { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

// 並べ替え可能なアイテムの基本インターフェース
//(ProductやCategoryを格納できるような型)
export interface SortableItem {
  id: string;
  [key: string]: unknown;
}

// 個別のドラッグ可能なアイテムコンポーネント
export function DraggableItem<T extends SortableItem>({
  item,
  index,
  renderContent,
}: {
  item: T;
  index: number;
  renderContent: (item: T) => ReactNode;
}) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            className={`hover:bg-gray-50 cursor-pointer ${
              snapshot.isDragging ? "shadow-lg" : ""
            }`}
          >
            <CardContent className="p-3 flex items-center justify-between relative">
              {/* ドラッグハンドルインジケーター - 左側 */}
              <div className="absolute left-0 top-0 bottom-0 flex items-center">
                <div className="h-full flex flex-col justify-center px-1">
                  <GripVertical className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              {/* アイテムコンテンツ */}
              {renderContent(item)}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
