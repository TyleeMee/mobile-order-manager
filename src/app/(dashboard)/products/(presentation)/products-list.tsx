"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, PencilIcon, PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";

import { Category } from "../../categories/(domain)/category";
import { getSortedProductsInCategory } from "../(application)/products-service";
import { updateProductSequence } from "../(data)/product-sequences-repository";
import { Product } from "../(domain)/product";
import { DeleteProductDialog } from "./delete-product-dialog";

type Props = {
  categories: Category[];
};

export default function ProductsList({ categories }: Props) {
  const user = useAuthenticatedUser();
  const uid = user.uid;
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const productsMap: Record<string, Product[]> = {};

      await Promise.all(
        categories.map(async (category) => {
          try {
            const products = await getSortedProductsInCategory(
              uid,
              category.id
            );
            productsMap[category.id] = products;
          } catch (error) {
            console.error(
              `カテゴリ ${category.title} の商品取得に失敗しました`,
              error
            );
            productsMap[category.id] = []; // エラーハンドリング
          }
        })
      );

      setProductsByCategory(productsMap);
      setLoading(false);
    };

    if (categories.length > 0) {
      loadProducts();
    }
  }, [categories, uid]);

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

    // カテゴリーIDを取得
    const categoryId = source.droppableId;

    // 同じカテゴリー内での順序変更
    if (destination.droppableId === source.droppableId) {
      // まず元の配列をコピーして保存
      const originalProducts = [...(productsByCategory[categoryId] || [])];
      //Array.from() を使って新しい配列を作ることで、元の配列を変更せずに操作できる
      const products = Array.from(originalProducts);
      const [removed] = products.splice(source.index, 1);
      products.splice(destination.index, 0, removed);

      // UIを即座に更新（楽観的UI更新）
      setProductsByCategory({
        ...productsByCategory,
        [categoryId]: products,
      });

      try {
        setIsUpdating(true);
        setUpdateError(null);

        // 順序の永続化 - 商品IDの配列のみを渡す
        await updateProductSequence(
          uid,
          products.map((p) => p.id),
          categoryId
        );
      } catch (error) {
        console.error("商品の順序更新に失敗しました:", error);
        setUpdateError(
          "順序の保存中にエラーが発生しました。再試行してください。"
        );

        // エラー時に元の順序に戻す
        setProductsByCategory({
          ...productsByCategory,
          [categoryId]: originalProducts,
        });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (loading && categories.length > 0) {
    return <div>商品を読み込み中...</div>;
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="pb-2">
              <h2 className="text-lg font-semibold mb-2">{category.title}</h2>
              <Separator className="mb-4" />

              <Droppable droppableId={category.id} type="PRODUCT">
                {(provided) => (
                  <div
                    className="pl-4 space-y-2"
                    //ドロップ可能な領域のDOM要素を参照するためのRefオブジェクト
                    ref={provided.innerRef}
                    //data-*属性などのドラッグ＆ドロップに必要な属性
                    {...provided.droppableProps}
                  >
                    {productsByCategory[category.id]?.map((product, index) => (
                      <Draggable
                        key={product.id}
                        draggableId={product.id}
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
                                {/* 左寄せ：画像と商品名のコンテナ */}
                                <div className="flex items-center pl-4">
                                  {/* relative: 将来的に絶対位置指定の要素（例：ラベルやバッジ）を画像上に配置したい場合に必要
                                flex-shrink-0:商品名が長い場合やコンテナ幅が狭くなった場合に、flexアイテムとしての画像が自動的に縮小されないようにする
                                */}
                                  <div className="relative w-10 h-10 mr-4 flex-shrink-0">
                                    <Image
                                      src={product.imageUrl}
                                      alt={product.title}
                                      width={40}
                                      height={40}
                                      // object-cover:画像が横長の場合は左右が、縦長の場合は上下が切り取られる
                                      className="rounded-md 
                                    object-cover"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">
                                      {product.title}
                                    </h3>
                                  </div>
                                </div>
                                {/* 右寄せ：削除ボタン＋編集ボタン */}
                                <div className="flex gap-2">
                                  <DeleteProductDialog
                                    categoryId={category.id}
                                    product={product}
                                  />
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/products/edit/${product.id}`}>
                                      <PencilIcon />
                                    </Link>
                                  </Button>
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

              <div className="flex justify-end mt-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  {/* <PlusCircleIcon className="h-4 w-4 mr-1" />
              商品を追加する */}
                  <Link href={`/products/create/${category.id}`}>
                    <PlusCircleIcon /> 商品を追加する
                  </Link>
                </Button>
              </div>
            </div>
          ))}
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
