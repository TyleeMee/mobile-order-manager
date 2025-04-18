"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";

import { getSortedCategories } from "../(application)/categories-service";
import { updateCategorySequence } from "../(data)/category-sequence-repository";
import { Category } from "../(domain)/category";
import EditCategoryDialog from "./(edit)/edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

export default function CategoriesList() {
  const user = useAuthenticatedUser();
  const uid = user.uid;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    // 非同期関数を定義
    const loadSortedCategories = async () => {
      setLoading(true);
      try {
        // カテゴリーの取得
        const sortedCategories = await getSortedCategories(uid);
        setCategories(sortedCategories);
      } catch (error) {
        console.error("カテゴリーの取得に失敗しました:", error);
      }
      setLoading(false);
    };

    // 定義した非同期関数を実行
    loadSortedCategories();
  }, [uid]);

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

    // 同じカテゴリー内での順序変更
    if (destination.droppableId === source.droppableId) {
      const originalCategories = [...categories];
      //Array.from() を使って新しい配列を作ることで、元の配列を変更せずに操作できる
      const copy = Array.from(categories);
      const [removed] = copy.splice(source.index, 1);
      copy.splice(destination.index, 0, removed);

      // UIを即座に更新（楽観的UI更新）
      setCategories(copy);

      try {
        setIsUpdating(true);
        setUpdateError(null);

        // 順序の永続化 - 商品カテゴリーIDの配列を修正
        await updateCategorySequence(
          uid,
          copy.map((p) => p.id)
        );
      } catch (error) {
        console.error("商品カテゴリーの順序更新に失敗しました:", error);
        setUpdateError(
          "順序の保存中にエラーが発生しました。再試行してください。"
        );

        // エラー時に元の順序に戻す
        setCategories(originalCategories);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (loading && categories.length > 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          <Droppable droppableId="categories" type="CATEGORY">
            {(provided) => (
              <div
                className="pl-4 space-y-2"
                //ドロップ可能な領域のDOM要素を参照するためのRefオブジェクト
                ref={provided.innerRef}
                //data-*属性などのドラッグ＆ドロップに必要な属性
                {...provided.droppableProps}
              >
                {categories.map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id}
                    index={index}
                  >
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
                            {/* 左寄せ：商品カテゴリー名 */}
                            <div className="flex items-center pl-4">
                              <div>
                                <h3 className="font-medium">
                                  {category.title}
                                </h3>
                              </div>
                            </div>
                            {/* 右寄せ：削除ボタン＋編集ボタン */}
                            <div className="flex gap-2">
                              <DeleteCategoryDialog
                                categoryId={category.id}
                                categoryTitle={category.title}
                              />
                              <EditCategoryDialog category={category} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                )) || null}
                {
                  //ドラッグ中にドラッグされている要素の「場所取り（「空白領域」）」を表示
                  provided.placeholder
                }
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* 通知エリア */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md shadow-md z-50 animate-fade-in">
          順序を保存中...
        </div>
      )}

      {updateError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-md shadow-md z-50 animate-fade-in">
          {updateError}
        </div>
      )}
    </>
  );
}
