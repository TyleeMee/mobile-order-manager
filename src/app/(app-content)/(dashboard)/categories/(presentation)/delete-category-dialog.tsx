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
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";

import { removeCategory } from "../(application)/categories-service";

// 商品削除ダイアログのプロパティ型定義
type Props = {
  categoryId: string;
  categoryTitle: string; // 削除対象の商品タイトル
};

export function DeleteCategoryDialog({ categoryId, categoryTitle }: Props) {
  const user = useAuthenticatedUser();
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
      await removeCategory(user.uid, categoryId); // 実際の削除処理を実行
      success = true; // エラーが発生しなかった場合のみtrueに設定
    } catch (err) {
      console.error("商品の削除に失敗しました:", err);
      setError("商品の削除中にエラーが発生しました。再試行してください。");
    } finally {
      setIsDeleting(false); // 処理完了後、削除中状態を解除
    }
    // router.pushではなく、完全にページをリロード
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
          <AlertDialogTitle>
            「{categoryTitle}」を削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription>
            「{categoryTitle}
            」のカテゴリー内の商品も削除されます。この操作は元に戻せません。
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
