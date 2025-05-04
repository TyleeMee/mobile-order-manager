"use client";

import React, { cloneElement, ReactElement } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format-date";

import { OrderStatusDisplayName, OrderWithProductTitles } from "@/models/order";

// トリガー要素の型を定義
type TriggerElement = ReactElement<
  React.HTMLAttributes<HTMLElement> & Record<string, unknown>
>;

type OrderDialogProps = {
  order: OrderWithProductTitles;
  triggerElement: TriggerElement;
  children?: React.ReactNode;
  // 新しいprops
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function OrderDialog({
  order,
  triggerElement,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: OrderDialogProps) {
  // 内部状態か外部からの制御かを判断
  const isControlled = controlledOpen !== undefined;

  // トリガー要素をクローンして、onClick属性を追加（制御されていない場合のみ）
  const elementWithClickHandler = !isControlled
    ? cloneElement(triggerElement, {
        onClick: () => controlledOnOpenChange && controlledOnOpenChange(true),
      })
    : triggerElement;

  return (
    <>
      {/* 制御されていない場合、triggerElementを表示 */}
      {!isControlled && elementWithClickHandler}

      {/* ダイアログ */}
      <Dialog open={controlledOpen} onOpenChange={controlledOnOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">ダイアログのタイトル</DialogTitle>
            <DialogDescription className="sr-only">
              注文詳細を閲覧
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">
                注文ステータス
              </p>
              <p>{OrderStatusDisplayName[order.orderStatus]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">受け渡しID</p>
              <p>{order.pickupId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">注文日時</p>
              <p>{formatDate(order.orderDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">合計金額</p>
              <p>{order.total ? `${order.total}円` : "—"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">注文アイテム</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(order.items).map(([productId, quantity]) => (
                <div
                  key={productId}
                  className="flex justify-between py-1 border-b border-gray-100"
                >
                  <div className="text-sm">
                    {quantity} × {order.productTitles[productId] || productId}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 追加のフッター要素（アクションボタンなど） */}
          {children && <DialogFooter className="mt-4">{children}</DialogFooter>}
        </DialogContent>
      </Dialog>
    </>
  );
}
