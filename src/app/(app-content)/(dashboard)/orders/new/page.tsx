"use client";

import { getNewOrders } from "@/services/orders-service";
import OrdersTable from "../orders-table";

export default function NewOrdersPage() {
  return (
    <OrdersTable
      title="新規オーダーリスト"
      fetchOrdersAction={getNewOrders}
      loadingErrorMessage="新規オーダーの読み込みに失敗しました"
      emptyMessage="新規オーダーはありません"
      isNewOrderTable={true}
    />
  );
}
