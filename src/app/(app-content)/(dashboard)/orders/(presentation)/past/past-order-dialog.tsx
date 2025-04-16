"use client";

import React from "react";

import { OrderWithProductTitles } from "../../(domain)/order";
import OrderDialog from "../order-dialog";

type PastOrderDialogProps = {
  order: OrderWithProductTitles;
  triggerElement: React.ReactElement<
    React.HTMLAttributes<HTMLElement> & Record<string, unknown>
  >;
  // 新しいprops
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function PastOrderDialog({
  order,
  triggerElement,
  open,
  onOpenChange,
}: PastOrderDialogProps) {
  return (
    <OrderDialog
      order={order}
      triggerElement={triggerElement}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
