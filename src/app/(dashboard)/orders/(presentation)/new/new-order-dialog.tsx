"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";

import {
  changeOrderStatus,
  OrderWithProductTitles,
} from "../../(application)/orders-service";
import OrderDialog from "../order-dialog";

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
  const { toast } = useToast();
  const user = useAuthenticatedUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      // 注文ステータスを「完了」に更新
      await changeOrderStatus(user.uid, order.id, "served");

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
