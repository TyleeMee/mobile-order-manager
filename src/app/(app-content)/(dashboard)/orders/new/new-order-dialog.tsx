"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import OrderDialog from "../order-dialog";
import { OrderWithProductTitles } from "@/models/order";
import { updateOrderStatus } from "@/services/orders-service";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

type NewOrderDialogProps = {
  order: OrderWithProductTitles;
  onStatusChange?: () => void;
  triggerElement: React.ReactElement<
    React.HTMLAttributes<HTMLElement> & Record<string, unknown>
  >;
  // 新しいprops
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function NewOrderDialog({
  order,
  onStatusChange,
  triggerElement,
  open,
  onOpenChange,
}: NewOrderDialogProps) {
  const { token } = useAuthToken();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!token) return; // トークンがない場合は早期リターン
    //TODO token === nullの時、updateOrderStatusが実行されないことになる？
    try {
      setIsSubmitting(true);
      // 注文ステータスを「完了」に更新
      await updateOrderStatus(token, order.id, "served");

      toast({
        title: "商品提供が完了しました",
        description: `受け渡しID: ${order.pickupId}`,
        variant: "success",
      });

      // 状態変更時のコールバック実行（親コンポーネントでの再取得などに利用）
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("注文完了処理中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description: "注文の完了処理に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderDialog
      order={order}
      triggerElement={triggerElement}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Button
        onClick={handleComplete}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "処理中..." : "受け渡し完了"}
      </Button>
    </OrderDialog>
  );
}
