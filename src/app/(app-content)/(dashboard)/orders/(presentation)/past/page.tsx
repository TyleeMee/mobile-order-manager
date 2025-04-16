"use client";

import OrdersTable from "../orders-table";

export default function PastOrdersPage() {
  return (
    <OrdersTable
      title="注文履歴"
      // fetchOrdersAction={fetchPastOrders}
      apiEndpoint="/api/orders/past" // fetchOrdersActionの代わりにAPIエンドポイントを渡す
      loadingErrorMessage="注文履歴の読み込みに失敗しました"
      emptyMessage="注文履歴はありません"
    />
  );
}
