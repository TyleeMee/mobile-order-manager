"use client";

import React from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";

import { OrderStatusDisplayName, OrderWithProductTitles } from "@/models/order";

type ClickableTableRowProps = {
  order: OrderWithProductTitles;
  onClickAction: (orderId: string) => void;
};

export default function ClickableTableRow({
  order,
  onClickAction,
}: ClickableTableRowProps) {
  // 注文アイテムを表示する関数
  const renderOrderItems = () => {
    return Object.entries(order.items).map(([productId, quantity]) => (
      <div key={productId} className="text-sm">
        {quantity} × {order.productTitles[productId] || productId}
      </div>
    ));
  };

  return (
    <TableRow
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onClickAction(order.id)}
    >
      <TableCell className="hidden md:table-cell">
        {OrderStatusDisplayName[order.orderStatus]}
      </TableCell>
      <TableCell>{order.pickupId}</TableCell>
      <TableCell>{renderOrderItems()}</TableCell>
      <TableCell className="text-right hidden xl:table-cell">
        {formatDate(order.orderDate)}
      </TableCell>
    </TableRow>
  );
}
