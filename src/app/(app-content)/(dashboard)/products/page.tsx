"use client";

import { EyeIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";

import { getSortedCategories } from "../categories/(application)/categories-service";
import { Category } from "../categories/(domain)/category";
import ProductsList from "./(presentation)/products-list";

export default function ProductsPage() {
  const user = useAuthenticatedUser();
  const uid = user.uid;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 非同期関数を定義
    const loadSortedCategories = async () => {
      try {
        setLoading(true);
        // カテゴリーの取得
        const sortedCategories = await getSortedCategories(uid);
        setCategories(sortedCategories);
      } catch (error) {
        console.error("カテゴリーの取得に失敗しました:", error);
      } finally {
        setLoading(false);
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

      <ProductsList categories={categories} loading={loading} />
    </div>
  );
}
