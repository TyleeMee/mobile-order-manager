"use client";

import { Trash2Icon } from "lucide-react";
import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteProduct } from "@/services/products-service";
import { Product } from "@/models/product";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

// 商品削除ダイアログのプロパティ型定義
type Props = {
  categoryId: string;
  product: Product;
};

export function DeleteProductDialog({ categoryId, product }: Props) {
  const { token } = useAuthToken();
  // 削除中の状態管理
  const [isDeleting, setIsDeleting] = React.useState(false);
  // エラーメッセージの状態管理
  const [error, setError] = React.useState<string | null>(null);

  // 削除処理を実行する関数
  const handleDelete = async () => {
    let success = false;
    try {
      setIsDeleting(true); // 削除中状態を設定
      setError(null); // エラーをリセット
      // サーバーサイドで画像も含めた削除処理を実行
      await deleteProduct(token, product.id, categoryId, product.imagePath);
      success = true; // エラーが発生しなかった場合のみtrueに設定
    } catch (err) {
      console.error("商品の削除に失敗しました:", err);
      setError("商品の削除中にエラーが発生しました。再試行してください。");
    } finally {
      setIsDeleting(false); // 処理完了後、削除中状態を解除
    }

    // エラーが発生しなかった場合のみリダイレクト
    if (success) {
      window.location.href = "/products";
    }
  };

  return (
    <AlertDialog>
      {/* ダイアログを開くトリガーボタン */}
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      {/* ダイアログの内容 */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>商品を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{product.title}」を削除します。この操作は元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* エラーメッセージがある場合に表示 */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <AlertDialogFooter>
          {/* キャンセルボタン - 削除中は無効化 */}
          <AlertDialogCancel disabled={isDeleting}>
            キャンセル
          </AlertDialogCancel>
          {/* 削除実行ボタン - 削除中は無効化し、テキストを変更 */}
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
