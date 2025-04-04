"use client";

import { PencilIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";

import { getSortedCategories } from "../categories/(application)/categories-service";
import { Category } from "../categories/(domain)/category";
import CreateCategoryDialog from "../categories/(presentation)/(create)/create-category-dialog";
import ProductsList from "./(presentation)/products-list";

export default function ProductsPage() {
  const user = useAuthenticatedUser();
  const uid = user.uid;
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // 非同期関数を定義
    const loadSortedCategories = async () => {
      try {
        // カテゴリーの取得
        const sortedCategories = await getSortedCategories(uid);
        setCategories(sortedCategories);
      } catch (error) {
        console.error("カテゴリーの取得に失敗しました:", error);
      }
    };

    // 定義した非同期関数を実行
    loadSortedCategories();
  }, [uid]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mt-6">
        <h1 className="text-2xl font-bold mt-6">メニュー</h1>
        <div className="flex flex-col space-y-2">
          {categories.length > 0 && (
            <>
              <CreateCategoryDialog />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Link href="/categories">
                  <PencilIcon />
                  {categories.length > 1
                    ? "商品カテゴリーの編集と並び替え"
                    : "商品カテゴリーの編集"}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
      {categories.length == 0 && (
        <div className="flex flex-col items-center justify-center text-center pt-24 h-[30vh]">
          <CreateCategoryDialog />
          <h2 className="text-sm font-semibold mt-4">
            商品カテゴリー（例：フード、ドリンク、サイドメニューなど）を作成してから、カテゴリーに商品を登録しましょう
          </h2>
        </div>
      )}
      {categories.length > 0 && <ProductsList categories={categories} />}
    </div>
  );
}
