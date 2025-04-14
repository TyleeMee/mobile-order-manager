"use client";

import { EyeIcon, PencilIcon } from "lucide-react";
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

  // プレビューURLを生成する関数
  const getPreviewUrl = () => {
    return `https://mobile-order-manager-68e65.web.app/?ownerId=${uid}&mode=device`;
  };

  // プレビューボタンをクリックした時の処理
  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // デバイスがモバイルかどうかを確認
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // モバイルの場合は普通にリンクを開く
      window.open(getPreviewUrl(), "_blank");
    } else {
      // PCの場合は特定のサイズでウィンドウを開く
      const width = 375; // スマホサイズに近いwidthを指定
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      window.open(
        getPreviewUrl(),
        "previewWindow",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-100 border-b py-3 px-4 flex items-center">
        <Button
          variant="outline"
          size="default"
          className="flex items-center gap-2 ml-6"
          onClick={handlePreviewClick}
        >
          <EyeIcon size={18} />
          プレビュー
        </Button>
      </div>

      <div className="space-y-8 max-w-screen-lg mx-auto px-6">
        <div className="flex justify-between items-center mt-6">
          <h1 className="text-lg font-bold mt-6">メニュー</h1>
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
    </div>
  );
}
