"use client";

import { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";

import { SortableItem } from "@/components/sortable/draggable-item";

type UpdateSequenceFunction = (
  uid: string,
  itemIds: string[],
  parentId?: string
) => Promise<boolean>;

interface UseSortableItemsOptions<T extends SortableItem> {
  initialItems: T[];
  updateSequence: UpdateSequenceFunction;
  uid: string;
  parentId?: string; // カテゴリIDは製品の場合に必要、カテゴリリスト自体の場合は不要
}

export function useSortableItems<T extends SortableItem>({
  initialItems,
  updateSequence,
  uid,
  parentId,
}: UseSortableItemsOptions<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // ドロップ先がない場合や、同じ位置にドロップした場合は何もしない
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // 同じドロップエリア内での順序変更
    if (destination.droppableId === source.droppableId) {
      // まず元の配列をコピーして保存
      const originalItems = [...items];
      const copy = Array.from(items);
      const [removed] = copy.splice(source.index, 1);
      copy.splice(destination.index, 0, removed);

      // UIを即座に更新（楽観的UI更新）
      setItems(copy);

      try {
        setIsUpdating(true);
        setUpdateError(null);

        // 順序の永続化
        if (parentId) {
          // 製品の場合：カテゴリID + 製品IDの配列を更新
          await updateSequence(
            uid,
            copy.map((item) => item.id),
            parentId
          );
        } else {
          // カテゴリの場合：カテゴリIDの配列のみを更新
          await updateSequence(
            uid,
            copy.map((item) => item.id)
          );
        }
      } catch (error) {
        console.error("順序更新に失敗しました:", error);
        setUpdateError(
          "順序の保存中にエラーが発生しました。再試行してください。"
        );

        // エラー時に元の順序に戻す
        setItems(originalItems);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return {
    items,
    setItems,
    isUpdating,
    updateError,
    handleDragEnd,
  };
}
